export type User = {
  _id: string;
  name: string;
  cpf?: string;
  password?: string;
  driver: boolean;
  thirdParty?: boolean;
  plateVehicle?: string;
  keyPix?: string;
  active?: boolean;
};

export type UserFormData = {
  name: string;
  cpf: string;
  password: string;
  driver: boolean;
  thirdParty: boolean;
  plateVehicle: string;
  keyPix: string;
  active: boolean;
};

export type UserStatusFilter = "todos" | "ativos" | "inativos";
export type UserKindFilter = "todos" | "empresa" | "terceiros";
