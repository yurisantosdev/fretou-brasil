import { Vehicle, VehicleFormData } from "../../types/vehicles";

export type VehicleFormProps = {
  vehicle: Vehicle | null;
  onCancel: () => void;
  onSubmit: (data: VehicleFormData) => void | Promise<void>;
};
