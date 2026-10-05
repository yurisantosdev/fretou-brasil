import mongoose from "mongoose";
import { UsersType } from "../types/Users";

const usersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    cpf: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true,
    },
    driver: {
      type: Boolean,
      required: true,
      default: false,
    },
    plateVehicle: {
      type: String,
      required: false,
      trim: true,
    },
    keyPix: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const User =
  (mongoose.models.User as mongoose.Model<UsersType> | undefined) ??
  mongoose.model<UsersType>("User", usersSchema);
