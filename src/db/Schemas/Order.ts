import mongoose, { Document, model } from "mongoose";
import { Roles } from "../../enums/roles";
const { Schema } = mongoose;

interface IUser extends Document {
    username: string;
    fullName: string;
    telegramId: number;
    phoneNumber: number;
    role: [Roles.ADMIN, Roles.USER];
}

interface IOrder extends Document {
    userId: IUser;
    carBrand: string;
    carNumber: string;
    serviceDate: Date;
}

const orderSchema = new Schema(
    {
        // _id: { type: mongoose.Types.ObjectId, autoCreate: true }, // TO DO: check why it works
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        carBrand: { type: String, required: true },
        carNumber: { type: String, required: true },
        serviceDate: { type: Date, required: true },
    },
    { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);
