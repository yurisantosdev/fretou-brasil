import mongoose from "mongoose";

export type ClientsType = {
  _id: mongoose.Types.ObjectId;
  corporateName: string;
  cnpj: string;
  timePeriod: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientsResponse = {
  _id: mongoose.Types.ObjectId;
  corporateName: string;
  cnpj: string;
  timePeriod: string;
  active: boolean;
};