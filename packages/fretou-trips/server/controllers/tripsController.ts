import type { Request, Response } from "express";
import mongoose from "mongoose";
import { AcordoFrete } from "../models/AcordosFrete";
import { Cte } from "../models/Ctes";
import { Events } from "../models/Events";
import { Title } from "../models/Titles";
import { Trip } from "../models/Trips";
import { Vouchers } from "../models/Vouchers";
import { AcordoFreteType } from "../types/AcordosFrete";
import { CteType } from "../types/Ctes";
import { EventsType } from "../types/Events";
import { PapelTitulo, TitlesType } from "../types/Titles";
import { DIVIDE_SHIPPING, STATUS_TRIP, StatusTrip, TripDetail, TripListItem, TripsResponse, TripsType } from "../types/Trips";
import { VouchersType } from "../types/Vouchers";
import {
  FatosOperacionais,
  dataHoraObrigatoria,
  hojeISO,
  centavosDeReais,
  margemDoAcordo,
  motivoBloqueioSaldo,
  motivoCancelamento,
  partiesFromShipping,
  podeEditarViagem,
  prazoEmDias,
  resolverEstado,
  titulosDaProva,
} from "../domain/regrasViagem";
import { validateCodeTrip, ensureCodeTripsExist, nextCodeTrip } from "../domain/codeTrip";
import { isDuplicate, ErroHttp } from "../lib/erroHttp";
import { idDaRota, tratar } from "../lib/http";

type Motorista = {
  _id: mongoose.Types.ObjectId;
  name?: string;
  driver?: boolean;
  plateVehicle?: string;
};

export function serializar(trip: TripsType): TripsResponse {
  return {
    _id: trip._id,
    clienteId: trip.clienteId,
    motoristaId: trip.motoristaId,
    origin: trip.origin,
    destination: trip.destination,
    product: trip.product ?? "",
    load: trip.load,
    dateLoad: trip.dateLoad,
    dateDischarge: trip.dateDischarge,
    status: trip.status,
    acordoFreteId: trip.acordoFreteId,
    cteId: trip.cteId,
    shipping: trip.shipping,
    divideShipping: trip.divideShipping,
    codigo: trip.codigo,
    advancePaidAt: trip.advancePaidAt,
  };
}

function corpoInformaCodigo(body: unknown): boolean {
  return Boolean(body && typeof body === "object" && "codigo" in body);
}

function validateTrip(dataTrip: TripsType, res: Response): boolean {
  if (!dataTrip.clienteId || !mongoose.isValidObjectId(dataTrip.clienteId)) {
    res.status(400).json({ erro: "Campo clienteId é obrigatório" });
    return false;
  }
  if (!dataTrip.motoristaId || !mongoose.isValidObjectId(dataTrip.motoristaId)) {
    res.status(400).json({ erro: "Campo motoristaId é obrigatório" });
    return false;
  }
  if (typeof dataTrip.origin !== "string" || !dataTrip.origin.trim()) {
    res.status(400).json({ erro: "Campo origin é obrigatório" });
    return false;
  }
  if (typeof dataTrip.destination !== "string" || !dataTrip.destination.trim()) {
    res.status(400).json({ erro: "Campo destination é obrigatório" });
    return false;
  }
  if (typeof dataTrip.product !== "string" || !dataTrip.product.trim()) {
    res.status(400).json({ erro: "Campo product é obrigatório" });
    return false;
  }
  if (typeof dataTrip.load !== "number" || dataTrip.load <= 0) {
    res.status(400).json({ erro: "Campo load é obrigatório" });
    return false;
  }
  if (typeof dataTrip.dateLoad !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dataTrip.dateLoad)) {
    res.status(400).json({ erro: "Campo dateLoad precisa ser uma data AAAA-MM-DD" });
    return false;
  }
  if (
    dataTrip.dateDischarge !== undefined &&
    (typeof dataTrip.dateDischarge !== "string" || !dataTrip.dateDischarge.trim())
  ) {
    res.status(400).json({ erro: "Campo dateDischarge inválido" });
    return false;
  }
  if (
    dataTrip.status !== undefined &&
    !(STATUS_TRIP as readonly string[]).includes(dataTrip.status)
  ) {
    res.status(400).json({ erro: "Campo status inválido" });
    return false;
  }
  if (dataTrip.cteId !== undefined && !mongoose.isValidObjectId(dataTrip.cteId)) {
    res.status(400).json({ erro: "Campo cteId inválido" });
    return false;
  }
  if (typeof dataTrip.shipping !== "number" || dataTrip.shipping < 0) {
    res.status(400).json({ erro: "Campo shipping é obrigatório" });
    return false;
  }
  if (!(DIVIDE_SHIPPING as readonly string[]).includes(dataTrip.divideShipping)) {
    res.status(400).json({ erro: "Campo divideShipping precisa ser 50% ou 70%" });
    return false;
  }
  return true;
}

function textoQuery(valor: unknown): string | undefined {
  const item = Array.isArray(valor) ? valor[0] : valor;
  return typeof item === "string" && item.trim() ? item.trim() : undefined;
}

function filtroDaListagem(query: Request["query"]): mongoose.FilterQuery<TripsType> {
  const filtro: mongoose.FilterQuery<TripsType> = {};
  const status = textoQuery(query.status);
  if (status && status !== "todas") {
    if (!(STATUS_TRIP as readonly string[]).includes(status)) {
      throw new ErroHttp(400, "Campo status inválido");
    }
    filtro.status = status as StatusTrip;
  }

  const clienteId = textoQuery(query.clienteId);
  if (clienteId) {
    if (!mongoose.isValidObjectId(clienteId)) throw new ErroHttp(400, "Campo clienteId inválido");
    filtro.clienteId = new mongoose.Types.ObjectId(clienteId);
  }

  const motoristaId = textoQuery(query.motoristaId);
  if (motoristaId) {
    if (!mongoose.isValidObjectId(motoristaId)) throw new ErroHttp(400, "Campo motoristaId inválido");
    filtro.motoristaId = new mongoose.Types.ObjectId(motoristaId);
  }

  const dateFrom = textoQuery(query.dateFrom);
  const dateTo = textoQuery(query.dateTo);
  if ((dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) || (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo))) {
    throw new ErroHttp(400, "O período precisa usar datas AAAA-MM-DD");
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new ErroHttp(400, "A data inicial não pode ser posterior à data final");
  }
  if (dateFrom || dateTo) {
    filtro.dateLoad = {
      ...(dateFrom ? { $gte: dateFrom } : {}),
      ...(dateTo ? { $lte: dateTo } : {}),
    };
  }

  return filtro;
}

export const list = tratar(async (req, res) => {
  await ensureCodeTripsExist();
  const codigo = textoQuery(req.query.codigo);
  const filtro = filtroDaListagem(req.query);
  if (codigo) {
    const normalizado = codigo.toUpperCase();
    if (!validateCodeTrip(normalizado)) throw new ErroHttp(400, "Código de viagem inválido");
    const viagem = await findByCodigo(normalizado);
    if (!viagem) {
      res.json([]);
      return;
    }
    filtro._id = viagem._id;
  }
  const itens = (await Trip.find(filtro).sort({ createdAt: -1 }).lean()) as unknown as TripsType[];
  const ids = itens.map((trip) => trip._id);
  const acordoIds = itens.map((trip) => trip.acordoFreteId);
  const [titulos, acordos, eventosDescarga, vouchersOriginais] = await Promise.all([
    Title.find({ tripId: { $in: ids } }).lean(),
    AcordoFrete.find({ _id: { $in: acordoIds } }).lean(),
    Events.find({ tripId: { $in: ids }, type: "descarga" }).select("tripId").lean(),
    Vouchers.find({ tripId: { $in: ids }, type: "ORIGINAIS" }).select("tripId").lean(),
  ]);
  const titulosDoc = titulos as unknown as TitlesType[];
  const acordosDoc = acordos as unknown as AcordoFreteType[];
  const descargas = new Set(eventosDescarga.map((item) => String(item.tripId)));
  const comprovantes = new Set(vouchersOriginais.map((item) => String(item.tripId)));

  const resposta: TripListItem[] = itens.map((trip) => {
    const acordo = acordosDoc.find((item) => String(item._id) === String(trip.acordoFreteId));
    return {
      ...serializar(trip),
      margem: acordo
        ? margemDoAcordo(acordo)
        : { freteCliente: 0, freteMotorista: 0, margemReais: 0, margemPercentual: null, negativa: false },
      titles: titulosDoc
        .filter((item) => String(item.tripId) === String(trip._id))
        .map((item) =>
          serializarTitulo(item, motivoBloqueioSaldo({
            descarga: descargas.has(String(trip._id)),
            comprovantes: comprovantes.has(String(trip._id)),
          }, "programar")),
        ),
    };
  });

  res.json(resposta);
});

function acordoDoCorpo(body: unknown): {
  freteCliente: number;
  freteMotorista: number;
  prazoClienteDias: number;
  prazoMotoristaDias: number;
} | null {
  if (!body || typeof body !== "object" || !("acordoFrete" in body)) return null;
  const acordo = body.acordoFrete;
  if (!acordo || typeof acordo !== "object") return null;

  const freteCliente = Reflect.get(acordo, "freteCliente");
  const freteMotorista = Reflect.get(acordo, "freteMotorista");
  const prazoClienteDias = Reflect.get(acordo, "prazoClienteDias");
  const prazoMotoristaDias = Reflect.get(acordo, "prazoMotoristaDias");

  if (
    typeof freteCliente !== "number" ||
    freteCliente < 0 ||
    typeof freteMotorista !== "number" ||
    freteMotorista < 0 ||
    typeof prazoClienteDias !== "number" ||
    prazoClienteDias < 0 ||
    typeof prazoMotoristaDias !== "number" ||
    prazoMotoristaDias < 0
  ) {
    return null;
  }

  return { freteCliente, freteMotorista, prazoClienteDias, prazoMotoristaDias };
}

export async function findByCodigo(codigo: string): Promise<TripsType | null> {
  const normalizado = codigo.trim().toUpperCase();
  const viagem = await Trip.findOne({ codigo: normalizado }).lean();
  return (viagem as TripsType | null) ?? null;
}

export async function create(req: Request, res: Response): Promise<void> {
  const dataTrip: TripsType = req.body;
  const acordo = acordoDoCorpo(req.body);

  if (corpoInformaCodigo(req.body)) {
    res.status(400).json({ erro: "O código da viagem é gerado automaticamente" });
    return;
  }

  if (!validateTrip(dataTrip, res)) {
    return;
  }

  if (!acordo) {
    res.status(400).json({ erro: "Acordo de frete inválido" });
    return;
  }

  const clienteId = new mongoose.Types.ObjectId(String(dataTrip.clienteId));
  const motoristaId = new mongoose.Types.ObjectId(String(dataTrip.motoristaId));
  const [cliente, motorista] = await Promise.all([
    mongoose.connection.collection("clients").findOne({ _id: clienteId }),
    mongoose.connection.collection("users").findOne({ _id: motoristaId }),
  ]);
  if (!cliente) {
    res.status(422).json({ erro: "Cliente não encontrado" });
    return;
  }
  const prazoCliente = prazoEmDias(cliente.timePeriod);
  if (prazoCliente === null) {
    res.status(422).json({
      erro: "O cliente não tem um prazo em dias cadastrado. Exemplo: 30 dias.",
    });
    return;
  }
  if (!motorista || motorista.driver !== true) {
    res.status(422).json({ erro: "Motorista terceiro não encontrado" });
    return;
  }

  let acordoId: mongoose.Types.ObjectId | undefined;

  try {
    const partes = partiesFromShipping(acordo.freteMotorista, dataTrip.divideShipping);
    const acordoCriado = await AcordoFrete.create({
      ...acordo,
      prazoClienteDias: prazoCliente,
      adiantamento: partes.adiantamento,
      saldo: partes.restante,
    });
    acordoId = acordoCriado._id;
    const codigo = await nextCodeTrip();
    const trip = await Trip.create({
      clienteId,
      motoristaId,
      origin: dataTrip.origin.trim(),
      destination: dataTrip.destination.trim(),
      product: dataTrip.product.trim(),
      load: dataTrip.load,
      dateLoad: dataTrip.dateLoad,
      shipping: dataTrip.shipping,
      divideShipping: dataTrip.divideShipping,
      codigo,
      status: "AGUARDANDO_CTE",
      acordoFreteId: acordoCriado._id,
    });

    res.status(201).json(serializar(trip.toObject() as TripsType));
  } catch (err) {
    if (acordoId) await AcordoFrete.findByIdAndDelete(acordoId);
    if (isDuplicate(err)) {
      res.status(409).json({ erro: "Viagem já cadastrada" });
      return;
    }
    console.error(err);
    res.status(400).json({ erro: "Erro ao criar viagem" });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const dataTrip: TripsType = req.body;

  if (corpoInformaCodigo(req.body)) {
    res.status(400).json({ erro: "O código da viagem não pode ser alterado" });
    return;
  }

  if (!validateTrip(dataTrip, res)) {
    return;
  }

  const atual = await Trip.findById(id).lean();
  if (!atual) {
    res.status(404).json({ erro: "Viagem não encontrada" });
    return;
  }
  const viagemAtual = atual as unknown as TripsType;
  if (!podeEditarViagem(viagemAtual.status)) {
    res.status(422).json({
      erro: viagemAtual.status === "CANCELADA"
        ? "A viagem cancelada não pode ser editada."
        : "A viagem concluída não pode ser editada.",
    });
    return;
  }

  const acordo = acordoDoCorpo(req.body);
  if (!acordo) {
    res.status(400).json({ erro: "Acordo de frete inválido" });
    return;
  }

  const clienteId = new mongoose.Types.ObjectId(String(dataTrip.clienteId));
  const motoristaId = new mongoose.Types.ObjectId(String(dataTrip.motoristaId));
  const [cliente, motorista, cte, foto, titulos] = await Promise.all([
    mongoose.connection.collection("clients").findOne({ _id: clienteId }),
    mongoose.connection.collection("users").findOne({ _id: motoristaId }),
    Cte.findOne({ tripId: viagemAtual._id }).lean(),
    Vouchers.findOne({ tripId: viagemAtual._id, type: "FOTO_CARREGAMENTO" }).lean(),
    Title.find({ tripId: viagemAtual._id }).lean(),
  ]);
  if (!cliente) {
    res.status(422).json({ erro: "Cliente não encontrado" });
    return;
  }
  const prazoCliente = prazoEmDias(cliente.timePeriod);
  if (prazoCliente === null) {
    res.status(422).json({ erro: "O cliente não tem um prazo em dias cadastrado. Exemplo: 30 dias." });
    return;
  }
  if (!motorista || motorista.driver !== true) {
    res.status(422).json({ erro: "Motorista terceiro não encontrado" });
    return;
  }

  const partes = partiesFromShipping(acordo.freteMotorista, dataTrip.divideShipping);
  const previstos = cte && foto?.received
    ? titulosDaProva({
      freteCliente: acordo.freteCliente,
      freteMotorista: acordo.freteMotorista,
      divideShipping: dataTrip.divideShipping,
      prazoClienteDias: prazoCliente,
      prazoMotoristaDias: acordo.prazoMotoristaDias,
      emitted: cte.emitted,
      received: foto.received,
      adiantamento: partes.adiantamento,
      saldo: partes.restante,
    })
    : [];
  const titulosDoc = titulos as unknown as Array<{ _id: mongoose.Types.ObjectId; papel?: string; value: number; liqiudateDate?: string }>;
  for (const titulo of titulosDoc) {
    const previsto = previstos.find((item) => item.papel === titulo.papel);
    if (!previsto || !titulo.liqiudateDate) continue;
    if (centavosDeReais(titulo.value) !== centavosDeReais(previsto.value)) {
      res.status(422).json({ erro: "Não é possível alterar os valores depois que um título já foi baixado." });
      return;
    }
  }

  await Trip.updateOne(
    { _id: viagemAtual._id },
    {
      clienteId,
      motoristaId,
      origin: dataTrip.origin.trim(),
      destination: dataTrip.destination.trim(),
      product: dataTrip.product.trim(),
      load: dataTrip.load,
      dateLoad: dataTrip.dateLoad,
      shipping: acordo.freteCliente,
      divideShipping: dataTrip.divideShipping,
    },
  );
  await AcordoFrete.updateOne(
    { _id: viagemAtual.acordoFreteId },
    {
      freteCliente: acordo.freteCliente,
      freteMotorista: acordo.freteMotorista,
      prazoClienteDias: prazoCliente,
      prazoMotoristaDias: acordo.prazoMotoristaDias,
      adiantamento: partes.adiantamento,
      saldo: partes.restante,
    },
  );
  for (const titulo of titulosDoc) {
    if (titulo.liqiudateDate) continue;
    const previsto = previstos.find((item) => item.papel === titulo.papel);
    if (!previsto) continue;
    await Title.updateOne(
      { _id: titulo._id },
      { value: previsto.value, expirationDate: previsto.expirationDate },
    );
  }

  const atualizada = await Trip.findById(viagemAtual._id).lean();
  if (!atualizada) {
    res.status(404).json({ erro: "Viagem não encontrada" });
    return;
  }
  await gravarEstado(atualizada as unknown as TripsType);
  res.json(await detailTrip(viagemAtual._id));
}

export async function requireTrip(id: string): Promise<TripsType> {
  if (!mongoose.isValidObjectId(id)) throw new ErroHttp(400, "ID inválido");
  const viagem = await Trip.findById(id).lean();
  if (!viagem) throw new ErroHttp(404, "Viagem não encontrada");
  return viagem as unknown as TripsType;
}

function papelDoTitulo(item: Pick<TitlesType, "nature" | "papel">): PapelTitulo | undefined {
  if (item.papel) return item.papel;
  if (item.nature === "receber") return "cliente";
  return undefined;
}

export function serializarTitulo(item: TitlesType, bloqueioSaldo: string | null) {
  const papel = papelDoTitulo(item);
  return {
    id: String(item._id),
    nature: item.nature,
    papel,
    value: item.value,
    expirationDate: item.expirationDate,
    liqiudateDate: item.liqiudateDate,
    scheduledAt: item.scheduledAt,
    ...(papel === "saldo" && !item.liqiudateDate && bloqueioSaldo ? { bloqueio: bloqueioSaldo } : {}),
  };
}

let indiceTitulosPronto = false;

async function garantirIndiceTitulos(): Promise<void> {
  if (indiceTitulosPronto) return;
  try {
    const indexes = await Title.collection.indexes();
    if (indexes.some((item) => item.name === "tripId_1_nature_1")) {
      await Title.collection.dropIndex("tripId_1_nature_1");
    }
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "";
    if (!/ns does not exist|NamespaceNotFound/i.test(mensagem)) throw err;
  }
  await Title.syncIndexes();
  indiceTitulosPronto = true;
}

async function factsTrip(viagem: TripsType): Promise<FatosOperacionais> {
  const [cte, comprovantes, eventos, titulos] = await Promise.all([
    Cte.findOne({ tripId: viagem._id }).lean(),
    Vouchers.find({ tripId: viagem._id }).lean(),
    Events.find({ tripId: viagem._id }).lean(),
    Title.find({ tripId: viagem._id }).lean(),
  ]);
  const titulosDoc = titulos as unknown as TitlesType[];

  return {
    cte: Boolean(cte),
    foto: comprovantes.some((item) => item.type === "FOTO_CARREGAMENTO"),
    descarga: eventos.some((item) => item.type === "descarga"),
    comprovantes: comprovantes.some((item) => item.type === "ORIGINAIS"),
    carregamentoNoFuturo: viagem.dateLoad > hojeISO(),
    adiantamentoQuitado: titulosDoc.some((item) => item.papel === "adiantamento" && Boolean(item.liqiudateDate)),
    saldoQuitado: titulosDoc.some((item) => item.papel === "saldo" && Boolean(item.liqiudateDate)),
  };
}

async function criarTitulosDaProva(viagem: TripsType, emitted: string, received: string): Promise<void> {
  const [acordo, cliente] = await Promise.all([
    AcordoFrete.findById(viagem.acordoFreteId).lean(),
    mongoose.connection.collection("clients").findOne({ _id: viagem.clienteId }),
  ]);
  if (!acordo || !cliente) return;

  const prazoCliente = prazoEmDias(cliente.timePeriod) ?? acordo.prazoClienteDias;
  const previstos = titulosDaProva({
    freteCliente: acordo.freteCliente,
    freteMotorista: acordo.freteMotorista,
    divideShipping: viagem.divideShipping,
    prazoClienteDias: prazoCliente,
    prazoMotoristaDias: acordo.prazoMotoristaDias,
    emitted,
    received,
    adiantamento: acordo.adiantamento,
    saldo: acordo.saldo,
  });

  await Title.deleteMany({
    tripId: viagem._id,
    nature: "pagar",
    papel: { $exists: false },
    $or: [{ liqiudateDate: { $exists: false } }, { liqiudateDate: null }, { liqiudateDate: "" }],
  });

  for (const titulo of previstos) {
    try {
      await Title.updateOne(
        { tripId: viagem._id, papel: titulo.papel },
        { $setOnInsert: { tripId: viagem._id, ...titulo } },
        { upsert: true },
      );
    } catch (err) {
      if (!isDuplicate(err)) throw err;
    }
  }
}

export function exigirViagemAtiva(viagem: TripsType): void {
  if (viagem.status === "CANCELADA") {
    throw new ErroHttp(422, "A viagem está cancelada.");
  }
}

export async function gravarEstado(viagem: TripsType): Promise<void> {
  const atual = await Trip.findById(viagem._id).select("status").lean();
  if (atual?.status === "CANCELADA") return;

  await garantirIndiceTitulos();

  const [cte, eventos, comprovantes] = await Promise.all([
    Cte.findOne({ tripId: viagem._id }).lean(),
    Events.find({ tripId: viagem._id }).lean(),
    Vouchers.find({ tripId: viagem._id }).lean(),
  ]);
  const foto = comprovantes.find((item) => item.type === "FOTO_CARREGAMENTO");
  const descarga = eventos.find((item) => item.type === "descarga");

  if (cte && foto?.received) {
    await criarTitulosDaProva(viagem, cte.emitted, foto.received);
  }

  const fatos = await factsTrip(viagem);
  await Trip.updateOne(
    { _id: viagem._id },
    {
      status: resolverEstado(fatos),
      ...(cte ? { cteId: cte._id } : {}),
      ...(descarga ? { dateDischarge: String(descarga.occurredAt).slice(0, 10) } : {}),
    },
  );
}

export async function detailTrip(id: mongoose.Types.ObjectId, idempotente = false): Promise<TripDetail> {
  const viagem = await Trip.findById(id).lean();
  if (!viagem) throw new ErroHttp(404, "Viagem não encontrada");
  const trip = viagem as unknown as TripsType;

  const [motorista, acordo, cte, comprovantes, eventos, titulos, clienteDoc] = await Promise.all([
    mongoose.connection.collection("users").findOne({ _id: trip.motoristaId }),
    AcordoFrete.findById(trip.acordoFreteId).lean(),
    Cte.findOne({ tripId: trip._id }).lean(),
    Vouchers.find({ tripId: trip._id }).sort({ createdAt: 1 }).lean(),
    Events.find({ tripId: trip._id }).sort({ createdAt: 1 }).lean(),
    Title.find({ tripId: trip._id }).sort({ nature: 1 }).lean(),
    mongoose.connection.collection("clients").findOne({ _id: trip.clienteId }),
  ]);

  if (!acordo || !clienteDoc) throw new ErroHttp(422, "A viagem está sem cliente ou acordo de frete");

  const acordoFrete = acordo as unknown as AcordoFreteType;
  const cteDoc = cte as unknown as CteType | null;
  const titulosDoc = titulos as unknown as TitlesType[];
  const comprovantesDoc = comprovantes as unknown as VouchersType[];
  const eventosDoc = eventos as unknown as EventsType[];

  return {
    id: String(trip._id),
    clienteId: String(trip.clienteId),
    clienteNome: String(clienteDoc.corporateName ?? clienteDoc.nome ?? ""),
    motoristaId: String(trip.motoristaId),
    motoristaNome: (motorista as Motorista | null)?.name ?? "",
    motoristaPlaca: (motorista as Motorista | null)?.plateVehicle || undefined,
    origin: trip.origin,
    destination: trip.destination,
    product: trip.product ?? "",
    load: trip.load,
    dateLoad: trip.dateLoad,
    dateDischarge: trip.dateDischarge,
    status: trip.status,
    acordoFreteId: String(trip.acordoFreteId),
    cteId: trip.cteId ? String(trip.cteId) : undefined,
    shipping: trip.shipping,
    divideShipping: trip.divideShipping,
    codigo: trip.codigo,
    advancePaidAt: trip.advancePaidAt,
    margem: margemDoAcordo(acordoFrete),
    titles: titulosDoc.map((item) =>
      serializarTitulo(
        item,
        motivoBloqueioSaldo(
          {
            descarga: eventosDoc.some((evento) => evento.type === "descarga"),
            comprovantes: comprovantesDoc.some((comprovante) => comprovante.type === "ORIGINAIS"),
          },
          "programar",
        ),
      ),
    ),
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    acordoFrete: {
      id: String(acordoFrete._id),
      freteCliente: acordoFrete.freteCliente,
      freteMotorista: acordoFrete.freteMotorista,
      prazoClienteDias: acordoFrete.prazoClienteDias,
      prazoMotoristaDias: acordoFrete.prazoMotoristaDias,
    },
    ...(cteDoc
      ? { cte: { id: String(cteDoc._id), number: cteDoc.number, emitted: cteDoc.emitted } }
      : {}),
    vouchers: comprovantesDoc.map((item) => ({
      id: String(item._id),
      type: item.type,
      name: item.name,
      content: item.content,
      received: item.received,
    })),
    events: eventosDoc.map((item) => ({
      id: String(item._id),
      type: item.type,
      occurredAt: item.occurredAt,
      details: item.details,
      createdAt: item.createdAt.toISOString(),
    })),
    ...(idempotente ? { idempotente: true } : {}),
  };
}

export const cancelTrip = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  if (viagem.status === "CANCELADA") {
    res.json(await detailTrip(viagem._id, true));
    return;
  }

  const [cte, foto, titulos] = await Promise.all([
    Cte.exists({ tripId: viagem._id }),
    Vouchers.exists({ tripId: viagem._id, type: "FOTO_CARREGAMENTO" }),
    Title.exists({ tripId: viagem._id }),
  ]);
  const motivo = motivoCancelamento({
    cte: Boolean(cte),
    foto: Boolean(foto),
    titulos: Boolean(titulos),
  });
  if (motivo) throw new ErroHttp(422, motivo);

  const atualizado = await Trip.updateOne(
    { _id: viagem._id, status: "AGUARDANDO_CTE" },
    { status: "CANCELADA" },
  );
  if (atualizado.modifiedCount === 0) {
    const deNovo = await Trip.findById(viagem._id).select("status").lean();
    if (deNovo?.status === "CANCELADA") {
      res.json(await detailTrip(viagem._id, true));
      return;
    }
    throw new ErroHttp(422, "A viagem já começou e não pode ser cancelada.");
  }

  res.json(await detailTrip(viagem._id));
});

export const registerAdvance = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  exigirViagemAtiva(viagem);
  const occurredAt = dataHoraObrigatoria(req.body.occurredAt, "occurredAt");
  const titulo = await Title.findOne({ tripId: viagem._id, papel: "adiantamento" }).lean();
  if (!titulo) {
    throw new ErroHttp(422, "O adiantamento ainda não foi gerado. Ele sai quando CT-e e foto existem.");
  }

  const repetido = Boolean(titulo.liqiudateDate);
  if (!repetido) {
    await Title.updateOne({ _id: titulo._id }, { liqiudateDate: occurredAt });
  }
  if (!viagem.advancePaidAt) {
    await Trip.updateOne({ _id: viagem._id }, { advancePaidAt: titulo.liqiudateDate ?? occurredAt });
  }
  await gravarEstado(viagem);
  res.status(repetido ? 200 : 201).json(await detailTrip(viagem._id, repetido));
});

export const getById = tratar(async (req, res) => {
  const viagem = await requireTrip(idDaRota(req.params.id));
  res.json(await detailTrip(viagem._id));
});