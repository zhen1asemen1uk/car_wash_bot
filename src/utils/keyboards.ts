import { TriggersBot } from '../enums/triggers.bot';
import { IInlineKbrds, IKbrds } from '../types/kbrdsTypes';

const kbrds: IKbrds = {
  service: {
    goMain: [[{ text: TriggersBot.GO_MAIN }]],
  },

  orders: {
    addOrder: [[{ text: TriggersBot.ADD_ORDER }]],
    ordersMenu: [[{ text: TriggersBot.MY_ORDERS }, { text: TriggersBot.ADD_ORDER }]],
    ordersMenuAdm: [
      [{ text: TriggersBot.TODAY_ORDERS }],
      [{ text: TriggersBot.TOMORROW_ORDERS }],
      [{ text: TriggersBot.ALL_ORDER }],
    ],
  },

  users: {
    contact: [
      [
        {
          text: `${TriggersBot.SHARE_PHONE_NUMBER_PLS}:`,
          request_contact: true,
        },
      ],
    ],
  },
};

const inlineKbrds: IInlineKbrds = {
  order: {
    myOrer: ({ date, orderId }) => [
      [
        {
          text: `Видалити ${date}`,
          callback_data: `{"removeId":"${orderId}"}`,
        },
      ],
    ],
    elOflistFreeDates: ({ text, formattedData }) => [
      {
        text: text,
        callback_data: `${formattedData}`,
      },
    ],
  },
};

export { kbrds, inlineKbrds };
