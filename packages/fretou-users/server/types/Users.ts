import mongoose from "mongoose";

export type UserVehicle = {
  _id: mongoose.Types.ObjectId;
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
};

export type UsersType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  password: string;
  cpf?: string;
  driver: boolean;
  keyPix?: string;
  active?: boolean;
  thirdParty?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UsersResponse = {
  _id: mongoose.Types.ObjectId;
  name: string;
  password: string;
  cpf?: string;
  driver: boolean;
  keyPix?: string;
  active?: boolean;
  thirdParty?: boolean;
  vehicles: UserVehicle[];
};