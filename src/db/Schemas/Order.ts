import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema(
    {
        userId: { type: String, required: true },
        carBrand: { type: String, required: true },
        carNumber: { type: String, required: true },
        serviceDate: { type: Date, required: true },
    },
    { timestamps: true }
);

export const Order = model("Order", orderSchema);
