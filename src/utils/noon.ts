import moment from "moment";

export const partOfDay = (date: Date) => {
    const time = moment(date);
    const startOfDay = time.startOf("day"); // Початок дня
    const noon = startOfDay.clone().hour(13); // Обід

    if (time.isBefore(noon)) {
        return "До обіду";
    } else {
        return "Після обіду";
    }
};
