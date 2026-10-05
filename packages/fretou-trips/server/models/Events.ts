import mongoose from "mongoose";
import { EventsType, TPYES_EVENT } from "../types/Events";

const eventsSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TPYES_EVENT,
      required: true,
    },
    occurredAt: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "events",
  },
);

eventsSchema.index({ tripId: 1, type: 1 }, { unique: true });

export const Events =
  (mongoose.models.Events as mongoose.Model<EventsType> | undefined) ??
  mongoose.model<EventsType>("Events", eventsSchema);
