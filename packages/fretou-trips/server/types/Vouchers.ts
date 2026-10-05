import mongoose from "mongoose";

export const TYPES_VOUCHER = [
  "FOTO_CARREGAMENTO",
  "ORIGINAIS",
] as const;

export type TypesVoucher = (typeof TYPES_VOUCHER)[number];

export type VouchersType = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  type: TypesVoucher;
  name?: string;
  content?: string;
  received: string;
  createdAt: Date;
  updatedAt: Date;
};

export type VouchersResponse = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  type: TypesVoucher;
  name?: string;
  content?: string;
  received: string;
};