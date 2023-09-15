import TelegramBot from 'node-telegram-bot-api';

import { userModel } from '../models/user.model';

import { TriggersBot } from '../enums/triggers.bot';
import { Text } from '../enums/official.text';
import { Roles } from '../enums/roles';

export const onContactListner = (bot: TelegramBot) => {
  // listen for incoming messages of type 'contact'
  bot.on('contact', async msg => {
    // the user's id that is sending the message
    const contact_user_id = msg?.contact?.user_id;

    // the user's id that is receiving the message
    const msgFromId = msg?.from?.id;
    if (!msgFromId) return; // TO DO: add error handler

    // check if the msg is from the user you're expecting
    if (msgFromId === contact_user_id) {
      // handle the user's phone number
      const phone_number = +msg?.contact?.phone_number!;

      if (!phone_number) return; // TO DO: add error handler

      const user = await userModel.getUserByTelegramId({ telegramId: msgFromId });

      if (!user) {
        const new_user = await userModel.createUser({
          username: msg?.from?.username!,
          fullName: msg?.from?.first_name!,
          telegramId: msgFromId,
          phoneNumber: +phone_number,
          role: Roles.USER,
        });

        return await bot.sendMessage(
          msg.chat.id,
          `${new_user.fullName} ${Text.YOU_ARE_SUCCESSFULLY_REGISTERED}`,
          {
            reply_markup: {
              keyboard: [[{ text: TriggersBot.ADD_ORDER }]],
            },
          },
        );
      }

      return await bot.sendMessage(msg.chat.id, `${Text.HI_AGAINE}, ${user.fullName} 👋🏻`, {
        reply_markup: {
          keyboard: [[{ text: TriggersBot.MY_ORDERS }, { text: TriggersBot.ADD_ORDER }]],
        },
      });
    }
  });
};
