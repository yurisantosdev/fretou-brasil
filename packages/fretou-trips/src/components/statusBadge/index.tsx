import { STATUS_LABEL } from "../../lib/tripRules";
import { TripsResponse } from "../../types/trips";
import { useStatusBadge } from "./services";

export function StatusBadge({ trip }: { trip: TripsResponse }) {
  const data = useStatusBadge();
  if (!data) return null;
  const {
    STATUS_CLASS,
  } = data;

  return (
    <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-center text-xs font-bold whitespace-normal ${STATUS_CLASS[trip.status]}`}>
      {STATUS_LABEL[trip.status]}
    </span>
  );
}
