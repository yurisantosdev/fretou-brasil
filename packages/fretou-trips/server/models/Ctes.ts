import mongoose from "mongoose";
import { CteType } from "../types/Ctes";

const ctesSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      unique: true,
    },
    number: {
      type: String,
      required: true,
      trim: true,
    },
    emitted: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "ctes",
  }
);

export const Cte =
  (mongoose.models.Cte as mongoose.Model<CteType> | undefined) ??
  mongoose.model<CteType>("Cte", ctesSchema);
