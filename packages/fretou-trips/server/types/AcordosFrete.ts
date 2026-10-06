import mongoose from "mongoose";

export type AcordoFreteType = {
  _id: mongoose.Types.ObjectId;
  freteCliente: number;
  freteMotorista: number;
  prazoClienteDias: number;
  prazoMotoristaDias: number;
  adiantamento?: number;
  saldo?: number;
  createdAt: Date;
  updatedAt: Date;
};
