import mongoose from "mongoose";

export const NATURES_TITLES = [
  "receber",
  "pagar",
] as const;

export type NaturesTitles = (typeof NATURES_TITLES)[number];

export type TitlesType = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  nature: NaturesTitles;
  value: number;
  expirationDate: string;
  liqiudateDate?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TitlesResponse = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  nature: NaturesTitles;
  value: number;
  expirationDate: string;
  liqiudateDate?: string;
};