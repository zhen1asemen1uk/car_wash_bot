import moment from 'moment';
import { partOfDay } from './noon';

import { Order } from '../db/Schemas/Order';

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
    if (!user || typeof user === 'string') {
      userText = `
  ⛔️ Користувач був видалений з бази
  (не тількищо, мабуть давно 🤷🏼‍♂️)
      `;
    } else {
      userText = `
  Ім'я: ${user.fullName}
  Номер: [+${+user.phoneNumber}](+${+user.phoneNumber})
  Telegram: @${user.username}
      `;
    }

    return `---------------------------------------
  ${isAdmin && userText}
  Машина: ${order.carBrand}
  Номер автомобіля: ${order.carNumber}
  Дата: ${moment(order.serviceDate).format('DD.MM.YYYY')}
  Частина дня: ${partOfDay(order.serviceDate as Date)}`;
  });

  return formattedOrders.join('\n');
};
