import mongoose from "mongoose";
import { TypesEvents } from "./Events";
import type { NaturesTitles, PapelTitulo } from "./Titles";
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
  "AGUARDANDO_PAGAMENTO",
  "FINALIZADA",
  "CANCELADA",
] as const;

export type StatusTrip = (typeof STATUS_TRIP)[number];

export const DIVIDE_SHIPPING = [
  "50%",
  "70%",
] as const;

export type DivideShipping = (typeof DIVIDE_SHIPPING)[number];

export type TripsType = {
  _id: mongoose.Types.ObjectId;
  clienteId: mongoose.Types.ObjectId;
  motoristaId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  plate?: string;
  vehicleModel?: string;
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
  divideShipping: DivideShipping;
  codigo: string;
  advancePaidAt?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TripsResponse = {
  _id: mongoose.Types.ObjectId;
  clienteId: mongoose.Types.ObjectId;
  motoristaId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  plate?: string;
  vehicleModel?: string;
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
  divideShipping: DivideShipping;
  codigo: string;
  advancePaidAt?: string;
};

export type TripDetail = {
  id: string;
  clienteId: string;
  clienteNome: string;
  motoristaId: string;
  motoristaNome: string;
  vehicleId?: string;
  plate?: string;
  vehicleModel?: string;
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
  divideShipping: DivideShipping;
  codigo: string;
  advancePaidAt?: string;
  margem: MargemViagem;
  titles: Array<{
    id: string;
    nature: NaturesTitles;
    papel?: PapelTitulo;
    value: number;
    expirationDate: string;
    liqiudateDate?: string;
    scheduledAt?: string;
    bloqueio?: string;
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