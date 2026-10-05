export type User = {
  _id: string;
  name: string;
  cpf?: string;
  password?: string;
  driver: boolean;
  plateVehicle?: string;
  keyPix?: string;
};

export type UserFormData = {
  name: string;
  cpf: string;
  password: string;
  driver: boolean;
  plateVehicle: string;
  keyPix: string;
};
