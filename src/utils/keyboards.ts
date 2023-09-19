import { IInlineKbrds, IKbrds } from '../types/kbrdsTypes';
import { Text } from '../enums/official.text';
import { TriggersBot } from '../enums/triggers.bot';

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
    myOrder: ({ date, orderId }) => [
      [
        {
          text: `${Text.DELETE} ${date}`,
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
