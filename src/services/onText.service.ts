import TelegramBot from "node-telegram-bot-api";

import { EnvNames } from "../enums/env.names";
import { TriggersBot } from "../enums/triggers.bot";

import { User } from "../db/Schemas/User";
import { getEnv } from "../helpers/env_helper";
import { Text } from "../enums/official.text";

// replace the value below with the Telegram TELEGRAM_API_TOKEN you receive from @BotFather

const HOST = getEnv(EnvNames.HOST);

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
