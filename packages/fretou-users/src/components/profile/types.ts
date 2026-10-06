export type ProfileAccount = {
  id: string;
  name: string;
  cpf?: string;
  driver: boolean;
  thirdParty?: boolean;
  plateVehicle?: string;
  keyPix?: string;
  active: boolean;
};

export type ProfileProps = {
  account: ProfileAccount;
  onLogout: () => void;
  onUpdated?: (account: ProfileAccount) => void;
}