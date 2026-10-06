"use client";

import { PapelTitulo } from "@/src/types/trips";
import { TripDetailProps } from "./types";
import {
  eventoDe,
  nowLocalInput,
  partiesFromShipping
} from "../../lib/tripRules";
import { FormEvent, useState } from "react";
import { AlertError, AlertSuccess, formatDateTime, formatMoney } from "@fretou/components";

export function useTripDetail({
  trip,
  onIssueCte,
  onAttachPhoto,
  onRegisterUnload,
  onRegisterOriginalDocuments,
  onSettle,
  onRegisterAdvance,
  onScheduleBalance,
  onCancelTrip,
}: TripDetailProps) {
  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-white px-4 text-base text-navy outline-none transition placeholder:text-placeholder focus:border-brand focus:shadow-[0_0_0_4px_rgba(28,68,242,0.14)]";

  function comprimirImagem(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const limite = 1280;
        const escala = Math.min(1, limite / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * escala));
        canvas.height = Math.max(1, Math.round(image.height * escala));
        const contexto = canvas.getContext("2d");
        if (!contexto) {
          URL.revokeObjectURL(url);
          reject(new Error("Não foi possível preparar a imagem."));
          return;
        }
        contexto.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Não foi possível ler a imagem."));
      };
      image.src = url;
    });
  }

  const foto = trip.vouchers.find((item) => item.type === "FOTO_CARREGAMENTO");
  const comprovantes = trip.vouchers.find((item) => item.type === "ORIGINAIS");
  const descarga = eventoDe(trip, "descarga");
  const receber = trip.titles.find((item) => item.papel === "cliente") ?? trip.titles.find((item) => item.nature === "receber");
  const adiantamento = trip.titles.find((item) => item.papel === "adiantamento");
  const saldo = trip.titles.find((item) => item.papel === "saldo");
  const [cteNumber, setCteNumber] = useState(trip.cte?.number ?? "");
  const [cteDate, setCteDate] = useState(trip.cte?.emitted ?? trip.dateLoad);
  const [unloadedAt, setUnloadedAt] = useState(descarga?.occurredAt.slice(0, 16) ?? nowLocalInput());
  const [documentsAt, setDocumentsAt] = useState(comprovantes?.received.slice(0, 16) ?? nowLocalInput());
  const [receivedAt, setReceivedAt] = useState(nowLocalInput());
  const [paidAt, setPaidAt] = useState(nowLocalInput());
  const [advanceAt, setAdvanceAt] = useState(nowLocalInput());
  const [scheduleAt, setScheduleAt] = useState(saldo?.scheduledAt?.slice(0, 16) ?? nowLocalInput());
  const parties = partiesFromShipping(trip.margem.freteMotorista, trip.divideShipping);
  const cancelTrip = trip.status === "AGUARDANDO_CTE" && !trip.cte && !foto;

  async function emitirCte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cteNumber.trim() || !cteDate) {
      AlertError("Informe o número e a data do CT-e.");
      return;
    }
    try {
      await onIssueCte(cteNumber.trim(), cteDate);
      AlertSuccess(
        foto
          ? "CT-e registrado."
          : "CT-e registrado. Falta a foto do caminhão carregado. Nenhum título foi gerado.",
      );
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível registrar o CT-e.");
    }
  }

  function formatAnexo(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return formatDateTime(value);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(date)
      .replace(",", "");
  }


  async function enviarFoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      AlertError("Envie uma imagem do caminhão carregado.");
      return;
    }
    try {
      const conteudo = await comprimirImagem(file);
      await onAttachPhoto(file.name, new Date().toISOString(), conteudo);
      AlertSuccess(
        trip.cte
          ? "Foto anexada. Adiantamento, saldo e título do cliente foram gerados."
          : "Foto anexada. Os títulos saem quando o CT-e também estiver registrado.",
      );
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível anexar a foto.");
    }
  }

  async function registrarDescarga(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!unloadedAt || unloadedAt.slice(0, 10) < trip.dateLoad) {
      AlertError("A descarga precisa de data e hora, e não pode ser anterior ao carregamento.");
      return;
    }

    try {
      await onRegisterUnload(unloadedAt);
      AlertSuccess("Descarga registrada com sucesso.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível registrar a descarga.");
    }
  }

  async function liquidar(papel: PapelTitulo, dataHora: string) {
    if (papel === "saldo" && saldo?.bloqueio) {
      AlertError(saldo.bloqueio);
      return;
    }
    if (!dataHora) {
      AlertError("Informe a data e a hora do lançamento.");
      return;
    }

    try {
      await onSettle(papel, dataHora);
      AlertSuccess("Lançamento registrado com sucesso.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível registrar o lançamento.");
    }
  }

  async function registrarAdiantamento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!advanceAt) {
      AlertError("Informe a data e a hora do adiantamento.");
      return;
    }

    try {
      await onRegisterAdvance(advanceAt);
      AlertSuccess("Adiantamento registrado com sucesso.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível registrar o adiantamento.");
    }
  }

  async function programarSaldo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saldo?.bloqueio) {
      AlertError(saldo.bloqueio);
      return;
    }
    if (!scheduleAt) {
      AlertError("Informe a data e a hora da programação do saldo.");
      return;
    }
    try {
      await onScheduleBalance(scheduleAt);
      AlertSuccess("Saldo programado.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível programar o saldo.");
    }
  }

  async function cancelarViagem() {
    const confirmado = window.confirm("Cancelar esta viagem? Ela ainda não começou.");
    if (!confirmado) return;
    try {
      await onCancelTrip();
      AlertSuccess("Viagem cancelada.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível cancelar a viagem.");
    }
  }

  async function registrarComprovantes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!documentsAt) {
      AlertError("Informe a data e a hora em que os comprovantes originais chegaram.");
      return;
    }

    try {
      await onRegisterOriginalDocuments(documentsAt);
      AlertSuccess("Comprovantes registrados com sucesso.");
    } catch (err) {
      AlertError(err instanceof Error ? err.message : "Não foi possível registrar os comprovantes.");
    }
  }

  const margem = trip.margem.negativa
    ? `Margem negativa · ${formatMoney(trip.margem.margemReais)}`
    : formatMoney(trip.margem.margemReais);

  return {
    descarga,
    comprovantes,
    margem,
    receber,
    adiantamento,
    saldo,
    liquidar,
    receivedAt,
    setReceivedAt,
    paidAt,
    setPaidAt,
    foto,
    enviarFoto,
    registrarDescarga,
    registrarComprovantes,
    registrarAdiantamento,
    programarSaldo,
    cancelarViagem,
    scheduleAt,
    setScheduleAt,
    advanceAt,
    setAdvanceAt,
    cteNumber,
    setCteNumber,
    cteDate,
    setCteDate,
    emitirCte,
    inputClass,
    unloadedAt,
    documentsAt,
    setUnloadedAt,
    setDocumentsAt,
    formatAnexo,
    parties,
    cancelTrip
  };
}
