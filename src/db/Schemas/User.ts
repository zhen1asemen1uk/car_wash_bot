import mongoose, { model } from "mongoose";
import { Roles } from "../../enums/roles";
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: String,
        fullName: String,
        telegramId: Number,
        phoneNumber: Number,
        role: {
            type: String,
            enum: [Roles.ADMIN, Roles.USER],
            default: Roles.USER,
        },
    },
    { timestamps: true }
);

export const User = model("User", userSchema);
