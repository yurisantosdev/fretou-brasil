import mongoose from "mongoose";
import { TitlesType, NATURES_TITLES, PAPEIS_TITULO } from "../types/Titles";

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
    papel: {
      type: String,
      enum: PAPEIS_TITULO,
      required: false,
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
    scheduledAt: {
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

titlesSchema.index(
  { tripId: 1, papel: 1 },
  { unique: true, partialFilterExpression: { papel: { $type: "string" } } },
);

export const Title =
  (mongoose.models.Title as mongoose.Model<TitlesType> | undefined) ??
  mongoose.model<TitlesType>("Title", titlesSchema);
