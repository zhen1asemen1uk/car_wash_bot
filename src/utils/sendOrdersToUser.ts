import moment from 'moment';

import { Order } from '../db/Schemas/Order';
import { partOfDay, simpleDate } from '../helpers/dateHelpers';
import { Text } from '../enums/official.text';

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
      !('username' in user)
    ) {
      userText = Text.USER_WAS_DELETED;
    } else {
      userText = `
  ${Text.NAME}: ${user.fullName}
  ${Text.NUMBER}: [+${+user.phoneNumber}](+${+user.phoneNumber})
  ${Text.TG}: @${user.username.replaceAll(/_/g, '\\_')} `; // lowdash broke markdown
    }

    return `---------------------------------------
  ${isAdmin ? userText : ''}
  ${Text.CAR}: ${order.carBrand}
  ${Text.CAR_BRAND}: ${order.carNumber}
  ${Text.DATE}: ${simpleDate(order.serviceDate)}
  ${Text.PART_OF_DAY}: ${partOfDay(moment(order.serviceDate).toDate())}`;
  });

  return formattedOrders.join('\n');
};
