export type Client = {
  _id: string;
  corporateName: string;
  cnpj: string;
  timePeriod: string;
  active?: boolean;
};

export type ClientFormData = {
  corporateName: string;
  cnpj: string;
  timePeriod: string;
  active: boolean;
};

export type ClientStatusFilter = "todos" | "ativos" | "inativos";
