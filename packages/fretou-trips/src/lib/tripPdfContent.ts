import { formatDate, formatDateTime, formatMoney, formatWeight } from "@fretou/components";
import type { StatusTrip, TripDetail } from "../types/trips";
import {
  codigoExibido,
  estadoHint,
  eventoDe,
  saldoAPagar,
  saldoAReceber,
  STATUS_LABEL,
} from "./tripRules";

export type PdfField = {
  label: string;
  value: string;
};

export type PdfTimelineItem = {
  title: string;
  detail: string;
  done: boolean;
};

export type TripPdfContent = {
  fileName: string;
  code: string;
  client: string;
  route: string;
  status: StatusTrip;
  statusLabel: string;
  hint: string;
  generatedAt: string;
  identification: PdfField[];
  routeFields: PdfField[];
  financeHighlights: PdfField[];
  financeDetails: PdfField[];
  cte: PdfField[];
  timeline: PdfTimelineItem[];
  photo?: string;
};

function empty(value?: string): string {
  const text = value?.trim();
  return text ? text : "-";
}

function generatedAt(reference = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(reference.getDate())}/${pad(reference.getMonth() + 1)}/${reference.getFullYear()} ${pad(reference.getHours())}:${pad(reference.getMinutes())}`;
}

export function tripPdfFileName(trip: Pick<TripDetail, "id" | "codigo">): string {
  const code = codigoExibido({ _id: trip.id, codigo: trip.codigo });
  return `${code.replace(/[^\w.-]+/g, "-")}-viagem.pdf`;
}

function vehicleLabel(trip: TripDetail): string {
  if (!trip.plate) return "-";
  return trip.vehicleModel ? `${trip.plate} · ${trip.vehicleModel}` : trip.plate;
}

function marginLabel(trip: TripDetail): string {
  const value = formatMoney(trip.margem.margemReais);
  return trip.margem.negativa ? `Margem negativa · ${value}` : value;
}

export function buildTripPdfContent(trip: TripDetail, reference = new Date()): TripPdfContent {
  const foto = trip.vouchers.find((item) => item.type === "FOTO_CARREGAMENTO");
  const comprovantes = trip.vouchers.find((item) => item.type === "ORIGINAIS");
  const descarga = eventoDe(trip, "descarga");
  const receber = trip.titles.find((item) => item.papel === "cliente") ?? trip.titles.find((item) => item.nature === "receber");
  const adiantamento = trip.titles.find((item) => item.papel === "adiantamento");
  const saldo = trip.titles.find((item) => item.papel === "saldo");
  const adiantamentoPago = trip.advancePaidAt ?? adiantamento?.liqiudateDate;

  const photo =
    foto?.content && /^data:image\/(png|jpe?g);/i.test(foto.content) ? foto.content : undefined;

  return {
    fileName: tripPdfFileName(trip),
    code: codigoExibido({ _id: trip.id, codigo: trip.codigo }),
    client: empty(trip.clienteNome),
    route: `${empty(trip.origin)} - ${empty(trip.destination)}`,
    status: trip.status,
    statusLabel: STATUS_LABEL[trip.status],
    hint: estadoHint(trip),
    generatedAt: generatedAt(reference),
    identification: [
      { label: "Cliente", value: empty(trip.clienteNome) },
      { label: "Motorista", value: empty(trip.motoristaNome) },
      { label: "Veículo", value: vehicleLabel(trip) },
      { label: "Estado", value: STATUS_LABEL[trip.status] },
    ],
    routeFields: [
      { label: "Origem", value: empty(trip.origin) },
      { label: "Destino", value: empty(trip.destination) },
      { label: "Produto", value: empty(trip.product) },
      { label: "Carga", value: formatWeight(trip.load) },
      { label: "Carregamento", value: formatDate(trip.dateLoad) },
      { label: "Descarga", value: formatDateTime(descarga?.occurredAt ?? trip.dateDischarge) },
      { label: "Comprovantes originais", value: formatDateTime(comprovantes?.received) },
    ],
    financeHighlights: [
      { label: "Frete a receber", value: formatMoney(saldoAReceber(trip)) },
      { label: "Frete a pagar", value: formatMoney(saldoAPagar(trip)) },
      { label: "Margem da viagem", value: marginLabel(trip) },
    ],
    financeDetails: [
      { label: "Divisão do frete ao motorista", value: empty(trip.divideShipping) },
      {
        label: "Título a receber",
        value: receber
          ? `${formatMoney(receber.value)} · vence ${formatDate(receber.expirationDate)}`
          : "Ainda não gerado",
      },
      {
        label: "Adiantamento",
        value: adiantamento
          ? `${formatMoney(adiantamento.value)}${adiantamento.liqiudateDate ? " · baixado" : ""}`
          : "Ainda não gerado",
      },
      {
        label: "Saldo",
        value: saldo
          ? `${formatMoney(saldo.value)}${saldo.bloqueio ? " · bloqueado" : saldo.liqiudateDate ? " · baixado" : " · liberado"}`
          : "Ainda não gerado",
      },
      {
        label: "Prazos",
        value: `Cliente ${trip.acordoFrete.prazoClienteDias} dia(s) após o CT-e · Motorista ${trip.acordoFrete.prazoMotoristaDias} dia(s) após a foto`,
      },
    ],
    cte: trip.cte
      ? [
          { label: "Número", value: empty(trip.cte.number) },
          { label: "Emissão", value: formatDate(trip.cte.emitted) },
        ]
      : [{ label: "Situação", value: "Ainda não emitido" }],
    timeline: [
      {
        title: "CT-e",
        detail: trip.cte ? `Emitido em ${formatDate(trip.cte.emitted)}, número ${trip.cte.number}.` : "Ainda não emitido.",
        done: Boolean(trip.cte),
      },
      {
        title: "Foto do caminhão carregado",
        detail: foto ? `Enviada em ${formatDateTime(foto.received)}.` : "Ainda não enviada.",
        done: Boolean(foto),
      },
      {
        title: "Descarga",
        detail: descarga || trip.dateDischarge
          ? `Registrada em ${formatDateTime(descarga?.occurredAt ?? trip.dateDischarge)}.`
          : "Ainda não registrada.",
        done: Boolean(descarga || trip.dateDischarge),
      },
      {
        title: "Comprovantes originais",
        detail: comprovantes ? `Chegaram em ${formatDateTime(comprovantes.received)}.` : "Ainda não chegaram.",
        done: Boolean(comprovantes),
      },
      {
        title: "Adiantamento",
        detail: adiantamentoPago
          ? `Pago em ${formatDateTime(adiantamentoPago)}.`
          : adiantamento
            ? `${formatMoney(adiantamento.value)} gerado. Ainda não baixado.`
            : "Ainda não gerado.",
        done: Boolean(adiantamentoPago),
      },
      {
        title: "Saldo",
        detail: !saldo
          ? "Ainda não gerado."
          : saldo.bloqueio
            ? saldo.bloqueio
            : saldo.liqiudateDate
              ? `Pago em ${formatDateTime(saldo.liqiudateDate)}.`
              : saldo.scheduledAt
                ? `Programado para ${formatDateTime(saldo.scheduledAt)}.`
                : `${formatMoney(saldo.value)} · liberado, ainda sem programação.`,
        done: Boolean(saldo?.liqiudateDate),
      },
      {
        title: "Recebimento do cliente",
        detail: receber?.liqiudateDate
          ? `Recebido em ${formatDateTime(receber.liqiudateDate)}.`
          : receber
            ? `${formatMoney(receber.value)} · ainda não recebido.`
            : "Ainda não gerado.",
        done: Boolean(receber?.liqiudateDate),
      },
    ],
    photo,
  };
}
