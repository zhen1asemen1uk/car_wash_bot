import { Document, ObjectId } from 'mongoose';

import { Order } from '../db/Schemas/Order';

export interface IOrder extends Document {
  _id: ObjectId;
  userId: ObjectId;
  carBrand: string;
  carNumber: string;
  serviceDate: Date; // TO DO: add isNew field
}

export type OrderKeys = Pick<IOrder, 'carBrand' | 'carNumber'>;

export interface IOrderModel {
  createOrder: ({
    userId,
    carBrand,
    carNumber,
    serviceDate,
  }: InstanceType<typeof Order>) => Promise<InstanceType<typeof Order>>;

  getAllOrders: () => Promise<InstanceType<typeof Order>[]>;

  getOrderWithUser: ({ _id }: { _id: string }) => Promise<InstanceType<typeof Order>[]>;

  getOrdersByDate: ({
    userId,
    date,
    gte,
    lte,
  }: {
    userId?: string;
    date?: Date;
    gte?: Date;
    lte?: Date;
  }) => Promise<InstanceType<typeof Order>[]>;

  getOrdersByDateWithUser: ({
    date,
    gte,
    lte,
  }: {
    date?: Date;
    gte?: Date;
    lte?: Date;
  }) => Promise<InstanceType<typeof Order>[]>;

  removeOrderById: ({ _id }: { _id: string }) => Promise<InstanceType<typeof Order> | null>;
}
