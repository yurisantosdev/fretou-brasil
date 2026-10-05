import { dataHoraObrigatoria, imagemJpeg, textoObrigatorio, textoOpcional } from "../domain/regrasViagem";
import { idDaRota, tratar } from "../lib/http";
import { Vouchers } from "../models/Vouchers";
import { eventoUnico } from "./eventsController";
import { detailTrip, requireTrip, gravarEstado } from "./tripsController";

export const attachPhoto = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  const name = textoObrigatorio(req.body.name, "name");
  const content = imagemJpeg(req.body.content);
  const received = textoOpcional(req.body.received)
    ? dataHoraObrigatoria(req.body.received, "received")
    : new Date().toISOString();
  const foto = await Vouchers.findOne({ tripId: viagem._id, type: "FOTO_CARREGAMENTO" }).lean();

  if (foto?.content) {
    await gravarEstado(viagem);
    res.json(await detailTrip(viagem._id, true));
    return;
  }

  const repetido = await eventoUnico(viagem._id, "foto_carregamento", received, { name, received });
  if (!foto) {
    await Vouchers.create({
      tripId: viagem._id,
      type: "FOTO_CARREGAMENTO",
      name,
      content,
      received,
    });
  } else {
    await Vouchers.updateOne({ _id: foto._id }, { name, content });
  }
  await gravarEstado(viagem);
  const resultado = await detailTrip(viagem._id, repetido);
  res.status(resultado.idempotente ? 200 : 201).json(resultado);
});

export const registerDocuments = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  const occurredAt = dataHoraObrigatoria(req.body.occurredAt, "occurredAt");
  const description = textoOpcional(req.body.description);
  const details = {
    occurredAt,
    ...(description ? { description } : {}),
  };
  const repetido = await eventoUnico(viagem._id, "comprovantes_originais", occurredAt, details);
  const comprovante = await Vouchers.findOne({ tripId: viagem._id, type: "ORIGINAIS" }).lean();
  if (!comprovante) {
    await Vouchers.create({
      tripId: viagem._id,
      type: "ORIGINAIS",
      name: description,
      received: occurredAt,
    });
  }
  await gravarEstado(viagem);
  const resultado = await detailTrip(viagem._id, repetido);
  res.status(resultado.idempotente ? 200 : 201).json(resultado);
});
