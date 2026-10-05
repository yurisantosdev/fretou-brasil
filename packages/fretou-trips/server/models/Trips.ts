import mongoose from "mongoose";
import { STATUS_TRIP, TripsType } from "../types/Trips";

const tripsSchema = new mongoose.Schema(
  {
    clienteId: {
      type: mongoose.Types.ObjectId,
      ref: "Client",
      required: true,
      trim: true,
    },
    motoristaId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    load: {
      type: Number,
      required: true,
      trim: true,
    },
    dateLoad: {
      type: String,
      required: true,
      trim: true,
    },
    dateDischarge: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: STATUS_TRIP,
      required: true,
      default: "AGUARDANDO_CTE",
    },
    acordoFreteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcordoFrete",
      required: true,
    },
    cteId: {
      type: mongoose.Types.ObjectId,
      ref: "Ctes",
      required: false,
      trim: true,
    },
    shipping: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "trips",
  }
);

tripsSchema.index({ status: 1 });
tripsSchema.index({ clienteId: 1 });
tripsSchema.index({ motoristaId: 1 });
tripsSchema.index({ dateLoad: 1 });

export const Trip =
  (mongoose.models.Trip as mongoose.Model<TripsType> | undefined) ??
  mongoose.model<TripsType>("Trip", tripsSchema);
