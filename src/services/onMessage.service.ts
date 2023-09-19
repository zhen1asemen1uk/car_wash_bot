import TelegramBot, { Message } from 'node-telegram-bot-api';
import moment from 'moment';

import { TriggersBot } from '../enums/triggers.bot';
import { Text } from '../enums/official.text';

import { ask } from '../utils/ask';
import { keybordWithDates } from '../utils/keybordWithDates';
import { sendOrdersToUser } from '../utils/sendOrdersToUser';

import { userModel } from '../models/userModel';
import { orderModel } from '../models/orderModel';

import { IQuestion } from '../types/types';
import { OrderKeys } from '../types/orderTypes';
import { inlineKbrds, kbrds } from '../utils/keyboards';
import { simpleDate } from '../helpers/dateHelpers';
import { sendError } from '../utils/sendError';

export const onMessageListner = (bot: TelegramBot) => {
  bot.on('message', async (msg: Message) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const msgFromId = msg?.from?.id;

    console.log('-----------(onMessage)------------');
    console.log('chatId', chatId);
    console.log('text', text);
    console.log('msgFromId', msgFromId);

    if (!msgFromId || !chatId || !text) {
      return sendError({
        bot,
        error: `
  Check the following:
  msgFromId: ${!!msgFromId}
  text: ${!!text}
  chatId: ${!!chatId}`,
        chatId,
      });
    }

    if (text.includes(TriggersBot.GO_MAIN)) {
      return await bot.sendMessage(chatId, TriggersBot.GO_MAIN, {
        reply_markup: {
          keyboard: kbrds.orders.ordersMenu,
        },
      });
    } else if (text.includes(TriggersBot.CANCEL)) {
      return await bot.sendMessage(chatId, `${Text.YOUR_ORDER_CANCELED}`, {
        reply_markup: {
          keyboard: kbrds.orders.ordersMenu,
        },
      });
    } else if (text.includes(TriggersBot.MY_ORDERS)) {
      // find all orders by user id from today and 11 working days
      try {
        const user = await userModel.getUserByTelegramId({ telegramId: +msgFromId });

        if (!user || !user._id) {
          return sendError({
            bot,
            error: `
  Check the following:
  user: ${!!user}
  user._id: ${!!user?._id}`,
            chatId,
          });
        }

        const orders = await orderModel.getOrdersByDateWithUser({
          userId: user._id.toString(),
          gte: moment().startOf('day').utc().toDate(),
          lte: moment().add(11, 'days').endOf('day').utc().toDate(),
        });

        if (!orders.length)
          return await bot.sendMessage(chatId, TriggersBot.HERE_EMPTY, {
            reply_markup: {
              keyboard: kbrds.orders.ordersMenu,
            },
          });

        return orders.map(async order => {
          return await bot.sendMessage(
            chatId,
            `
*${Text.ORDERS} :*
${sendOrdersToUser({ orders: [order] })}`,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: inlineKbrds.order.myOrder({
                  date: simpleDate(order.serviceDate),
                  orderId: order._id.toString(),
                }),
              },
            },
          );
        });
      } catch (error) {
        return sendError({
          bot,
          error,
          chatId,
        });
      }
    } else if (text.includes(TriggersBot.ADD_ORDER)) {
      // 1, and 2 questions
      const questions: IQuestion[] = [
        { key: 'carBrand', question: Text.ENTER_CAR_BRAND },
        { key: 'carNumber', question: Text.ENTER_CAR_NUMBER },
      ];

      const order: OrderKeys = await ask({ bot, chatId, questions });

      const keyboard = await keybordWithDates(order);

      // 3 question
      return await bot.sendMessage(chatId, `${Text.CHOOSE_PART_OF_DAY}`, {
        reply_markup: {
          inline_keyboard: keyboard,
          resize_keyboard: true,
        },
      });
    } else if (text.includes(TriggersBot.TODAY_ORDERS)) {
      const todayDate = moment().endOf('day').utc().toDate();
      const formattedDate = simpleDate(todayDate);

      const todayOrders = await orderModel.getOrdersByDateWithUser({
        date: todayDate,
      });

      if (!todayOrders.length)
        return await bot.sendMessage(chatId, TriggersBot.HERE_EMPTY, {
          reply_markup: {
            keyboard: kbrds.orders.ordersMenuAdm,
          },
        });

      return await bot.sendMessage(
        chatId,
        `*${Text.TODAY}* (${formattedDate})👇🏻:\n${sendOrdersToUser({
          orders: todayOrders,
          isAdmin: true,
        })}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: kbrds.orders.ordersMenuAdm,
          },
        },
      );
    } else if (text.includes(TriggersBot.TOMORROW_ORDERS)) {
      const tomorrowDate = moment().add(1, 'days').endOf('day').toDate();

      const formattedTomorrowDate = simpleDate(tomorrowDate);

      const tomorrowOrders = await orderModel.getOrdersByDateWithUser({
        gte: moment().add(1, 'days').startOf('day').toDate(),
        lte: tomorrowDate,
      });

      if (!tomorrowOrders.length)
        return await bot.sendMessage(chatId, TriggersBot.HERE_EMPTY, {
          reply_markup: {
            keyboard: kbrds.orders.ordersMenuAdm,
          },
        });

      return await bot.sendMessage(
        chatId,
        `*${Text.TOMORROW}* (${formattedTomorrowDate})👇🏻:\n${sendOrdersToUser({
          orders: tomorrowOrders,
          isAdmin: true,
        })}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: kbrds.orders.ordersMenuAdm,
          },
        },
      );
    } else if (text.includes(TriggersBot.ALL_ORDER)) {
      const elevenDays = moment().add(11, 'days').endOf('day').toDate();

      const formattedElevenDays = simpleDate(elevenDays);

      const allOrders = await orderModel.getOrdersByDateWithUser({
        gte: moment().startOf('day').toDate(),
        lte: elevenDays,
      });

      if (!allOrders.length)
        return await bot.sendMessage(chatId, TriggersBot.HERE_EMPTY, {
          reply_markup: {
            keyboard: kbrds.orders.ordersMenuAdm,
          },
        });

      return await bot.sendMessage(
        chatId,
        `*${Text.ALL_ORDERS_TO} (${formattedElevenDays})*👇🏻:\n${sendOrdersToUser({
          orders: allOrders,
          isAdmin: true,
        })}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: kbrds.orders.ordersMenuAdm,
          },
        },
      );
    } else {
      console.error('onMessageListner: text not found\ntext:', text);
    }
  });
};
