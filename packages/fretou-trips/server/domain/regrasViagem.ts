import type { AcordoFreteType } from "../types/AcordosFrete";
import { ErroHttp } from "../lib/erroHttp";
import type { NaturesTitles, PapelTitulo } from "../types/Titles";
import type { DivideShipping, MargemViagem, StatusTrip } from "../types/Trips";

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const DATA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export type FatosOperacionais = {
  cte: boolean;
  foto: boolean;
  descarga: boolean;
  comprovantes: boolean;
  carregamentoNoFuturo: boolean;
  adiantamentoQuitado: boolean;
  saldoQuitado: boolean;
};

export function centavosDeReais(valor: number): number {
  if (!Number.isFinite(valor)) {
    throw new ErroHttp(400, "Valor monetário inválido");
  }
  return Math.round(valor * 100);
}

export function reaisDeCentavos(centavos: number): number {
  return centavos / 100;
}

export function prazoEmDias(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isInteger(valor) && valor >= 0) return valor;
  if (typeof valor !== "string") return null;
  const encontrado = valor.match(/\d+/);
  if (!encontrado) return null;
  const dias = Number(encontrado[0]);
  return Number.isInteger(dias) && dias >= 0 ? dias : null;
}

export function textoObrigatorio(valor: unknown, campo: string): string {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new ErroHttp(400, `Campo ${campo} é obrigatório`);
  }
  return valor.trim();
}

export function textoOpcional(valor: unknown): string | undefined {
  if (typeof valor !== "string") return undefined;
  const limpo = valor.trim();
  return limpo.length > 0 ? limpo : undefined;
}

export function dataObrigatoria(valor: unknown, campo: string): string {
  const texto = textoObrigatorio(valor, campo);
  if (!DATA.test(texto.slice(0, 10)) || Number.isNaN(Date.parse(texto.slice(0, 10)))) {
    throw new ErroHttp(400, `Campo ${campo} precisa ser uma data AAAA-MM-DD`);
  }
  return texto.slice(0, 10);
}

export function dataHoraObrigatoria(valor: unknown, campo: string): string {
  const texto = textoObrigatorio(valor, campo);
  if (!DATA_HORA.test(texto) || Number.isNaN(Date.parse(texto))) {
    throw new ErroHttp(400, `Campo ${campo} precisa ser uma data e hora`);
  }
  return texto.length === 16 ? `${texto}:00` : texto;
}

export function hojeISO(referencia = new Date()): string {
  const ano = referencia.getFullYear();
  const mes = String(referencia.getMonth() + 1).padStart(2, "0");
  const dia = String(referencia.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function somarDias(isoDate: string, dias: number): string {
  const [ano, mes, dia] = isoDate.slice(0, 10).split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  data.setDate(data.getDate() + dias);
  return hojeISO(data);
}

export function resolverEstado(fatos: FatosOperacionais): StatusTrip {
  const prova = fatos.cte && fatos.foto;
  const documentos = prova && fatos.descarga && fatos.comprovantes;
  const pagamentos = fatos.adiantamentoQuitado && fatos.saldoQuitado;

  if (documentos && pagamentos) return "FINALIZADA";
  if (documentos) return "AGUARDANDO_PAGAMENTO";
  if (prova && fatos.descarga) return "AGUARDANDO_COMPROVANTE";
  if (prova) return fatos.carregamentoNoFuturo ? "CARREGADA" : "EM_TRANSITO";
  if (fatos.cte) return "AGUARDANDO_FOTO";
  return "AGUARDANDO_CTE";
}

export function podeEditarViagem(status: StatusTrip): boolean {
  return status !== "FINALIZADA" && status !== "CANCELADA";
}

export function motivoCancelamento(fatos: { cte: boolean; foto: boolean; titulos: boolean }): string | null {
  if (!fatos.cte && !fatos.foto && !fatos.titulos) return null;
  return "A viagem já começou e não pode ser cancelada.";
}

export function motivoBloqueioSaldo(
  fatos: Pick<FatosOperacionais, "descarga" | "comprovantes">,
  acao: "programar" | "baixar",
): string | null {
  if (fatos.descarga && fatos.comprovantes) return null;
  if (!fatos.descarga) {
    return acao === "programar"
      ? "O saldo não pode ser programado antes do registro da descarga."
      : "O saldo não pode ser baixado antes do registro da descarga.";
  }
  return acao === "programar"
    ? "O saldo não pode ser programado antes da chegada dos comprovantes."
    : "O saldo não pode ser baixado antes da chegada dos comprovantes.";
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

export function margemDoAcordo(acordo: Pick<AcordoFreteType, "freteCliente" | "freteMotorista">): MargemViagem {
  const freteCliente = centavosDeReais(acordo.freteCliente);
  const freteMotorista = centavosDeReais(acordo.freteMotorista);
  const margemCentavos = freteCliente - freteMotorista;
  const margemPercentual =
    freteCliente === 0 ? null : Math.round((margemCentavos * 10000) / freteCliente) / 100;

  return {
    freteCliente: reaisDeCentavos(freteCliente),
    freteMotorista: reaisDeCentavos(freteMotorista),
    margemReais: reaisDeCentavos(margemCentavos),
    margemPercentual,
    negativa: margemCentavos < 0,
  };
}

export type TituloPrevisto = {
  papel: PapelTitulo;
  nature: NaturesTitles;
  value: number;
  expirationDate: string;
};

export function titulosDaProva(entrada: {
  freteCliente: number;
  freteMotorista: number;
  divideShipping: DivideShipping;
  prazoClienteDias: number;
  prazoMotoristaDias: number;
  emitted: string;
  received: string;
  adiantamento?: number;
  saldo?: number;
}): TituloPrevisto[] {
  const partes = partiesFromShipping(entrada.freteMotorista, entrada.divideShipping);
  const adiantamentoInformado =
    typeof entrada.adiantamento === "number" ? centavosDeReais(entrada.adiantamento) : null;
  const saldoInformado = typeof entrada.saldo === "number" ? centavosDeReais(entrada.saldo) : null;
  const partesConferem =
    adiantamentoInformado !== null &&
    saldoInformado !== null &&
    adiantamentoInformado + saldoInformado === centavosDeReais(entrada.freteMotorista);
  const adiantamento = partesConferem ? adiantamentoInformado : centavosDeReais(partes.adiantamento);
  const saldo = partesConferem ? saldoInformado : centavosDeReais(partes.restante);

  return [
    {
      papel: "cliente",
      nature: "receber",
      value: reaisDeCentavos(centavosDeReais(entrada.freteCliente)),
      expirationDate: somarDias(entrada.emitted, entrada.prazoClienteDias),
    },
    {
      papel: "adiantamento",
      nature: "pagar",
      value: reaisDeCentavos(adiantamento),
      expirationDate: somarDias(entrada.received, 0),
    },
    {
      papel: "saldo",
      nature: "pagar",
      value: reaisDeCentavos(saldo),
      expirationDate: somarDias(entrada.received, entrada.prazoMotoristaDias),
    },
  ];
}

const LIMITE_FOTO = 1_500_000;

export function imagemJpeg(valor: unknown): string {
  const texto = textoObrigatorio(valor, "content");
  if (!texto.startsWith("data:image/jpeg;base64,")) {
    throw new ErroHttp(400, "A foto precisa ser uma imagem JPEG");
  }
  if (texto.length > LIMITE_FOTO) {
    throw new ErroHttp(422, "A foto ficou grande demais. Envie uma imagem menor.");
  }
  return texto;
}

export function mesmaCarga(atual: Record<string, unknown>, recebida: Record<string, unknown>): boolean {
  const chaves: any = new Set([...Object.keys(atual), ...Object.keys(recebida)]);
  for (const chave of chaves) {
    if (String(atual[chave] ?? "") !== String(recebida[chave] ?? "")) return false;
  }
  return true;
}
