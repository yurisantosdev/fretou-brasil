import mongoose from "mongoose";
import { ClientsType } from "../types/Clients";

const clientsSchema = new mongoose.Schema(
  {
    corporateName: {
      type: String,
      required: true,
      trim: true,
    },
    cnpj: {
      type: String,
      required: true,
      trim: true,
    },
    timePeriod: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

export const Client =
  (mongoose.models.Client as mongoose.Model<ClientsType> | undefined) ??
  mongoose.model<ClientsType>("Client", clientsSchema);
