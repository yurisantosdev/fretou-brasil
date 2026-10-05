import mongoose from "mongoose";
import { TypesEvents } from "./Events";
import { NaturesTitles } from "./Titles";
import { TypesVoucher } from "./Vouchers";

export type MargemViagem = {
  freteCliente: number;
  freteMotorista: number;
  margemReais: number;
  margemPercentual: number | null;
  negativa: boolean;
};

export const STATUS_TRIP = [
  "AGUARDANDO_CTE",
  "AGUARDANDO_FOTO",
  "CARREGADA",
  "EM_TRANSITO",
  "AGUARDANDO_COMPROVANTE",
  "FINALIZADA",
] as const;

export type StatusTrip = (typeof STATUS_TRIP)[number];

export type TripsType = {
  _id: mongoose.Types.ObjectId;
  clienteId: mongoose.Types.ObjectId;
  motoristaId: mongoose.Types.ObjectId;
  origin: string;
  destination: string;
  product: string;
  load: number;
  dateLoad: string;
  dateDischarge?: string;
  status: StatusTrip;
  acordoFreteId: mongoose.Types.ObjectId;
  cteId?: mongoose.Types.ObjectId;
  shipping: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TripsResponse = {
  _id: mongoose.Types.ObjectId;
  clienteId: mongoose.Types.ObjectId;
  motoristaId: mongoose.Types.ObjectId;
  origin: string;
  destination: string;
  product: string;
  load: number;
  dateLoad: string;
  dateDischarge?: string;
  status: StatusTrip;
  acordoFreteId: mongoose.Types.ObjectId;
  cteId?: mongoose.Types.ObjectId;
  shipping: number;
};

export type TripDetail = {
  id: string;
  clienteId: string;
  clienteNome: string;
  motoristaId: string;
  motoristaNome: string;
  motoristaPlaca?: string;
  origin: string;
  destination: string;
  product: string;
  load: number;
  dateLoad: string;
  dateDischarge?: string;
  status: StatusTrip;
  acordoFreteId: string;
  cteId?: string;
  shipping: number;
  margem: MargemViagem;
  titles: Array<{
    id: string;
    nature: NaturesTitles;
    value: number;
    expirationDate: string;
    liqiudateDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  acordoFrete: {
    id: string;
    freteCliente: number;
    freteMotorista: number;
    prazoClienteDias: number;
    prazoMotoristaDias: number;
  };
  cte?: {
    id: string;
    number: string;
    emitted: string;
  };
  vouchers: Array<{
    id: string;
    type: TypesVoucher;
    name?: string;
    content?: string;
    received: string;
  }>;
  events: Array<{
    id: string;
    type: TypesEvents;
    occurredAt: string;
    details: Record<string, unknown>;
    createdAt: string;
  }>;
  idempotente?: boolean;
};

export type TripListItem = TripsResponse & {
  margem: MargemViagem;
  titles: TripDetail["titles"];
};