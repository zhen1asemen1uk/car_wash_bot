import TelegramBot from 'node-telegram-bot-api';

import { TriggersBot } from '../enums/triggers.bot';

import { Text } from '../enums/official.text';
import { Roles } from '../enums/roles';
import { userModel } from '../models/userModel';
import { kbrds } from '../utils/keyboards';

export const onTextListner = (bot: TelegramBot) => {
  // listen for messages that match the /start command
  bot.onText(/\/start/, async msg => {
    const msgFromId = msg?.from?.id;
    const chatId = msg.chat.id;

    console.log('-----------(onText)------------');
    console.log('chatId', chatId);
    console.log('msgFromId', msgFromId);

    const user = await userModel.getUserByTelegramId({ telegramId: Object(msgFromId) });

    if (!user) {
      // send a message with the keyboard to the user
      return await bot.sendMessage(chatId, `${TriggersBot.SHARE_PHONE_NUMBER_PLS}:`, {
        reply_markup: {
          keyboard: kbrds.users.contact,
          one_time_keyboard: true,
        },
      });
    } else if (user.role.includes(Roles.ADMIN)) {
      return await bot.sendMessage(chatId, `${Text.HI_ADMIN}, ${user.fullName} 👋🏻`, {
        reply_markup: {
          keyboard: kbrds.orders.ordersMenuAdm,
        },
      });
    } else {
      return await bot.sendMessage(chatId, `${Text.HI_AGAINE}, ${user.fullName} 👋🏻`, {
        reply_markup: {
          keyboard: kbrds.orders.ordersMenu,
        },
      });
    }
  });
};
