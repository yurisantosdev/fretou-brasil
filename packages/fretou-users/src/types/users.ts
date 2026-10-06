import { Vehicle } from "@fretou/vehicles";

export type User = {
  _id: string;
  name: string;
  cpf?: string;
  password?: string;
  driver: boolean;
  thirdParty?: boolean;
  keyPix?: string;
  active?: boolean;
  vehicles?: Vehicle[];
};

export type UserFormData = {
  name: string;
  cpf: string;
  password: string;
  driver: boolean;
  thirdParty: boolean;
  keyPix: string;
  active: boolean;
  vehicles?: Vehicle[];
};

export type UserStatusFilter = "todos" | "ativos" | "inativos";
export type UserKindFilter = "todos" | "empresa" | "terceiros";
