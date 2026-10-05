import { AcordoFreteType } from "../types/AcordosFrete";
import { ErroHttp } from "../lib/erroHttp";
import { NaturesTitles } from "../types/Titles";
import { MargemViagem, StatusTrip } from "../types/Trips";

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const DATA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export type FatosOperacionais = {
  cte: boolean;
  foto: boolean;
  descarga: boolean;
  comprovantes: boolean;
  carregamentoNoFuturo: boolean;
};

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

  if (prova && fatos.descarga && fatos.comprovantes) return "FINALIZADA";
  if (prova && fatos.descarga) return "AGUARDANDO_COMPROVANTE";
  if (prova) return fatos.carregamentoNoFuturo ? "CARREGADA" : "EM_TRANSITO";
  if (fatos.cte) return "AGUARDANDO_FOTO";
  return "AGUARDANDO_CTE";
}

export function margemDoAcordo(acordo: Pick<AcordoFreteType, "freteCliente" | "freteMotorista">): MargemViagem {
  const margemReais = acordo.freteCliente - acordo.freteMotorista;
  const margemPercentual =
    acordo.freteCliente === 0 ? null : Number(((margemReais / acordo.freteCliente) * 100).toFixed(2));

  return {
    freteCliente: acordo.freteCliente,
    freteMotorista: acordo.freteMotorista,
    margemReais,
    margemPercentual,
    negativa: margemReais < 0,
  };
}

export function titulosDaProva(entrada: {
  freteCliente: number;
  freteMotorista: number;
  prazoClienteDias: number;
  prazoMotoristaDias: number;
  emitted: string;
  received: string;
}): Array<{ nature: NaturesTitles; value: number; expirationDate: string }> {
  return [
    {
      nature: "receber",
      value: entrada.freteCliente,
      expirationDate: somarDias(entrada.emitted, entrada.prazoClienteDias),
    },
    {
      nature: "pagar",
      value: entrada.freteMotorista,
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
