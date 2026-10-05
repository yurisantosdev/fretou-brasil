import mongoose from "mongoose";
import { TitlesType, NATURES_TITLES } from "../types/Titles";

const titlesSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Types.ObjectId,
      ref: "Trip",
      required: true,
      trim: true,
    },
    nature: {
      type: String,
      enum: NATURES_TITLES,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      trim: true,
    },
    expirationDate: {
      type: String,
      required: true,
      trim: true,
    },
    liqiudateDate: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "titles",
  }
);

titlesSchema.index({ tripId: 1, nature: 1 }, { unique: true });

export const Title =
  (mongoose.models.Title as mongoose.Model<TitlesType> | undefined) ??
  mongoose.model<TitlesType>("Title", titlesSchema);
