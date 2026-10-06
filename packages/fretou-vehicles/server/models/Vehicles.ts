import mongoose from "mongoose";
import { VehiclesType } from "../types/Vehicles";

const vehiclesSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    totalLoad: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    thirdParty: {
      type: Boolean,
      required: true,
      default: false,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "vehicles",
  }
);

export const Vehicle =
  (mongoose.models.Vehicle as mongoose.Model<VehiclesType> | undefined) ??
  mongoose.model<VehiclesType>("Vehicle", vehiclesSchema);
