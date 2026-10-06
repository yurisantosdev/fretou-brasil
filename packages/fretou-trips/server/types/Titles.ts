import mongoose from "mongoose";

export const NATURES_TITLES = [
  "receber",
  "pagar",
] as const;

export type NaturesTitles = (typeof NATURES_TITLES)[number];

export const PAPEIS_TITULO = ["cliente", "adiantamento", "saldo"] as const;

export type PapelTitulo = (typeof PAPEIS_TITULO)[number];

export type TitlesType = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  nature: NaturesTitles;
  papel?: PapelTitulo;
  value: number;
  expirationDate: string;
  liqiudateDate?: string;
  scheduledAt?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TitlesResponse = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  nature: NaturesTitles;
  papel?: PapelTitulo;
  value: number;
  expirationDate: string;
  liqiudateDate?: string;
  scheduledAt?: string;
};