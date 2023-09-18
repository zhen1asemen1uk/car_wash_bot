import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import moment from 'moment';

import { Text } from '../enums/official.text';

import { sendError } from '../utils/sendError';
import { checkOrder, checkUser } from '../utils/checkers';

import { sendOrdersToUser } from '../utils/sendOrdersToUser';
import { orderModel } from '../models/order.model';
import { userModel } from '../models/user.model';

import { Order } from '../db/Schemas/Order';
import { kbrds } from '../utils/keyboards';
import { partOfDay, simpleDate } from '../helpers/dateHelpers';

export const onCallbackDataListner = (bot: TelegramBot) => {
  // Listen for any kind of message. There are different kinds of messages.
  bot.on('callback_query', async (query: CallbackQuery) => {
    const chatId = query?.message?.chat.id!;
    const msgFromId = query?.from?.id;
    const { data } = query;
    // const text = query?.message?.text;

    if (!msgFromId || !data) {
      return sendError({
        bot,
        errMessage: Text.SOMETHING_WENT_WRONG,
        error: `
  msgFromId: ${!!msgFromId}
  chatId: ${!!chatId}
  data: ${!!data}`,
        chatId,
      });
    }
    console.log('-----------(onCallbackData)------------');
    console.log('chatId', chatId);
    console.log('msgFromId', msgFromId);
    console.log('data', data);
    // console.log('text', text);

    // const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    // const unixTimeStampPattern = /^\d{10}$/;

    // remove order
    if (data?.includes('removeId')) {
      try {
        const parsedObj = JSON.parse(data);

        const removedOrder = await orderModel.removeOrderById({ _id: parsedObj.removeId });

        if (removedOrder) {
          console.log(`Order with ID ${parsedObj.removeId} was successfully removed.`);
          await bot.sendMessage(
            chatId,
            `${Text.ORDER_REMOVED}\n*(${moment(removedOrder.serviceDate).format(
              'DD.MM.YYYY',
            )}) ${partOfDay(moment(removedOrder.serviceDate).toDate())}*`,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                keyboard: kbrds.orders.addOrder,
              },
            },
          );
        } else {
          return sendError({
            bot,
            error: `Order with ID ${parsedObj.removeId} was not found`,
            chatId,
          });
        }
      } catch (error) {
        return sendError({
          bot,
          error,
          chatId,
        });
      }
    } else {
      // create order
      try {
        const dataArr: string[] = JSON.parse(data);

        const formettedToDate = moment.unix(+dataArr[2]).toDate();

        const user = await userModel.getUserByTelegramId({ telegramId: +msgFromId });

        if (!user) {
          return sendError({
            bot,
            errMessage: Text.SOMETHING_WENT_WRONG,
            error: `
            User not found by telegramId: ${msgFromId}
            user: ${user}`,
            chatId,
          });
        }

        const strId = user!._id;

        const order: InstanceType<typeof Order> = new Order({
          carBrand: dataArr[0],
          carNumber: dataArr[1],
          serviceDate: moment(formettedToDate).toDate(),
          userId: strId,
        });

        const userChecker = await checkUser({
          bot,
          user,
          chatId,
          order,
          msgFromId,
        });

        const orderChecker = await checkOrder({
          formettedToDate,
          bot,
          chatId,
          order,
        });

        if (!userChecker || !orderChecker) {
          return sendError({
            bot,
            errMessage: '',
            error: `
  Checkers failed:
  userChecker: ${!!userChecker}
  orderChecker: ${!!orderChecker}
            `,
            chatId,
          });
        }

        // create order
        const newOrder = await orderModel.createOrder(order);

        await bot.sendMessage(
          chatId,
          `${Text.ORDER_CREATED}\n*(${simpleDate(moment.unix(+dataArr[2]).toDate())}) ${partOfDay(
            formettedToDate,
          )}*`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: kbrds.orders.ordersMenu,
            },
          },
        );

        // send message to all admins
        const allAdmins = await userModel.getAllAdmins();

        return allAdmins.map(async admin => {
          try {
            const chatData = await bot.getChat(chatId);
            console.log('chatData', chatData);

            await bot.sendMessage(
              admin.telegramId,
              `*${Text.NEW_ORDER}*\n${sendOrdersToUser({
                orders: [newOrder],
              })}`,
              {
                parse_mode: 'Markdown',
              },
            );
          } catch (error) {
            console.error(
              `Can not send message to admin, the problem with Chat ID: ${admin.telegramId}\nUser: ${admin.fullName}`,
            );

            return sendError({
              bot,
              error,
              chatId,
            });
          }
        });
      } catch (error) {
        return sendError({
          bot,
          error,
          chatId,
          errMessage: Text.SOMETHING_WENT_WRONG,
          arrBtns: kbrds.orders.ordersMenu,
        });
      }
    }
  });
};
