import TelegramBot from "node-telegram-bot-api";

import { TriggersBot } from "../enums/triggers.bot";
import { User } from "../db/Schemas/User";

import { Text } from "../enums/official.text";
import { Roles } from "../enums/roles";

// replace the value below with the Telegram TELEGRAM_API_TOKEN you receive from @BotFather

export const onTextListner = (bot: TelegramBot) => {
    // listen for messages that match the /start command
    bot.onText(/\/start/, async (msg) => {
        const msgFromId = msg?.from?.id;
        const chatId = msg.chat.id;
        const keyboard = {
            keyboard: [
                [
                    {
                        text: `${Text.SHARE_PHONE_NUMBER_PLS}:`,
                        request_contact: true,
                    },
                ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        };

        const user = await User.findOne({ telegramId: msgFromId });

        if (!user) {
            // send a message with the keyboard to the user
            return await bot.sendMessage(
                chatId,
                `${Text.SHARE_PHONE_NUMBER_PLS}:`,
                {
                    reply_markup: keyboard,
                }
            );
        } else if (user.role.includes(Roles.ADMIN)) {
            return await bot.sendMessage(
                chatId,
                `${Text.HI_ADMIN}, ${user.fullName} 👋🏻`,
                {
                    reply_markup: {
                        keyboard: [
                            [{ text: TriggersBot.TODAY_ORDERS }],
                            [{ text: TriggersBot.TOMORROW_ORDERS }],
                            [{ text: TriggersBot.ALL_ORDER }],
                        ],
                        resize_keyboard: true,
                    },
                }
            );
        } else {
            return await bot.sendMessage(
                chatId,
                `${Text.HI_AGAINE}, ${user.fullName} 👋🏻`,
                {
                    reply_markup: {
                        keyboard: [
                            [
                                { text: TriggersBot.MY_ORDERS },
                                { text: TriggersBot.ADD_ORDER },
                            ],
                        ],
                        resize_keyboard: true,
                    },
                }
            );
        }
    });
};
