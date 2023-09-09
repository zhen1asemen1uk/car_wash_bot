import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema(
    {
        userId: { String, required: true },
        carNumber: { String, required: true },
        carBrand: { String, required: true },
        additionalService: { String, required: false, default: null },
        serviceTime: { Date, required: true },
        partOfTheDay: { String, required: true },
    },
    { timestamps: true }
);

export const Order = model("Order", orderSchema);
