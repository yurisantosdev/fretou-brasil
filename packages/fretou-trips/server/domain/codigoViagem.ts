import { Counter } from "../models/Counters";
import { Trip } from "../models/Trips";

const CODIGO = /^V-\d{4}-\d{6}$/;

export function codigoValido(codigo: string): boolean {
  return CODIGO.test(codigo);
}

export async function proximoCodigoViagem(ano = new Date().getFullYear()): Promise<string> {
  const contador = await Counter.findOneAndUpdate(
    { _id: `viagem-${ano}` },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );
  const sequence = contador?.sequence ?? 1;
  return `V-${ano}-${sequence.toString().padStart(6, "0")}`;
}

const semCodigo = { $or: [{ codigo: { $exists: false } }, { codigo: null }, { codigo: "" }] };

let pendentes: Promise<void> | null = null;

export function garantirCodigosExistentes(): Promise<void> {
  pendentes ??= atribuirCodigosPendentes().catch((err) => {
    pendentes = null;
    throw err;
  });
  return pendentes;
}

async function atribuirCodigosPendentes(): Promise<void> {
  const viagens = await Trip.find(semCodigo).sort({ createdAt: 1 });
  for (const viagem of viagens) {
    const ano = viagem.createdAt instanceof Date ? viagem.createdAt.getFullYear() : new Date().getFullYear();
    const codigo = await proximoCodigoViagem(ano);
    await Trip.updateOne({ _id: viagem._id, ...semCodigo }, { $set: { codigo } });
  }
}
