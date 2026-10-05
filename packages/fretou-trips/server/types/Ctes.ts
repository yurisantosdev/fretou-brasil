import mongoose from "mongoose";

export type CteType = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  number: string;
  emitted: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CtesResponse = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  number: string;
  emitted: string;
};