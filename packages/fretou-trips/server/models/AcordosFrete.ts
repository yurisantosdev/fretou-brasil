import mongoose from "mongoose";
import { AcordoFreteType } from "../types/AcordosFrete";

const acordoFreteSchema = new mongoose.Schema(
  {
    freteCliente: {
      type: Number,
      required: true,
      min: 0,
    },
    freteMotorista: {
      type: Number,
      required: true,
      min: 0,
    },
    prazoClienteDias: {
      type: Number,
      required: true,
      min: 0,
    },
    prazoMotoristaDias: {
      type: Number,
      required: true,
      min: 0,
    },
    adiantamento: {
      type: Number,
      required: false,
      min: 0,
    },
    saldo: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "acordosFrete",
  },
);

export const AcordoFrete =
  (mongoose.models.AcordoFrete as mongoose.Model<AcordoFreteType> | undefined) ??
  mongoose.model<AcordoFreteType>("AcordoFrete", acordoFreteSchema);
