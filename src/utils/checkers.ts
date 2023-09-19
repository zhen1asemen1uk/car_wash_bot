import moment from 'moment';
import TelegramBot from 'node-telegram-bot-api';

import { Order } from '../db/Schemas/Order';
import { User } from '../db/Schemas/User';

import { keybordWithDates } from './keybordWithDates';

import { orderModel } from '../models/orderModel';

import { sendError } from './sendError';
import { Text } from '../enums/official.text';

interface ICheckUser {
  bot: TelegramBot;
  user: InstanceType<typeof User>;
  chatId: number;
  order: InstanceType<typeof Order>;
  msgFromId: number;
}

export const checkUser = async ({ bot, user, chatId, order, msgFromId }: ICheckUser) => {
  if (!user || !user._id) {
    await sendError({
      bot,
      error: 'User not exists',
      chatId,
      inlineBoard: true,
      errMessage: Text.SOMETHING_WENT_WRONG,
      arrBtns: await keybordWithDates(order),
    });
    return false;
  }

  return user;
};

interface ICheckOrder {
  formettedToDate: Date;
  bot: TelegramBot;
  chatId: number;
  order: InstanceType<typeof Order>;
}

export const checkOrder = async ({ formettedToDate, bot, chatId, order }: ICheckOrder) => {
  // check if user already exists
  const todayDay = moment().startOf('day').utc().toDate();
  const elevenDays = moment().add(11, 'days').endOf('day').utc().toDate();

  const orderUser = await orderModel.getOrdersByDate({
    gte: todayDay,
    lte: elevenDays,
  });

  const isExists = orderUser.some(ord => ord.userId.toString() === order['userId'].toString());

  if (isExists) {
    await sendError({
      bot,
      error: 'User already exists',
      chatId,
      errMessage: Text.SOMETHING_WENT_WRONG,
    });

    return false;
  }

  // check if order with same time already exists
  const orderUnique = await orderModel.getOrdersByDate({
    date: moment(formettedToDate).utc().toDate(),
  });

  if (orderUnique && orderUnique.length > 0) {
    await sendError({
      bot,
      error: 'Order already exists',
      chatId,
      inlineBoard: true,
      errMessage: Text.SOMETHING_WENT_WRONG,
      arrBtns: await keybordWithDates(order),
    });

    return false;
  }

  return true;
};
