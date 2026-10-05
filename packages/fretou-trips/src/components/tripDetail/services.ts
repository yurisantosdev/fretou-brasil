"use client";

import { NaturesTitles } from "@/src/types/trips";
import { TripDetailProps } from "./types";
import {
  eventoDe,
  nowLocalInput,
} from "../../lib/tripRules";
import { FormEvent, useState } from "react";
import { formatMoney } from "@fretou/components";

export function useTripDetail({
  trip,
  onIssueCte,
  onAttachPhoto,
  onRegisterUnload,
  onRegisterOriginalDocuments,
  onSettle,
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
  const receber = trip.titles.find((item) => item.nature === "receber");
  const pagar = trip.titles.find((item) => item.nature === "pagar");
  const [cteNumber, setCteNumber] = useState(trip.cte?.number ?? "");
  const [cteDate, setCteDate] = useState(trip.cte?.emitted ?? trip.dateLoad);
  const [unloadedAt, setUnloadedAt] = useState(descarga?.occurredAt.slice(0, 16) ?? nowLocalInput());
  const [documentsAt, setDocumentsAt] = useState(comprovantes?.received.slice(0, 16) ?? nowLocalInput());
  const [receivedAt, setReceivedAt] = useState(nowLocalInput());
  const [paidAt, setPaidAt] = useState(nowLocalInput());
  const [error, setError] = useState("");

  async function emitirCte(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cteNumber.trim() || !cteDate) {
      setError("Informe o número e a data do CT-e.");
      return;
    }
    setError("");
    try {
      await onIssueCte(cteNumber.trim(), cteDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar o CT-e.");
    }
  }

  async function enviarFoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem do caminhão carregado.");
      return;
    }
    setError("");
    try {
      const conteudo = await comprimirImagem(file);
      await onAttachPhoto(file.name, new Date().toISOString(), conteudo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível anexar a foto.");
    }
  }

  async function registrarDescarga(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!unloadedAt || unloadedAt.slice(0, 10) < trip.dateLoad) {
      setError("A descarga precisa de data e hora, e não pode ser anterior ao carregamento.");
      return;
    }
    setError("");
    try {
      await onRegisterUnload(unloadedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar a descarga.");
    }
  }

  async function liquidar(natureza: NaturesTitles, dataHora: string) {
    if (!dataHora) {
      setError("Informe a data e a hora do lançamento.");
      return;
    }
    setError("");
    try {
      await onSettle(natureza, dataHora);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar o lançamento.");
    }
  }

  async function registrarComprovantes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!documentsAt) {
      setError("Informe a data e a hora em que os comprovantes originais chegaram.");
      return;
    }
    setError("");
    try {
      await onRegisterOriginalDocuments(documentsAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar os comprovantes.");
    }
  }

  const margem = trip.margem.negativa
    ? `${formatMoney(trip.margem.margemReais)} negativa`
    : formatMoney(trip.margem.margemReais);

  return {
    descarga,
    comprovantes,
    margem,
    receber,
    pagar,
    liquidar,
    receivedAt,
    setReceivedAt,
    paidAt,
    setPaidAt,
    foto,
    enviarFoto,
    registrarDescarga,
    registrarComprovantes,
    error,
    cteNumber,
    setCteNumber,
    cteDate,
    setCteDate,
    emitirCte,
    inputClass,
    unloadedAt,
    documentsAt,
    setUnloadedAt,
    setDocumentsAt
  };
}
