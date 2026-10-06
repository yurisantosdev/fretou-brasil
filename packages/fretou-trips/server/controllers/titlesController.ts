import { dataHoraObrigatoria, motivoBloqueioSaldo, textoObrigatorio } from "../domain/regrasViagem";
import { ErroHttp } from "../lib/erroHttp";
import { idDaRota, tratar } from "../lib/http";
import { Events } from "../models/Events";
import { Title } from "../models/Titles";
import { Trip } from "../models/Trips";
import { Vouchers } from "../models/Vouchers";
import { PAPEIS_TITULO, PapelTitulo } from "../types/Titles";
import { TripsType } from "../types/Trips";
import { requireTrip, detailTrip, exigirViagemAtiva, gravarEstado } from "./tripsController";

function papelInformado(valor: unknown): PapelTitulo {
  const papel = textoObrigatorio(valor, "papel");
  if (!(PAPEIS_TITULO as readonly string[]).includes(papel)) {
    throw new ErroHttp(400, "O papel precisa ser cliente, adiantamento ou saldo");
  }
  return papel as PapelTitulo;
}

async function bloqueioDoSaldo(viagem: TripsType, acao: "programar" | "baixar"): Promise<string | null> {
  const [descarga, comprovantes] = await Promise.all([
    Events.exists({ tripId: viagem._id, type: "descarga" }),
    Vouchers.exists({ tripId: viagem._id, type: "ORIGINAIS" }),
  ]);
  return motivoBloqueioSaldo({ descarga: Boolean(descarga), comprovantes: Boolean(comprovantes) }, acao);
}

export const settleTitle = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  exigirViagemAtiva(viagem);
  const papel = papelInformado(req.body.papel);
  const occurredAt = dataHoraObrigatoria(req.body.occurredAt, "occurredAt");
  const titulo = await Title.findOne({ tripId: viagem._id, papel }).lean();
  if (!titulo) {
    throw new ErroHttp(422, "O título ainda não foi gerado. Ele sai quando CT-e e foto existem.");
  }
  if (titulo.liqiudateDate) {
    res.json(await detailTrip(viagem._id, true));
    return;
  }
  if (papel === "saldo") {
    const bloqueio = await bloqueioDoSaldo(viagem, "baixar");
    if (bloqueio) throw new ErroHttp(422, bloqueio);
  }

  await Title.updateOne({ _id: titulo._id }, { liqiudateDate: occurredAt });
  if (papel === "adiantamento" && !viagem.advancePaidAt) {
    await Trip.updateOne({ _id: viagem._id }, { advancePaidAt: occurredAt });
  }
  await gravarEstado(viagem);
  res.status(201).json(await detailTrip(viagem._id, false));
});

export const scheduleTitle = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  exigirViagemAtiva(viagem);
  const papel = papelInformado(req.body.papel);
  if (papel !== "saldo") {
    throw new ErroHttp(422, "Somente o saldo do motorista passa por programação.");
  }
  const scheduledAt = dataHoraObrigatoria(req.body.scheduledAt, "scheduledAt");
  const titulo = await Title.findOne({ tripId: viagem._id, papel: "saldo" }).lean();
  if (!titulo) {
    throw new ErroHttp(422, "O saldo ainda não foi gerado. Ele sai quando CT-e e foto existem.");
  }
  if (titulo.liqiudateDate) {
    throw new ErroHttp(422, "O saldo já foi baixado.");
  }
  const bloqueio = await bloqueioDoSaldo(viagem, "programar");
  if (bloqueio) throw new ErroHttp(422, bloqueio);

  if (titulo.scheduledAt && titulo.scheduledAt !== scheduledAt) {
    throw new ErroHttp(409, "O saldo já foi programado para outra data");
  }

  const gravado = await Title.updateOne(
    { _id: titulo._id, $or: [{ scheduledAt: { $exists: false } }, { scheduledAt: null }, { scheduledAt: "" }] },
    { scheduledAt },
  );
  const repetido = gravado.modifiedCount === 0;
  if (repetido) {
    const atual = await Title.findById(titulo._id).lean();
    if (atual?.scheduledAt !== scheduledAt) {
      throw new ErroHttp(409, "O saldo já foi programado para outra data");
    }
  }

  res.status(repetido ? 200 : 201).json(await detailTrip(viagem._id, repetido));
});
