import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import moment from "moment";

import { IAnswers } from "../types/types";

import { Text } from "../enums/official.text";
import { TriggersBot } from "../enums/triggers.bot";
import { Order } from "../db/Schemas/Order";

export const onCallbackDataListner = (bot: TelegramBot) => {
    // Listen for any kind of message. There are different kinds of messages.
    bot.on("callback_query", async (query: CallbackQuery) => {
        const chatId = query?.message?.chat.id;
        const text = query?.message?.text;
        const msgFromId = query?.from?.id;
        const { data } = query;

        if (!msgFromId || !chatId || !data) return;
        console.log("-----------------------");
        // console.log("query", query);
        // console.log("query?.message", query?.message);
        // console.log("text", text);
        // console.log("data", data);
        console.log("-----------------------");

        // const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
        // const unixTimeStampPattern = /^\d{10}$/;

        try {
            const dataArr: string[] = JSON.parse(data);

            const answers: IAnswers = {};

            answers["carBrand"] = dataArr[0];
            answers["carNumber"] = dataArr[1];
            answers["serviceDate"] = moment.unix(+dataArr[2]).toDate();
            answers["userId"] = +msgFromId;

            // create order
            await Order.create({ ...answers });

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
            console.error(error);
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
    });
};
