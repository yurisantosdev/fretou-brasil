import mongoose from "mongoose";

export type UsersType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  password: string;
  cpf?: string;
  driver: boolean;
  plateVehicle?: string;
  keyPix?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UsersResponse = {
  _id: mongoose.Types.ObjectId;
  name: string;
  cpf?: string;
  driver: boolean;
  plateVehicle?: string;
  keyPix?: string;
};