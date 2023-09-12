import TelegramBot, { Message } from "node-telegram-bot-api";
import moment from "moment";

import { TriggersBot } from "../enums/triggers.bot";

import { Text } from "../enums/official.text";
import { Order } from "../db/Schemas/Order";
import { IAnswers, IQuestion } from "../types/types";
import { ask } from "../utils/ask";
import { keybordWithDates } from "../utils/keybords";

import { sendOrdersToUser } from "../utils/sendOrdersToUser";
import { User } from "../db/Schemas/User";

export const onMessageListner = (bot: TelegramBot) => {
    bot.on("message", async (msg: Message) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        const msgFromId = msg?.from?.id;

        if (!msgFromId || !chatId) return; // TO DO: add error handler

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
                try {
                    const user = await User.findOne({ telegramId: +msgFromId });
                    if (!user) return; // TO DO: add error message

                    const orders = await Order.find({
                        userId: user._id,
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

                    return await bot.sendMessage(
                        chatId,
                        "Замовлення:\n" + sendOrdersToUser({ orders }),
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: `Видалити ${moment(
                                                orders[0].serviceDate
                                            ).format("DD.MM.YYYY")}`,
                                            callback_data: `{"removeId":"${orders[0]._id}"}`,
                                        },
                                    ],
                                ],
                            },
                        }
                    );
                } catch (error) {
                    console.log(error);
                }

            case TriggersBot.ADD_ORDER:
                // 1, and 2 questions
                const questions: IQuestion[] = [
                    { key: "carBrand", question: Text.ENTER_CAR_BRAND },
                    { key: "carNumber", question: Text.ENTER_CAR_NUMBER },
                ];

                const answers: IAnswers = await ask({ bot, chatId, questions });

                const keyboard = await keybordWithDates(answers);

                // 3 question
                return await bot.sendMessage(
                    chatId,
                    `${Text.CHOOSE_PART_OF_DAY}`,
                    {
                        reply_markup: {
                            inline_keyboard: keyboard,
                            resize_keyboard: true,
                        },
                    }
                );

            case TriggersBot.TODAY_ORDERS:
                const todayDate = moment().endOf("day").utc().toDate();
                const formattedDate = moment(todayDate).format("DD.MM.YYYY");

                const todayOrders = await Order.find({
                    serviceDate: {
                        $gte: moment().startOf("day").utc().toDate(),
                        $lte: todayDate,
                    },
                }).populate("userId");

                if (!todayOrders.length)
                    return await bot.sendMessage(chatId, `Тут пусто`, {
                        reply_markup: {
                            keyboard: [
                                [{ text: TriggersBot.TODAY_ORDERS }],
                                [{ text: TriggersBot.TOMORROW_ORDERS }],
                                [{ text: TriggersBot.ALL_ORDER }],
                            ],
                        },
                    });

                return await bot.sendMessage(
                    chatId,
                    `Сьогодні (${formattedDate})👇🏻: ${sendOrdersToUser({
                        orders: todayOrders,
                        isAdmin: true,
                    })}`,
                    {
                        parse_mode: "Markdown",
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

            case TriggersBot.TOMORROW_ORDERS:
                const tomorrowDate = moment()
                    .add(1, "days")
                    .endOf("day")
                    .utc()
                    .toDate();

                const formattedTomorrowDate =
                    moment(tomorrowDate).format("DD.MM.YYYY");

                const tomorrowOrders = await Order.find({
                    serviceDate: {
                        $gte: moment()
                            .add(1, "days")
                            .startOf("day")
                            .utc()
                            .toDate(),
                        $lte: tomorrowDate,
                    },
                }).populate("userId");

                if (!tomorrowOrders.length)
                    return await bot.sendMessage(chatId, `Тут пусто`, {
                        reply_markup: {
                            keyboard: [
                                [{ text: TriggersBot.TODAY_ORDERS }],
                                [{ text: TriggersBot.TOMORROW_ORDERS }],
                                [{ text: TriggersBot.ALL_ORDER }],
                            ],
                        },
                    });

                return await bot.sendMessage(
                    chatId,
                    `Завтра (${formattedTomorrowDate})👇🏻:${sendOrdersToUser({
                        orders: tomorrowOrders,
                        isAdmin: true,
                    })}`,
                    {
                        parse_mode: "Markdown",
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

            case TriggersBot.ALL_ORDER:
                const elevenDays = moment()
                    .add(11, "days")
                    .endOf("day")
                    .utc()
                    .toDate();

                const formattedElevenDays =
                    moment(elevenDays).format("DD.MM.YYYY");

                const allOrders = await Order.find({
                    serviceDate: {
                        $gte: moment().startOf("day").utc().toDate(),
                        $lte: elevenDays,
                    },
                }).populate("userId");

                if (!allOrders.length)
                    return await bot.sendMessage(chatId, `Тут пусто`, {
                        reply_markup: {
                            keyboard: [
                                [{ text: TriggersBot.TODAY_ORDERS }],
                                [{ text: TriggersBot.TOMORROW_ORDERS }],
                                [{ text: TriggersBot.ALL_ORDER }],
                            ],
                        },
                    });

                return await bot.sendMessage(
                    chatId,
                    `Всі записи до (${formattedElevenDays})👇🏻:${sendOrdersToUser(
                        {
                            orders: allOrders,
                            isAdmin: true,
                        }
                    )}`,
                    {
                        parse_mode: "Markdown",
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

            default:
                break;
        }
    });
};
