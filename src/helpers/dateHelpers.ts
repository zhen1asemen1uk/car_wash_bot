import moment from 'moment';

export const simpleDate = (date: Date) => {
  return moment(date).format('DD.MM.YYYY');
};

export const partOfDay = (date: Date) => {
  const time = moment(date);

  const noon = time.clone().hour(13); // Обід

  if (time.isBefore(noon)) {
    // return "До обіду";
    return 'з 9:00 до 13:00 ☀️';
  } else {
    // return "Після обіду";
    return 'з 13:00 до 18:00 🌆';
  }
};
