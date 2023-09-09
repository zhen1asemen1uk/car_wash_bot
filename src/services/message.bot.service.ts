import TelegramBot, {
    Message,
    KeyboardButton,
    InlineKeyboardButton,
} from "node-telegram-bot-api";
import moment from "moment";
import { ObjectId } from "mongodb";

import { EnvNames } from "../enums/env.names";
import { TriggersBot } from "../enums/triggers.bot";

import { User } from "../db/Schemas/User";

import { getEnv } from "../helpers/env_helper";

import { sendMessageInParts } from "../utils/send-message-in-parts";
import { Text } from "../enums/official.text";
import { Order } from "../db/Schemas/Order";

// replace the value below with the Telegram TELEGRAM_API_TOKEN you receive from @BotFather

const HOST = getEnv(EnvNames.HOST);

export const messageListner = (bot: TelegramBot) => {
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

    // bot.onText(/\/start (.+)/, async (msg, match) => {
    //     console.log("it's working");

    //     // create a keyboard with a button to request the user's phone number
    //     // console.log("msg", msg);

    //     return await bot.sendMessage(msg.chat.id, TriggersBot.HELLO, {
    //         reply_markup: {
    //             keyboard: [
    //                 [{ text: BtnsBot.ADD_PEOPLE }],
    //                 [{ text: TriggersBot.ADD_GIFTED_GIFT }],
    //                 // [{ text: "Дай номерок", request_contact: true }],
    //                 [{ text: BtnsBot.CHECK_ALL }],
    //                 [{ text: BtnsBot.GIFTED }, { text: BtnsBot.NOT_GIFTED }],
    //             ],
    //         },
    //     });
    // });

    // listen for incoming messages of type 'contact'
    bot.on("contact", async (msg) => {
        // the user's id that is sending the message
        const contact_user_id = msg?.contact?.user_id;

        // the user's id that is receiving the message
        const msgFromId = msg?.from?.id;
        if (!msgFromId) return;

        // check if the msg is from the user you're expecting
        if (msgFromId === contact_user_id) {
            // handle the user's phone number
            const phone_number = msg?.contact?.phone_number;

            const user = await User.findOne({ telegramId: msgFromId });
            if (!user) {
                const new_user = await User.create({
                    username: msg?.from?.username,
                    fullName: msg?.from?.first_name,
                    telegramId: msgFromId,
                    phone: phone_number,
                });

                return await bot.sendMessage(
                    msg.chat.id,
                    `${new_user.fullName} ${Text.YOU_ARE_SUCCESSFULLY_REGISTERED}`,
                    {
                        reply_markup: {
                            keyboard: [
                                [{ text: TriggersBot.ADD_ORDER }],
                                [{ text: TriggersBot.GO_MAIN }],
                            ],
                        },
                    }
                );
            }

            return await bot.sendMessage(
                msg.chat.id,
                `${Text.HI_AGAINE}, ${user.fullName} 👋🏻`,
                {
                    reply_markup: {
                        keyboard: [
                            [
                                { text: TriggersBot.MY_ORDERS },
                                { text: TriggersBot.ADD_ORDER },
                            ],
                        ],
                    },
                }
            );
        }
    });

    bot.on("message", async (msg: Message) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        const msgFromId = msg?.from?.id;

        if (!msgFromId || !chatId) return;

        let isError: boolean = false;

        switch (text) {
            case TriggersBot.GO_MAIN:
                return await bot.sendMessage(chatId, TriggersBot.GO_MAIN, {
                    reply_markup: {
                        keyboard: [
                            [
                                { text: TriggersBot.MY_ORDERS },
                                { text: TriggersBot.ADD_ORDER },
                            ],
                        ],
                        resize_keyboard: true,
                    },
                });

            case TriggersBot.CANCEL:
                return await bot.sendMessage(
                    chatId,
                    `${Text.YOUR_ORDER_CANCELED}`,
                    {
                        reply_markup: {
                            keyboard: [
                                [
                                    { text: TriggersBot.MY_ORDERS },
                                    { text: TriggersBot.ADD_ORDER },
                                ],
                            ],
                        },
                    }
                );

            case TriggersBot.MY_ORDERS:
                return await bot.sendMessage(chatId, `${Text.MY_ORDERS}`, {
                    reply_markup: {
                        keyboard: [
                            [
                                { text: TriggersBot.MY_ORDERS },
                                { text: TriggersBot.ADD_ORDER },
                            ],
                        ],
                    },
                });

            case TriggersBot.ADD_ORDER:
                const questions = [
                    { key: "carBrand", question: Text.ENTER_CAR_BRAND },
                    { key: "carNumber", question: Text.ENTER_CAR_NUMBER },
                    { key: "serviceDate", question: Text.CHOOSE_DAY },
                    { key: "partOfTheDay", question: Text.CHOOSE_PART_OF_DAY },
                ];

                const answers: { [key: string]: string | number } = {};

                // move out to utils
                // for (const { key, question } of questions) {
                //     await bot.sendMessage(chatId, question, {
                //         reply_markup: { remove_keyboard: true },
                //     });

                //     const answer = await new Promise<string>((resolve) => {
                //         bot.once("message", (msg) => {
                //             if (msg.text) {
                //                 resolve(msg.text);
                //             } else {
                //                 resolve("");
                //             }
                //         });
                //     });

                //     answers[key] = answer;
                // }
                answers["userId"] = +msgFromId;

                try {
                    // const newOrder = await Order.create(
                    // answers
                    // );

                    // console.log(newOrder);

                    await bot.sendMessage(
                        chatId,
                        JSON.stringify(answers, null, 2)
                    );
                    await bot.sendMessage(chatId, Text.ORDER_CREATED, {
                        reply_markup: {
                            keyboard: [
                                [
                                    { text: TriggersBot.MY_ORDERS },
                                    { text: TriggersBot.ADD_ORDER },
                                ],
                            ],
                        },
                    });
                } catch (error) {
                    await bot.sendMessage(chatId, Text.SOMETHING_WENT_WRONG, {
                        reply_markup: {
                            keyboard: [
                                [
                                    { text: TriggersBot.MY_ORDERS },
                                    { text: TriggersBot.ADD_ORDER },
                                ],
                            ],
                        },
                    });
                }

            default:
                break;
        }

        // if (text?.includes(TriggersBot.TEST)) {
        //     return await bot.sendMessage(chatId, `${TriggersBot.TEST} - ✅`, {
        //         reply_markup: {
        //             inline_keyboard: [
        //                 [
        //                     {
        //                         text: "Кнопка 1",
        //                         callback_data: "Hello",
        //                     },
        //                     {
        //                         text: "Кнопка 1.2",
        //                         callback_data: "Hello",
        //                     },
        //                     {
        //                         text: "Кнопка 1.3",
        //                         callback_data: "Hello",
        //                     },
        //                 ],
        //                 [
        //                     {
        //                         text: "Кнопка 2",
        //                         web_app: { url: HOST! },
        //                     },
        //                     {
        //                         text: "Кнопка 2.2",
        //                         web_app: { url: HOST! },
        //                     },
        //                     {
        //                         text: "Кнопка 2.3",
        //                         web_app: { url: HOST! },
        //                     },
        //                 ],
        //             ],
        //         },
        //     });
        // }

        // return bot.sendMessage(chatId, TriggersBot.UNEXPECTED_COMMAND);
    });
};
