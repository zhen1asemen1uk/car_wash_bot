import moment, { Moment } from "moment";

import { InlineKeyboardButton } from "node-telegram-bot-api";
import { IAnswers } from "../types/types";

const getRangeOfDates = () => {
    const today = moment();

    // only workdays + 10 days
    const freeDates = Array.from({ length: 10 }, (_, i) => {
        const date = today.clone().add(i, "day");
        const day = date.day();
        if (day === 0 || day === 6) {
            return null;
        }
        return date;
    }).filter((date) => date !== null) as Moment[];

    return freeDates;
};

export const keybordWithDates = (
    answers: IAnswers
): InlineKeyboardButton[][] => {
    const freeDates = getRangeOfDates();

    const newKeyboard: InlineKeyboardButton[][] = [];

    freeDates.map((date, i) => {
        const formattedDataStartDate = JSON.stringify([
            answers.carBrand,
            answers.carNumber,
            date.startOf("day").unix(),
        ]);
        console.log("formattedDataStartDate", formattedDataStartDate);

        const formattedDataEndDate = JSON.stringify([
            answers.carBrand,
            answers.carNumber,
            date.endOf("day").unix(),
        ]);
        console.log("formattedDataEndDate", formattedDataEndDate);

        const formattedTextStart =
            date.format("DD.MM.YYYY") + " | з 9:00 до 13:00 ☀️";

        const formattedTextEnd =
            date.format("DD.MM.YYYY") + " | з 13:00 до 18:00 🌆";

        newKeyboard.push(
            [
                {
                    text: formattedTextStart,
                    callback_data: `${formattedDataStartDate}`,
                },
            ],
            [
                {
                    text: formattedTextEnd,
                    callback_data: `${formattedDataEndDate}`,
                },
            ]
        );
        // for 2 buttons in one row
        // if (i % 2 === 0) {
        // } else {
        // newKeyboard[newKeyboard.length - 1].push({
        //     text: formattedTextEnd,
        //     callback_data: `${formattedEndDate}`,
        // });
        // }
    });

    return newKeyboard;
};
