import { dataHoraObrigatoria, textoObrigatorio } from "../domain/regrasViagem";
import { ErroHttp } from "../lib/erroHttp";
import { idDaRota, tratar } from "../lib/http";
import { Title } from "../models/Titles";
import { Trip } from "../models/Trips";
import { requireTrip, detailTrip } from "./tripsController";

export const settleTitle = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  const nature = textoObrigatorio(req.body.nature, "nature");
  if (nature !== "receber" && nature !== "pagar") {
    throw new ErroHttp(400, "A natureza precisa ser receber ou pagar");
  }
  const occurredAt = dataHoraObrigatoria(req.body.occurredAt, "occurredAt");
  const titulo = await Title.findOne({ tripId: viagem._id, nature }).lean();
  if (!titulo) {
    throw new ErroHttp(422, "O título ainda não foi gerado. Ele sai quando CT-e e foto existem.");
  }
  if (titulo.liqiudateDate) {
    res.json(await detailTrip(viagem._id, true));
    return;
  }
  await Title.updateOne({ _id: titulo._id }, { liqiudateDate: occurredAt });
  await Trip.updateOne({ _id: viagem._id }, { updatedAt: new Date() });
  res.status(201).json(await detailTrip(viagem._id, false));
});
