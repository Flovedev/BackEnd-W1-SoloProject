import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reviewsSchema = new Schema(
  {
    comment: { type: String, required: true },
    rate: { type: Number, min: 0, max: 5, required: true },
  },
  { timestamps: true }
);

export default model("Reviews", reviewsSchema);
