import { DivideShipping, FinanceSummary, LockedBalance, MargemViagem, StatusTrip, TripDetail, TripListItem } from "../types/trips";

export const STATUS_LABEL: Record<StatusTrip, string> = {
  AGUARDANDO_CTE: "Aguardando CT-e",
  AGUARDANDO_FOTO: "Aguardando foto",
  CARREGADA: "Carregada",
  EM_TRANSITO: "Em trânsito",
  AGUARDANDO_COMPROVANTE: "Aguardando comprovante",
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

export function todayISO(reference = new Date()): string {
  const year = reference.getFullYear();
  const month = String(reference.getMonth() + 1).padStart(2, "0");
  const day = String(reference.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nowLocalInput(reference = new Date()): string {
  const hours = String(reference.getHours()).padStart(2, "0");
  const minutes = String(reference.getMinutes()).padStart(2, "0");
  return `${todayISO(reference)}T${hours}:${minutes}`;
}

export function partiesFromShipping(freteMotorista: number, divideShipping: DivideShipping) {
  const percentual = divideShipping === "70%" ? 70 : 50;
  const totalCentavos = Math.round(freteMotorista * 100);
  const adiantamentoCentavos = Math.round((totalCentavos * percentual) / 100);
  return {
    percentual,
    adiantamento: adiantamentoCentavos / 100,
    restante: (totalCentavos - adiantamentoCentavos) / 100,
  };
}

export function codeTrip(id: string): string {
  return id.slice(-6).toUpperCase();
}

export function codigoExibido(trip: { _id: string; codigo?: string }): string {
  return trip.codigo || codeTrip(String(trip._id));
}

export function eventoDe(trip: TripDetail, tipo: TripDetail["events"][number]["type"]) {
  return trip.events.find((item) => item.type === tipo);
}

type TituloResumo = {
  nature: string;
  papel?: string;
  value?: number;
  liqiudateDate?: string;
  bloqueio?: string;
  expirationDate?: string;
};

function tituloCliente(titles: TituloResumo[]) {
  return titles.find((item) => item.papel === "cliente") ?? titles.find((item) => item.nature === "receber");
}

function titulosMotorista(titles: TituloResumo[]) {
  return titles.filter((item) => item.papel === "adiantamento" || item.papel === "saldo" || (item.nature === "pagar" && !item.papel));
}

export function saldoAReceber(trip: {
  margem: Pick<MargemViagem, "freteCliente">;
  titles: TituloResumo[];
}): number {
  const receber = tituloCliente(trip.titles);
  if (receber?.liqiudateDate) return 0;
  return receber?.value ?? trip.margem.freteCliente;
}

export function saldoAPagar(trip: {
  margem: Pick<MargemViagem, "freteMotorista">;
  divideShipping: DivideShipping;
  advancePaidAt?: string;
  titles: TituloResumo[];
}): number {
  const pagar = titulosMotorista(trip.titles);
  if (pagar.length === 0) return trip.margem.freteMotorista;
  return pagar.filter((item) => !item.liqiudateDate).reduce((soma, item) => soma + (item.value ?? 0), 0);
}

function motivoTravado(status: StatusTrip): string {
  if (status === "AGUARDANDO_FOTO") {
    return "Aguardando a foto do caminhão carregado. Os títulos saem quando CT-e e foto estiverem juntos.";
  }
  if (status === "AGUARDANDO_CTE") {
    return "Aguardando o CT-e. Os títulos saem quando CT-e e foto estiverem juntos.";
  }
  return "Os títulos ainda não foram gerados.";
}

export function summarize(trips: TripListItem[], today = todayISO()): FinanceSummary {
  let payToday = 0;
  let payOpen = 0;
  let receiveToday = 0;
  let receiveOpen = 0;
  let margin = 0;
  const locked: LockedBalance[] = [];

  for (const trip of trips) {
    if (trip.status === "CANCELADA") continue;
    const id = String(trip._id);
    margin += trip.margem.margemReais;
    const label = codigoExibido(trip);
    const receber = tituloCliente(trip.titles);
    const motorista = titulosMotorista(trip.titles);

    if (!receber) {
      const receberAberto = saldoAReceber(trip);
      if (receberAberto > 0) {
        locked.push({
          id: `${id}-receber`,
          tripId: id,
          label,
          leg: "A receber",
          amount: receberAberto,
          reason: motivoTravado(trip.status),
        });
      }
    } else if (!receber.liqiudateDate) {
      receiveOpen += receber.value ?? 0;
      if ((receber.expirationDate ?? "") <= today) receiveToday += receber.value ?? 0;
    }

    if (motorista.length === 0) {
      const pagarAberto = saldoAPagar(trip);
      if (pagarAberto > 0) {
        locked.push({
          id: `${id}-pagar`,
          tripId: id,
          label,
          leg: "A pagar",
          amount: pagarAberto,
          reason: motivoTravado(trip.status),
        });
      }
    }

    for (const titulo of motorista) {
      if (titulo.liqiudateDate) continue;
      const valor = titulo.value ?? 0;
      if (titulo.bloqueio) {
        locked.push({
          id: `${id}-${titulo.papel ?? "pagar"}`,
          tripId: id,
          label,
          leg: "A pagar",
          amount: valor,
          reason: titulo.bloqueio,
        });
        continue;
      }
      payOpen += valor;
      if ((titulo.expirationDate ?? "") <= today) payToday += valor;
    }
  }

  const lockedTotal = locked.reduce((sum, item) => sum + item.amount, 0);
  return { payToday, payOpen, receiveToday, receiveOpen, locked, lockedTotal, margin };
}

export function estadoHint(trip: TripDetail): string {
  const foto = trip.vouchers.some((item) => item.type === "FOTO_CARREGAMENTO");
  const descarga = trip.events.some((item) => item.type === "descarga");
  const comprovantes = trip.vouchers.some((item) => item.type === "ORIGINAIS");

  if (trip.status === "CANCELADA") {
    return "Viagem cancelada antes de começar. CT-e e foto não foram registrados.";
  }
  if (trip.status === "FINALIZADA") {
    return "CT-e, foto, descarga, comprovantes e as baixas do adiantamento e do saldo registrados.";
  }
  if (trip.status === "AGUARDANDO_PAGAMENTO") {
    return "Documentos completos. A viagem finaliza quando o adiantamento e o saldo do motorista forem baixados.";
  }
  if (trip.status === "AGUARDANDO_COMPROVANTE") {
    return "Descarga registrada com CT-e e foto. Falta a chegada dos comprovantes originais.";
  }
  if (trip.status === "CARREGADA") {
    return "CT-e e foto registrados. O carregamento ainda é futuro, então a viagem permanece carregada.";
  }
  if (trip.status === "EM_TRANSITO") {
    const extras = [
      descarga ? "a descarga já está lançada" : "",
      comprovantes ? "os comprovantes originais já chegaram" : "",
    ].filter(Boolean);
    const extra = extras.length > 0 ? ` ${extras.join(" e ")}.` : "";
    return `CT-e e foto do caminhão carregado registrados. A viagem começou.${extra}`;
  }
  if (trip.cte && !foto) {
    return "CT-e emitido. Falta a foto do caminhão carregado. Os títulos saem quando os dois estiverem juntos.";
  }
  if (foto && !trip.cte) {
    return "Foto enviada. Falta o CT-e. Os títulos saem quando os dois estiverem juntos.";
  }
  return "A viagem ainda não começou. Falta emitir o CT-e e enviar a foto do caminhão carregado.";
}
