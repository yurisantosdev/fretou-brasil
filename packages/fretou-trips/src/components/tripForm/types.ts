import { TripClient, TripDraft, TripDriver } from "@/src/types/trips";

export type TripFormProps = {
  clients: TripClient[];
  clientsError: string;
  drivers: TripDriver[];
  driversError: string;
  onCancel: () => void;
  onSubmit: (draft: TripDraft) => Promise<void>;
  onClientCreated: (client: TripClient) => void;
  onDriverCreated: (driver: TripDriver) => void;
};