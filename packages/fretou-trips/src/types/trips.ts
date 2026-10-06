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

export const DIVIDE_SHIPPING = ["50%", "70%"] as const;

export type DivideShipping = (typeof DIVIDE_SHIPPING)[number];

export const NATURES_TITLES = ["receber", "pagar"] as const;

export type NaturesTitles = (typeof NATURES_TITLES)[number];

export const PAPEIS_TITULO = ["cliente", "adiantamento", "saldo"] as const;

export type PapelTitulo = (typeof PAPEIS_TITULO)[number];

export const TYPES_VOUCHER = ["FOTO_CARREGAMENTO", "ORIGINAIS"] as const;

export type TypesVoucher = (typeof TYPES_VOUCHER)[number];

export const TYPES_EVENT = [
  "emissao_cte",
  "foto_carregamento",
  "descarga",
  "comprovantes_originais",
] as const;

export type TypesEvents = (typeof TYPES_EVENT)[number];

export type TripsType = {
  _id: string;
  clienteId: string;
  motoristaId: string;
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
  codigo?: string;
  advancePaidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TripsResponse = {
  _id: string;
  clienteId: string;
  motoristaId: string;
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
  codigo?: string;
  advancePaidAt?: string;
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
  divideShipping: DivideShipping;
  codigo?: string;
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

export type TripDriver = {
  id: string;
  name: string;
  plateVehicle?: string;
};

export type TripClient = {
  id: string;
  corporateName: string;
  cnpj: string;
  timePeriod?: string;
};

export type TripDraft = {
  clientId: string;
  driverId: string;
  origin: string;
  destination: string;
  product: string;
  weightKg: number;
  loadingDate: string;
  freightReceivable: number;
  freightPayable: number;
  clientTermDays: number;
  driverTermDays: number;
  divideShipping: DivideShipping;
};

export type LockedBalance = {
  id: string;
  tripId: string;
  label: string;
  leg: "A receber" | "A pagar";
  amount: number;
  reason: string;
};

export type FinanceSummary = {
  payToday: number;
  payOpen: number;
  receiveToday: number;
  receiveOpen: number;
  locked: LockedBalance[];
  lockedTotal: number;
  margin: number;
};

export type AcordoFreteInput = {
  freteCliente: number;
  freteMotorista: number;
  prazoClienteDias: number;
  prazoMotoristaDias: number;
};

export type CriarViagemInput = Pick<
  TripsResponse,
  | "clienteId"
  | "motoristaId"
  | "origin"
  | "destination"
  | "product"
  | "load"
  | "dateLoad"
  | "shipping"
  | "divideShipping"
> & {
  acordoFrete: AcordoFreteInput;
};

export type CteInput = {
  number: string;
  emitted: string;
};

export type FotoInput = {
  name: string;
  content: string;
  received: string;
};

export type EventoInput = {
  occurredAt: string;
};

export type TituloInput = {
  papel: PapelTitulo;
  occurredAt: string;
};

export type ProgramacaoInput = {
  papel: "saldo";
  scheduledAt: string;
};