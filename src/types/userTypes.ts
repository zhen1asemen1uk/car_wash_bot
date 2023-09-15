import { Document } from 'mongoose';
import { Roles } from '../enums/roles';
import { User } from '../db/Schemas/User';
import { ObjectId } from 'mongoose';

export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  fullName: string;
  telegramId: number;
  phoneNumber: number;
  role: Roles.ADMIN | Roles.USER;
}

export interface IUserModel {
  createUser: ({
    username,
    fullName,
    telegramId,
    phoneNumber,
    role,
  }) => Promise<InstanceType<typeof User>>;

  getUserByTelegramId: ({
    telegramId,
  }: {
    telegramId: number;
  }) => Promise<InstanceType<typeof User> | null>;

  getUserById: ({ _id }: { _id: string }) => Promise<InstanceType<typeof User> | null>;

  getAllAdmins: () => Promise<InstanceType<typeof User>[]>;
}
