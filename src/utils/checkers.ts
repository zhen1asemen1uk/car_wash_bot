import moment from 'moment';
import TelegramBot from 'node-telegram-bot-api';

import { Order } from '../db/Schemas/Order';
import { User } from '../db/Schemas/User';

import { keybordWithDates } from './keybords';

import { orderModel } from '../models/order.model';

import { sendError } from './error';

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
      errMessage: `❌ Сталася неочікувана помилка.\nЗверніться до адміністратора`,
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
      errMessage: `❌ Вибачте ви вже записалися.\nПриходьте після того, як ваш автомобіль помиють`, // TO DO: add to time !!!!
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
      errMessage: `❌ Вибачте хтось вас випередив, спробуйте записатись знову`, // TO DO: add to time !!!!
      arrBtns: await keybordWithDates(order),
    });
    return false;
  }

  return true;
};
