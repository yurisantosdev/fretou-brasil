import { STATUS_LABEL } from "../../lib/tripRules";
import { StatusTrip, TripsResponse } from "@/src/types/trips";

const STATUS_CLASS: Record<StatusTrip, string> = {
  AGUARDANDO_CTE: "bg-canvas text-muted",
  AGUARDANDO_FOTO: "bg-amber-100 text-amber-800",
  CARREGADA: "bg-brand/10 text-brand",
  EM_TRANSITO: "bg-brand/10 text-brand",
  AGUARDANDO_COMPROVANTE: "bg-emerald-100 text-emerald-800",
  FINALIZADA: "bg-navy/10 text-navy",
};

export function StatusBadge({ trip }: { trip: TripsResponse }) {
  return (
    <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-center text-xs font-bold whitespace-normal ${STATUS_CLASS[trip.status]}`}>
      {STATUS_LABEL[trip.status]}
    </span>
  );
}
