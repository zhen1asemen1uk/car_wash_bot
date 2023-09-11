import moment from "moment";
import { partOfDay } from "./noon";

import { Order } from "../db/Schemas/Order";

export const sendOrdersToUser = ({
    orders,
    isAdmin = false,
}: {
    orders: InstanceType<typeof Order>[];
    isAdmin?: boolean;
}) => {
    const formattedOrders = orders.map((order) => {
        return `
-------------------------------------------
        ${
            isAdmin
                ? `
Ім'я: ${order?.userId?.fullName}
Номер: [+${+order?.userId?.phoneNumber}](+${+order?.userId?.phoneNumber})
Telegram: @${order?.userId?.username}
`
                : ""
        }
Машина: ${order.carBrand}
Номер автомобіля: ${order.carNumber}
Дата: ${moment(order.serviceDate).format("DD.MM.YYYY")}
Частина дня: ${partOfDay(order.serviceDate as Date)}`;
    });

    return formattedOrders.join("\n");
};
