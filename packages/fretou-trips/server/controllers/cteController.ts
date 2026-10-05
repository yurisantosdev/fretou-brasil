import { dataObrigatoria, textoObrigatorio } from "../domain/regrasViagem";
import { idDaRota, tratar } from "../lib/http";
import { Cte } from "../models/Ctes";
import { detailTrip, requireTrip, gravarEstado } from "./tripsController";
import { eventoUnico } from "./eventsController";

export const issueCte = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  const dados = {
    number: textoObrigatorio(req.body.number, "number"),
    emitted: dataObrigatoria(req.body.emitted, "emitted"),
  };
  const repetido = await eventoUnico(viagem._id, "emissao_cte", dados.emitted, dados);
  const cte = await Cte.findOne({ tripId: viagem._id }).lean();
  if (!cte) {
    await Cte.create({ tripId: viagem._id, number: dados.number, emitted: dados.emitted });
  }
  await gravarEstado(viagem);
  const resultado = await detailTrip(viagem._id, repetido);
  res.status(resultado.idempotente ? 200 : 201).json(resultado);
});
