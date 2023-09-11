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
import { IAnswers, IQuestion } from "../types/types";
import { ask } from "../utils/ask";
import { keybordWithDates } from "../utils/keybords";
import { partOfDay } from "../utils/noon";

export const onMessageListner = (bot: TelegramBot) => {
    bot.on("message", async (msg: Message) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        const msgFromId = msg?.from?.id;
        console.log("msg", msg);

        if (!msgFromId || !chatId) return;

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
                // find all orders by user id from today and 11 working days

                const orders = await Order.find({
                    userId: msgFromId,
                    serviceDate: {
                        $gte: moment().startOf("day").utc().toDate(),
                        $lte: moment()
                            .add(11, "days")
                            .endOf("day")
                            .utc()
                            .toDate(),
                    },
                });

                if (!orders.length)
                    return await bot.sendMessage(chatId, `Тут пусто`, {
                        reply_markup: {
                            keyboard: [
                                [
                                    { text: TriggersBot.MY_ORDERS },
                                    { text: TriggersBot.ADD_ORDER },
                                ],
                            ],
                        },
                    });

                const resp = orders.map((order) => {
                    return (
                        "Замовлення:\n Машина:" +
                        order.carBrand +
                        +"\n" +
                        "Номер:" +
                        order.carNumber +
                        +"\n" +
                        "Дата:" +
                        moment(order.serviceDate).format("DD.MM.YYYY") +
                        +"\n" +
                        "Частина дня:" +
                        partOfDay(order.serviceDate)
                    );
                });

                return await bot.sendMessage(chatId, resp.join("\n"), {
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
                // 1, and 2 questions
                const questions: IQuestion[] = [
                    { key: "carBrand", question: Text.ENTER_CAR_BRAND },
                    { key: "carNumber", question: Text.ENTER_CAR_NUMBER },
                ];

                const answers: IAnswers = await ask({ bot, chatId, questions });

                const keyboard = keybordWithDates(answers);

                // 3 question
                await bot.sendMessage(chatId, `${Text.CHOOSE_PART_OF_DAY}`, {
                    reply_markup: {
                        inline_keyboard: keyboard,
                        resize_keyboard: true,
                    },
                });

            default:
                break;
        }
    });
};
