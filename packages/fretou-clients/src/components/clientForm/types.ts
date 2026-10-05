import { Client, ClientFormData } from "@/src/types/clients";

export type ClientFormProps = {
  client: Client | null;
  onCancel: () => void;
  onSubmit: (data: ClientFormData) => void | Promise<void>;
};