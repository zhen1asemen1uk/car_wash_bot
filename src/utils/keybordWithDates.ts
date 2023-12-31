import moment, { Moment } from 'moment-timezone';
import { InlineKeyboardButton } from 'node-telegram-bot-api';

import { orderModel } from '../models/orderModel';
import { OrderKeys } from '../types/orderTypes';
import { partOfDay, simpleDate } from '../helpers/dateHelpers';
import { inlineKbrds } from './keyboards';

const getAvailableDates = async (freeDates: Moment[]) => {
  const elevenDays = moment().add(11, 'days').endOf('day').toDate();

  const orders = await orderModel.getOrdersByDate({
    gte: moment().startOf('day').utc().toDate(),
    lte: elevenDays,
  });

  const newOrders = orders.map(order => {
    const dateString = moment(order.serviceDate).format('YYYY-MM-DD HH:mm:ss');
    return dateString;
  });

  const newFreeDates = freeDates.map(date => {
    const dateString = date.format('YYYY-MM-DD HH:mm:ss');

    return dateString;
  });

  const availableDates = newFreeDates.filter(date => !newOrders.includes(date));

  return availableDates;
};

const getRangeOfDates = async () => {
  const tomorroStartDay = moment().add(1, 'day');
  const tomorroEndDay = moment().add(1, 'day');

  tomorroStartDay.startOf('day');
  tomorroEndDay.endOf('day');

  // only workdays + 10 days
  const freeDates = Array.from({ length: 10 }, (_, i) => {
    const dateStart = tomorroStartDay.clone().add(i, 'day');

    const dateEnd = tomorroEndDay.clone().add(i, 'day');

    const dayStart = dateStart.day();
    const dayEnd = dateEnd.day();

    if (dayStart === 0 || dayEnd === 6 || dayEnd === 0 || dayStart === 6) {
      return null;
    }
    return [dateStart, dateEnd];
  })
    .flatMap(e => e)
    .filter(date => date !== null) as Moment[];

  return await getAvailableDates(freeDates);
};

export const keybordWithDates = async (order: OrderKeys): Promise<InlineKeyboardButton[][]> => {
  const freeDates = await getRangeOfDates();

  const newKeyboard: InlineKeyboardButton[][] = [];

  freeDates.map(date => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = moment(date).tz(timezone).toDate();

    const formattedData = JSON.stringify([
      order.carBrand,
      order.carNumber,
      moment(localDate).unix(),
    ]);

    const formattedText = simpleDate(localDate) + ' | ' + partOfDay(moment(localDate).toDate());

    newKeyboard.push(
      inlineKbrds.order.elOflistFreeDates({ text: formattedText, formattedData: formattedData }),
    );
  });

  return newKeyboard;
};
