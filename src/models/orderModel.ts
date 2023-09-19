import { Order } from '../db/Schemas/Order';
import { IOrderModel } from '../types/orderTypes';

const orderModel: IOrderModel = {
  createOrder: async ({ userId, carBrand, carNumber, serviceDate }) => {
    const newOrder = (await Order.create({ userId, carBrand, carNumber, serviceDate })).populate(
      'userId',
    );

    return newOrder;
  },

  getAllOrders: async () => {
    const allOrders = await Order.find({});

    return allOrders;
  },

  getOrderWithUser: async ({ _id }) => {
    const allOrders = await Order.find({ _id }).populate('userId');

    return allOrders;
  },

  getOrdersByDate: async ({ userId, date, gte, lte }) => {
    let query: { userId?: string; serviceDate?: Date | { $gte?: Date; $lte?: Date } } = {
      userId: '',
      serviceDate: {},
    };

    if (userId) {
      query['userId'] = userId;
    } else {
      delete query['userId'];
    }

    if (date) {
      query = {
        ...query,
        serviceDate: date,
      };
    } else {
      if (gte) {
        query = {
          ...query,
          serviceDate: {
            $gte: gte,
          },
        };
      }

      if (lte) {
        query = {
          ...query,
          serviceDate: { ...query.serviceDate, $lte: lte },
        };
      }
    }

    const orderUser = await Order.find({
      ...query,
    });

    return orderUser;
  },

  getOrdersByDateWithUser: async ({ userId, date, gte, lte }) => {
    let query: { userId?: string; serviceDate?: Date | { $gte?: Date; $lte?: Date } } = {
      userId: '',
      serviceDate: {},
    };

    if (userId) {
      query['userId'] = userId;
    } else {
      delete query['userId'];
    }

    if (date) {
      query = {
        ...query,
        serviceDate: date,
      };
    } else {
      if (gte) {
        query = {
          ...query,
          serviceDate: {
            $gte: gte,
          },
        };
      }

      if (lte) {
        query = {
          ...query,
          serviceDate: { ...query.serviceDate, $lte: lte },
        };
      }
    }

    const orderUser = await Order.find({
      ...query,
    }).populate('userId');

    return orderUser;
  },

  removeOrderById: async ({ _id }) => {
    const removedOrder = await Order.findByIdAndRemove({
      _id,
    });

    return removedOrder;
  },

  removeOldOrders: async ({ lt }) => {
    const { deletedCount } = await Order.deleteMany({ serviceDate: { $lt: lt } });
    console.log(`Removed orders: ${deletedCount}`);

    return +deletedCount;
  },
};

export { orderModel };
