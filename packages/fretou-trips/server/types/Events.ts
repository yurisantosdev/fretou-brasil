import mongoose from "mongoose";

export const TPYES_EVENT = [
  "emissao_cte",
  "foto_carregamento",
  "descarga",
  "comprovantes_originais",
] as const;

export type TypesEvents = (typeof TPYES_EVENT)[number];

export type EventsType = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  type: TypesEvents;
  occurredAt: string;
  details: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type EventsResponse = {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  type: TypesEvents;
  occurredAt: string;
  details: Record<string, unknown>;
};