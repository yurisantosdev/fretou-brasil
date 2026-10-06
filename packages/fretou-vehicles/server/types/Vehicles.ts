import mongoose from "mongoose";

export type VehiclesType = {
  _id: mongoose.Types.ObjectId;
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
  thirdParty: boolean;
  driver?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type VehiclesResponse = {
  _id: mongoose.Types.ObjectId;
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  thirdParty: boolean;
  driver?: mongoose.Types.ObjectId;
  active: boolean;
};
