import TelegramBot from 'node-telegram-bot-api';

import { userModel } from '../models/user.model';

import { Text } from '../enums/official.text';
import { Roles } from '../enums/roles';
import { kbrds } from '../utils/keyboards';

export const onContactListner = (bot: TelegramBot) => {
  // listen for incoming messages of type 'contact'
  bot.on('contact', async msg => {
    const contact_user_id = msg?.contact?.user_id;
    const msgFromId = msg?.from?.id;

    console.log('-----------(onContact)------------');
    console.log('contact_user_id', contact_user_id);
    console.log('msgFromId', msgFromId);

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
              keyboard: kbrds.orders.addOrder,
            },
          },
        );
      }

      return await bot.sendMessage(msg.chat.id, `${Text.HI_AGAINE}, ${user.fullName} 👋🏻`, {
        reply_markup: {
          keyboard: kbrds.orders.ordersMenu,
        },
      });
    }
  });
};
