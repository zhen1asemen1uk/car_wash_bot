import mongoose, { Model, Schema } from 'mongoose';
import { Roles } from '../../enums/roles';
import { IUser } from '../../types/userTypes';

const userSchema = new Schema(
  {
    // _id: { type: ObjectId, autoCreate: true },
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    telegramId: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    role: {
      type: String,
      enum: [Roles.ADMIN, Roles.USER],
      default: Roles.USER,
    },
  },
  { timestamps: true },
);

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
