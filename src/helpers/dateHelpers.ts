import moment from 'moment';
import { Text } from '../enums/official.text';

export const simpleDate = (date: Date) => {
  return moment(date).format('DD.MM.YYYY');
};

export const partOfDay = (date: Date) => {
  const time = moment(date);

  const noon = time.clone().hour(13); // Noon

  if (time.isBefore(noon)) {
    return Text.MORNING;
  } else {
    return Text.AFTERNOON;
  }
};
