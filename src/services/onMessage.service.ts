import TelegramBot, { Message } from 'node-telegram-bot-api';
import moment from 'moment';

import { TriggersBot } from '../enums/triggers.bot';
import { Text } from '../enums/official.text';

import { ask } from '../utils/ask';
import { keybordWithDates } from '../utils/keybordWithDates';
import { sendOrdersToUser } from '../utils/sendOrdersToUser';

import { userModel } from '../models/user.model';
import { orderModel } from '../models/order.model';

import { IQuestion } from '../types/types';
import { OrderKeys } from '../types/orderTypes';
import { inlineKbrds, kbrds } from '../utils/keyboards';
import { simpleDate } from '../helpers/dateHelpers';

export const onMessageListner = (bot: TelegramBot) => {
  bot.on('message', async (msg: Message) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const msgFromId = msg?.from?.id;

    console.log('-----------(onMessage)------------');
    console.log('chatId', chatId);
    console.log('text', text);
    console.log('msgFromId', msgFromId);

    if (!msgFromId || !chatId) return; // TO DO: add error handler

    switch (text) {
      case TriggersBot.GO_MAIN:
        return await bot.sendMessage(chatId, TriggersBot.GO_MAIN, {
          reply_markup: {
            keyboard: kbrds.orders.ordersMenu,
          },
        });

      case TriggersBot.CANCEL:
        return await bot.sendMessage(chatId, `${Text.YOUR_ORDER_CANCELED}`, {
          reply_markup: {
            keyboard: kbrds.orders.ordersMenu,
          },
        });

      case TriggersBot.MY_ORDERS:
        // find all orders by user id from today and 11 working days
        try {
          const user = await userModel.getUserByTelegramId({ telegramId: +msgFromId });

          if (!user || !user._id) return; // TO DO: add error message

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

          return await bot.sendMessage(chatId, '*Замовлення:*\n' + sendOrdersToUser({ orders }), {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: inlineKbrds.order.myOrer({
                date: simpleDate(orders[0].serviceDate),
                orderId: orders[0]._id.toString(),
              }),
            },
          });
        } catch (error) {
          console.error(error);
        }

      case TriggersBot.ADD_ORDER:
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

      case TriggersBot.TODAY_ORDERS:
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
          `*Сьогодні* (${formattedDate})👇🏻:\n${sendOrdersToUser({
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

      case TriggersBot.TOMORROW_ORDERS:
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
          `*Завтра* (${formattedTomorrowDate})👇🏻:\n${sendOrdersToUser({
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

      case TriggersBot.ALL_ORDER:
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
          `*Всі записи до (${formattedElevenDays})*👇🏻:\n${sendOrdersToUser({
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

      default:
        break;
    }
  });
};
