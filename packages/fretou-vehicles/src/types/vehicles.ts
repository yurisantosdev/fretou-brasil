export type Vehicle = {
  _id: string;
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
  thirdParty?: boolean;
};

export type VehicleFormData = {
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
};

export type VehicleStatusFilter = "todos" | "ativos" | "inativos";
