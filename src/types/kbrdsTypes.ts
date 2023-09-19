import { InlineKeyboardButton } from 'node-telegram-bot-api';

export interface InlineKeyboardButtonWithContact extends InlineKeyboardButton {
  request_contact?: boolean;
}

export interface IKbrds {
  service: {
    goMain: InlineKeyboardButton[][];
  };

  orders: {
    addOrder: InlineKeyboardButton[][];
    ordersMenu: InlineKeyboardButton[][];
    ordersMenuAdm: InlineKeyboardButton[][];
  };

  users: {
    contact: InlineKeyboardButtonWithContact[][];
  };
}

export interface IInlineKbrds {
  order: {
    myOrder: (args: { date: string; orderId: string }) => InlineKeyboardButton[][];
    elOflistFreeDates: (args: { text: string; formattedData: string }) => InlineKeyboardButton[];
  };
}
