import mongoose, { model } from "mongoose";
import { Roles } from "../../enums/roles";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        // _id: { type: mongoose.Types.ObjectId, autoCreate: true }, // TO DO: check why it works
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
    { timestamps: true }
);

export const User = model("User", userSchema);
