import moment from 'moment';

import { Order } from '../db/Schemas/Order';
import { partOfDay, simpleDate } from '../helpers/dateHelpers';

export const sendOrdersToUser = ({
  orders,
  isAdmin = false,
}: {
  orders: InstanceType<typeof Order>[];
  isAdmin?: boolean;
}) => {
  const formattedOrders = orders.map(order => {
    const user = order?.userId;

    let userText = ``;
    // check if user was deleted
    if (
      !user ||
      typeof user === 'string' ||
      !('fullName' in user) ||
      !('phoneNumber' in user) ||
      !('phoneNumber' in user) ||
      !('username' in user)
    ) {
      userText = `
  ⛔️ Користувач був видалений з бази
  (не тількищо, мабуть давно 🤷🏼‍♂️)`;
    } else {
      userText = `
  Ім'я: ${user.fullName}
  Номер: [+${+user.phoneNumber}](+${+user.phoneNumber})
  Telegram: @${user.username.replaceAll(/_/g, '\\_')} `; // lowdash broke markdown
    }

    return `---------------------------------------
  ${isAdmin ? userText : ''}
  Машина: ${order.carBrand}
  Номер автомобіля: ${order.carNumber}
  Дата: ${simpleDate(order.serviceDate)}
  Частина дня: ${partOfDay(moment(order.serviceDate).toDate())}`;
  });

  return formattedOrders.join('\n');
};
