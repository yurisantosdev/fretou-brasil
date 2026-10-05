import { FieldProps } from "../types";

export function Field({ label, value }: FieldProps) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}