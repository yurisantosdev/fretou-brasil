import { DivideShipping, FinanceSummary, LockedBalance, StatusTrip, TripDetail, TripListItem } from "../types/trips";

export const STATUS_LABEL: Record<StatusTrip, string> = {
  AGUARDANDO_CTE: "Aguardando CT-e",
  AGUARDANDO_FOTO: "Aguardando foto",
  CARREGADA: "Carregada",
  EM_TRANSITO: "Em trânsito",
  AGUARDANDO_COMPROVANTE: "Aguardando comprovante",
  FINALIZADA: "Finalizada",
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

export function partesDoFrete(freteMotorista: number, divideShipping: DivideShipping) {
  const percentual = divideShipping === "70%" ? 70 : 50;
  const totalCentavos = Math.round(freteMotorista * 100);
  const adiantamentoCentavos = Math.round((totalCentavos * percentual) / 100);
  return {
    percentual,
    adiantamento: adiantamentoCentavos / 100,
    restante: (totalCentavos - adiantamentoCentavos) / 100,
  };
}

export function codigoViagem(id: string): string {
  return id.slice(-6).toUpperCase();
}

export function eventoDe(trip: TripDetail, tipo: TripDetail["events"][number]["type"]) {
  return trip.events.find((item) => item.type === tipo);
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
    const id = String(trip._id);
    margin += trip.margem.margemReais;
    const label = codigoViagem(id);
    const receber = trip.titles.find((item) => item.nature === "receber");
    const pagar = trip.titles.find((item) => item.nature === "pagar");

    if (!receber) {
      locked.push({
        id: `${id}-receber`,
        tripId: id,
        label,
        leg: "A receber",
        amount: trip.margem.freteCliente,
        reason: motivoTravado(trip.status),
      });
    } else if (!receber.liqiudateDate) {
      receiveOpen += receber.value;
      if (receber.expirationDate <= today) receiveToday += receber.value;
    }

    if (!pagar) {
      locked.push({
        id: `${id}-pagar`,
        tripId: id,
        label,
        leg: "A pagar",
        amount: trip.margem.freteMotorista,
        reason: motivoTravado(trip.status),
      });
    } else if (!pagar.liqiudateDate) {
      payOpen += pagar.value;
      if (pagar.expirationDate <= today) payToday += pagar.value;
    }
  }

  const lockedTotal = locked.reduce((sum, item) => sum + item.amount, 0);
  return { payToday, payOpen, receiveToday, receiveOpen, locked, lockedTotal, margin };
}

export function estadoHint(trip: TripDetail): string {
  const foto = trip.vouchers.some((item) => item.type === "FOTO_CARREGAMENTO");
  const descarga = trip.events.some((item) => item.type === "descarga");
  const comprovantes = trip.vouchers.some((item) => item.type === "ORIGINAIS");

  if (trip.status === "FINALIZADA") {
    return "CT-e, foto, descarga e comprovantes originais registrados. A ordem em que chegaram não muda este estado.";
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
