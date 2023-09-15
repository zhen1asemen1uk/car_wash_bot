import { ObjectId } from 'mongoose';
import { IOrder, OrderKeys } from './orderTypes';

export interface IAnswers {
  [key: string]: string | ObjectId | Date;
}

export interface IQuestion {
  key: IOrder['carBrand' | 'carNumber'];
  // key: keyof IOrder;
  question: string;
}
