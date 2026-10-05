import mongoose from "mongoose";

export type ClientsType = {
  _id: mongoose.Types.ObjectId;
  corporateName: string;
  cnpj: string;
  timePeriod: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientsResponse = {
  _id: mongoose.Types.ObjectId;
  corporateName: string;
  cnpj: string;
  timePeriod: string;
};