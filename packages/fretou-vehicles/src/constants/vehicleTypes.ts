export const VEHICLE_TYPES = [
  "Van",
  "VUC",
  "Utilitário",
  "Toco",
  "Truck",
  "Bitruck",
  "Carreta",
  "Cavalo mecânico",
  "Ônibus",
] as const;

export type VehicleTypeName = (typeof VEHICLE_TYPES)[number];

export function isVehicleType(value: string): value is VehicleTypeName {
  return (VEHICLE_TYPES as readonly string[]).includes(value);
}
