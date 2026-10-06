"use client";

import { StatusTrip } from "@/src/types/trips";

export function useStatusBadge() {
  const STATUS_CLASS: Record<StatusTrip, string> = {
    AGUARDANDO_CTE: "bg-canvas text-muted",
    AGUARDANDO_FOTO: "bg-amber-100 text-amber-800",
    CARREGADA: "bg-brand/10 text-brand",
    EM_TRANSITO: "bg-brand/10 text-brand",
    AGUARDANDO_COMPROVANTE: "bg-emerald-100 text-emerald-800",
    AGUARDANDO_PAGAMENTO: "bg-amber-100 text-amber-800",
    FINALIZADA: "bg-navy/10 text-navy",
    CANCELADA: "bg-canvas text-muted",
  };
  return {
    STATUS_CLASS
  };
}
