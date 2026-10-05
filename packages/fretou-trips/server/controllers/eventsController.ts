import mongoose from "mongoose";
import { dataHoraObrigatoria, mesmaCarga } from "../domain/regrasViagem";
import { ErroHttp } from "../lib/erroHttp";
import { idDaRota, tratar } from "../lib/http";
import { Events } from "../models/Events";
import { TypesEvents } from "../types/Events";
import { detailTrip, requireTrip, gravarEstado } from "./tripsController";

export async function eventoUnico(
  tripId: mongoose.Types.ObjectId,
  type: TypesEvents,
  occurredAt: string,
  details: Record<string, unknown>,
): Promise<boolean> {
  const existente = await Events.findOne({ tripId, type }).lean();
  if (!existente) {
    await Events.create({ tripId, type, occurredAt, details });
    return false;
  }
  const dadosAtuais =
    existente.details && typeof existente.details === "object" && !Array.isArray(existente.details)
      ? (existente.details as Record<string, unknown>)
      : {};
  if (!mesmaCarga(dadosAtuais, details)) {
    throw new ErroHttp(409, "Este evento já foi registrado com outros dados");
  }
  return true;
}

export const registerUnload = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  const occurredAt = dataHoraObrigatoria(req.body.occurredAt, "occurredAt");
  if (occurredAt.slice(0, 10) < viagem.dateLoad) {
    throw new ErroHttp(422, "A descarga não pode ser anterior ao carregamento");
  }
  const repetido = await eventoUnico(viagem._id, "descarga", occurredAt, { occurredAt });
  await gravarEstado(viagem);
  const resultado = await detailTrip(viagem._id, repetido);
  res.status(resultado.idempotente ? 200 : 201).json(resultado);
});
