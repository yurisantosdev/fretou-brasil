import mongoose from "mongoose";
import { dataObrigatoria, textoObrigatorio } from "../domain/regrasViagem";
import { isDuplicate, ErroHttp } from "../lib/erroHttp";
import { idDaRota, tratar } from "../lib/http";
import { Cte } from "../models/Ctes";
import { detailTrip, exigirViagemAtiva, requireTrip, gravarEstado } from "./tripsController";
import { eventoUnico } from "./eventsController";

async function gravarCte(
  tripId: mongoose.Types.ObjectId,
  dados: { number: string; emitted: string },
): Promise<void> {
  const existente = await Cte.findOne({ tripId }).lean();
  if (existente) {
    if (existente.number !== dados.number || existente.emitted !== dados.emitted) {
      throw new ErroHttp(409, "Este CT-e já foi registrado com outros dados");
    }
    return;
  }

  try {
    await Cte.create({ tripId, number: dados.number, emitted: dados.emitted });
  } catch (err) {
    if (!isDuplicate(err)) throw err;
    const criado = await Cte.findOne({ tripId }).lean();
    if (!criado || criado.number !== dados.number || criado.emitted !== dados.emitted) {
      throw new ErroHttp(409, "Este CT-e já foi registrado com outros dados");
    }
  }
}

export const issueCte = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  exigirViagemAtiva(viagem);
  const dados = {
    number: textoObrigatorio(req.body.number, "number"),
    emitted: dataObrigatoria(req.body.emitted, "emitted"),
  };
  const existente = await Cte.findOne({ tripId: viagem._id }).lean();
  if (existente && (existente.number !== dados.number || existente.emitted !== dados.emitted)) {
    throw new ErroHttp(409, "Este CT-e já foi registrado com outros dados");
  }
  const repetido = await eventoUnico(viagem._id, "emissao_cte", dados.emitted, dados);
  await gravarCte(viagem._id, dados);
  await gravarEstado(viagem);
  const resultado = await detailTrip(viagem._id, repetido);
  res.status(resultado.idempotente ? 200 : 201).json(resultado);
});
