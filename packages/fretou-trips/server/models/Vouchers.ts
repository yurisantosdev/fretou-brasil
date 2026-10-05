import mongoose from "mongoose";
import { TYPES_VOUCHER, VouchersType } from "../types/Vouchers";

const vouchersSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Types.ObjectId,
      ref: "Trip",
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: TYPES_VOUCHER,
      required: true,
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    content: {
      type: String,
      required: false,
      trim: true,
    },
    received: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "vouchers",
  }
);

vouchersSchema.index({ tripId: 1, type: 1 }, { unique: true });

export const Vouchers =
  (mongoose.models.Voucher as mongoose.Model<VouchersType> | undefined) ??
  mongoose.model<VouchersType>("Voucher", vouchersSchema);
