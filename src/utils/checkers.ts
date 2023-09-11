import moment from "moment";
import { Order } from "../db/Schemas/Order";
import { keybordWithDates } from "./keybords";
import { User } from "../db/Schemas/User";
import { sendError } from "./error";
import TelegramBot from "node-telegram-bot-api";
import { IAnswers } from "../types/types";

interface ICheckUser {
    bot: TelegramBot;
    user: InstanceType<typeof User>;
    chatId: number;
    answers: IAnswers;
    msgFromId: number;
}

export const checkUser = async ({
    bot,
    user,
    chatId,
    answers,
    msgFromId,
}: ICheckUser) => {
    if (!user || !user._id) {
        await sendError({
            bot,
            error: "User not exists",
            chatId,
            inlineBoard: true,
            errMessage: `❌ Сталася неочікувана помилка.\nЗверніться до адміністратора`,
            arrBtns: await keybordWithDates(answers),
        });
        return false;
    }

    return user;
};

interface ICheckOrder {
    formettedToDate: Date;
    bot: TelegramBot;
    chatId: number;
    answers: IAnswers;
}

export const checkOrder = async ({
    formettedToDate,
    bot,
    chatId,
    answers,
}: ICheckOrder) => {
    // check if user already exists
    const elevenDays = moment().add(11, "days").endOf("day").utc().toDate();

    const orderUser = await Order.find({
        serviceDate: {
            $gte: moment().startOf("day").utc().toDate(),
            $lte: elevenDays,
        },
    });

    const isExists = orderUser.some(
        (order) => order.userId.toString() === answers["userId"]
    );

    if (isExists) {
        await sendError({
            bot,
            error: "User already exists",
            chatId,
            errMessage: `❌ Вибачте ви вже записалися.\nПриходьте після того, як ваш автомобіль помиють`, // TO DO: add to time !!!!
        });

        return false;
    }

    // check if order with same time already exists
    const orderUnique = await Order.findOne({
        serviceDate: moment(formettedToDate).utc().toDate(),
    });

    if (orderUnique) {
        await sendError({
            bot,
            error: "Order already exists",
            chatId,
            inlineBoard: true,
            errMessage: `❌ Вибачте хтось вас випередив, спробуйте записатись знову`, // TO DO: add to time !!!!
            arrBtns: await keybordWithDates(answers),
        });
        return false;
    }

    return true;
};
