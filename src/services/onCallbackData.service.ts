import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import moment from "moment";

import { Text } from "../enums/official.text";
import { TriggersBot } from "../enums/triggers.bot";

import { Order } from "../db/Schemas/Order";
import { User } from "../db/Schemas/User";

import { partOfDay } from "../utils/noon";
import { sendError } from "../utils/error";
import { checkOrder, checkUser } from "../utils/checkers";

import { IAnswers } from "../types/types";
import { Roles } from "../enums/roles";
import { sendOrdersToUser } from "../utils/sendOrdersToUser";

export const onCallbackDataListner = (bot: TelegramBot) => {
  // Listen for any kind of message. There are different kinds of messages.
  bot.on("callback_query", async (query: CallbackQuery) => {
    const chatId = query?.message?.chat.id;
    // const text = query?.message?.text;
    const msgFromId = query?.from?.id;
    const { data } = query;

    if (!msgFromId || !chatId || !data) return; // TO DO: add error handler
    // console.log("-----------------------");
    // console.log("query", query);
    // console.log("query?.message", query?.message);
    // console.log("text =>", text);
    // console.log("data =>", data);
    // console.log("-----------------------");

    // const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    // const unixTimeStampPattern = /^\d{10}$/;

    // remove order
    if (data?.includes("removeId")) {
      try {
        const parsedObj = JSON.parse(data);

        const removedOrder = await Order.findByIdAndRemove({
          _id: parsedObj.removeId,
        });

        if (removedOrder) {
          console.log(
            `Order with ID ${parsedObj.removeId} was successfully removed.`,
          );
          await bot.sendMessage(
            chatId,
            `${Text.ORDER_REMOVED}\n*(${moment(removedOrder.serviceDate).format(
              "DD.MM.YYYY",
            )}) ${partOfDay(moment(removedOrder.serviceDate).toDate())}*`,
            {
              parse_mode: "Markdown",
              reply_markup: {
                keyboard: [[{ text: TriggersBot.ADD_ORDER }]],
              },
            },
          );
        } else {
          return sendError({
            bot,
            error: `Order with ID ${parsedObj.removeId} was not found`,
            chatId,
          });
        }
      } catch (error) {
        return sendError({
          bot,
          error,
          chatId,
        });
      }
    } else {
      // create order
      try {
        const dataArr: string[] = JSON.parse(data);
        const answers: IAnswers = {};
        const formettedToDate = moment.unix(+dataArr[2]).toDate();

        const user = await User.findOne({ telegramId: +msgFromId });
        if (!user) return; // TO DO: add error handler

        const strId = user!._id.toString();

        answers["carBrand"] = dataArr[0];
        answers["carNumber"] = dataArr[1];
        answers["serviceDate"] = moment(formettedToDate).toDate(); // maybe need .utc()
        answers["userId"] = strId;

        const userChecker = await checkUser({
          bot,
          user,
          chatId,
          answers,
          msgFromId,
        });

        const orderChecker = await checkOrder({
          formettedToDate,
          bot,
          chatId,
          answers,
        });

        if (!userChecker || !orderChecker) return; // TO DO: add error handler

        // create order
        const newOrder = await Order.create({ ...answers });

        await bot.sendMessage(
          chatId,
          `${Text.ORDER_CREATED}\n*(${moment
            .unix(+dataArr[2])
            .format("DD.MM.YYYY")}) ${partOfDay(formettedToDate)}*`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: [
                [
                  { text: TriggersBot.MY_ORDERS },
                  { text: TriggersBot.ADD_ORDER },
                ],
              ],
            },
          },
        );

        // send message to all admins
        const allAdmins = await User.find({ role: Roles.ADMIN });

        return allAdmins.map(async (admin) => {
          await bot.sendMessage(
            admin.telegramId,
            `*${Text.NEW_ORDER}*\n${sendOrdersToUser({
              orders: [newOrder],
            })}`,
            {
              parse_mode: "Markdown",
            },
          );
        });
      } catch (error) {
        return sendError({
          bot,
          error,
          chatId,
          errMessage: Text.SOMETHING_WENT_WRONG,
          arrBtns: [
            [{ text: TriggersBot.MY_ORDERS }, { text: TriggersBot.ADD_ORDER }],
          ],
        });
      }
    }
  });
};
