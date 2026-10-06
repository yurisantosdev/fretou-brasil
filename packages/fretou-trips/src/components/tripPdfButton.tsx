"use client";

import { useState } from "react";
import { CircleNotchIcon, FilePdfIcon } from "@phosphor-icons/react";
import { AlertError, Tooltip } from "@fretou/components";
import type { TripDetail } from "../types/trips";

export function TripPdfButton({ trip }: { trip: TripDetail }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (busy) return;
    setBusy(true);
    try {
      const { downloadTripPdf } = await import("../lib/downloadTripPdf");
      await downloadTripPdf(trip);
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível gerar o PDF da viagem.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Tooltip label="Baixar PDF da viagem" side="bottom">
      <button
        type="button"
        aria-label="Baixar PDF da viagem"
        aria-busy={busy}
        disabled={busy}
        className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-navy transition hover:bg-canvas disabled:cursor-wait disabled:opacity-60"
        onClick={() => void download()}
      >
        {busy ? <CircleNotchIcon size={18} className="animate-spin" /> : <FilePdfIcon size={18} />}
      </button>
    </Tooltip>
  );
}
