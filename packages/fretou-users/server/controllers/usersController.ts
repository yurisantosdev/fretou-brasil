import type { Request, Response } from "express";
import mongoose from "mongoose";
import { hashPassword } from "@fretou/components/password";
import { isVehicleType } from "@fretou/vehicles";
import { Vehicle } from "@fretou/vehicles/server/models/Vehicles";
import { UserVehicle, UsersResponse, UsersType } from "../types/Users";
import { User } from "../models/Users";

type VeiculoEntrada = {
  _id?: mongoose.Types.ObjectId;
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
};

function placaDuplicada(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  );
}

function normalizarVeiculos(
  thirdParty: boolean,
  value: unknown
): VeiculoEntrada[] | { erro: string } {
  if (!thirdParty) return [];
  if (!Array.isArray(value) || value.length === 0) {
    return { erro: "Informe pelo menos um veículo." };
  }

  const placas = new Set<string>();
  const vehicles: VeiculoEntrada[] = [];
  const anoMaximo = new Date().getFullYear() + 1;

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return { erro: "Veículo inválido." };
    }

    const dados = item as Record<string, unknown>;
    const plate = typeof dados.plate === "string" ? dados.plate.trim().toUpperCase() : "";
    const model = typeof dados.model === "string" ? dados.model : "";
    const year = typeof dados.year === "number" ? dados.year : Number(dados.year);
    const totalLoad =
      typeof dados.totalLoad === "number" ? dados.totalLoad : Number(dados.totalLoad);
    const active = dados.active !== false;

    if (!plate) return { erro: "Informe a placa do veículo." };
    if (!isVehicleType(model)) return { erro: "Selecione o tipo do veículo." };
    if (!Number.isInteger(year) || year < 1970 || year > anoMaximo) {
      return { erro: `Informe um ano entre 1970 e ${anoMaximo}.` };
    }
    if (!Number.isFinite(totalLoad) || totalLoad <= 0) {
      return { erro: "Informe a carga total em kg." };
    }
    if (placas.has(plate)) return { erro: "Esta placa já está na lista." };
    placas.add(plate);

    vehicles.push({
      ...(typeof dados._id === "string" && mongoose.isValidObjectId(dados._id)
        ? { _id: new mongoose.Types.ObjectId(dados._id) }
        : {}),
      plate,
      model,
      year,
      totalLoad,
      active,
    });
  }

  return vehicles;
}

function paraResposta(vehicle: {
  _id: mongoose.Types.ObjectId;
  plate: string;
  model: string;
  year: number;
  totalLoad: number;
  active: boolean;
}): UserVehicle {
  return {
    _id: vehicle._id,
    plate: vehicle.plate,
    model: vehicle.model,
    year: vehicle.year,
    totalLoad: vehicle.totalLoad,
    active: vehicle.active,
  };
}

async function placaEmOutroDono(
  driverId: mongoose.Types.ObjectId | null,
  plates: string[]
): Promise<boolean> {
  if (plates.length === 0) return false;
  const filtro = driverId
    ? { plate: { $in: plates }, $nor: [{ driver: driverId, thirdParty: true }] }
    : { plate: { $in: plates } };
  const conflito = await Vehicle.findOne(filtro).lean();
  return conflito !== null;
}

async function gravarVeiculos(
  driverId: mongoose.Types.ObjectId,
  thirdParty: boolean,
  vehicles: VeiculoEntrada[]
): Promise<UserVehicle[] | { erro: string }> {
  if (!thirdParty) {
    await Vehicle.deleteMany({ driver: driverId, thirdParty: true });
    return [];
  }

  const salvos: UserVehicle[] = [];
  const ids: mongoose.Types.ObjectId[] = [];

  for (const item of vehicles) {
    const dados = {
      plate: item.plate,
      model: item.model,
      year: item.year,
      totalLoad: item.totalLoad,
      active: item.active,
      thirdParty: true,
      driver: driverId,
    };

    const porId = item._id
      ? await Vehicle.findOne({ _id: item._id, driver: driverId, thirdParty: true })
      : null;
    const existente =
      porId ?? (await Vehicle.findOne({ plate: item.plate, driver: driverId, thirdParty: true }));

    try {
      const doc = existente
        ? await Vehicle.findByIdAndUpdate(existente._id, dados, { new: true, runValidators: true })
        : await Vehicle.create(dados);
      if (!doc) return { erro: "Não foi possível salvar o veículo." };
      ids.push(doc._id);
      salvos.push(paraResposta(doc));
    } catch (err) {
      if (placaDuplicada(err)) return { erro: "Placa já cadastrada" };
      throw err;
    }
  }

  await Vehicle.deleteMany({
    driver: driverId,
    thirdParty: true,
    ...(ids.length > 0 ? { _id: { $nin: ids } } : {}),
  });

  return salvos;
}

async function veiculosDosMotoristas(ids: mongoose.Types.ObjectId[]) {
  const itens = await Vehicle.find({ thirdParty: true, driver: { $in: ids } }).lean();
  const mapa = new Map<string, UserVehicle[]>();
  for (const item of itens) {
    if (!item.driver) continue;
    const chave = String(item.driver);
    const lista = mapa.get(chave) ?? [];
    lista.push(paraResposta(item as unknown as UserVehicle));
    mapa.set(chave, lista);
  }
  return mapa;
}

export function serializar(user: UsersType, vehicles: UserVehicle[] = []): UsersResponse {
  return {
    _id: user._id,
    name: user.name,
    password: user.password,
    cpf: user.cpf,
    driver: user.driver,
    keyPix: user.keyPix,
    active: user.active,
    thirdParty: user.thirdParty,
    vehicles,
  };
}

export async function list(_req: Request, res: Response): Promise<void> {
  const itens = await User.find().sort({ createdAt: -1 }).lean();
  const usuarios = itens as unknown as UsersType[];
  const mapa = await veiculosDosMotoristas(usuarios.map((user) => user._id));
  res.json(usuarios.map((user) => serializar(user, mapa.get(String(user._id)) ?? [])));
}

export async function create(req: Request, res: Response): Promise<void> {
  const dataUser = req.body;

  if (typeof dataUser.name !== "string" || !dataUser.name.trim()) {
    res.status(400).json({ erro: "Campo name é obrigatório" });
    return;
  }
  if (typeof dataUser.password !== "string" || dataUser.password.length === 0) {
    res.status(400).json({ erro: "Campo password é obrigatório" });
    return;
  }

  const thirdParty = dataUser.driver === true && dataUser.thirdParty === true;
  const vehicles = normalizarVeiculos(thirdParty, dataUser.vehicles);
  if ("erro" in vehicles) {
    res.status(400).json({ erro: vehicles.erro });
    return;
  }

  if (await placaEmOutroDono(null, vehicles.map((vehicle) => vehicle.plate))) {
    res.status(409).json({ erro: "Placa já cadastrada" });
    return;
  }

  const { vehicles: _veiculos, ...resto } = dataUser;
  const user = await User.create({
    ...resto,
    driver: dataUser.driver === true,
    thirdParty,
    password: await hashPassword(dataUser.password),
  });

  if (!user) {
    res.status(400).json({ erro: "Erro ao criar usuário" });
    return;
  }

  const salvos = await gravarVeiculos(user._id, thirdParty, vehicles);
  if ("erro" in salvos) {
    res.status(409).json({ erro: salvos.erro });
    return;
  }

  res.status(201).json(serializar(user as UsersType, salvos));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id || Array.isArray(id) || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const dataUser = req.body;
  const { password, vehicles: _veiculos, ...resto } = dataUser;

  if (typeof resto.name !== "string" || !resto.name.trim()) {
    res.status(400).json({ erro: "Campo name é obrigatório" });
    return;
  }

  const thirdParty = resto.driver === true && resto.thirdParty === true;
  const vehicles = normalizarVeiculos(thirdParty, dataUser.vehicles);
  if ("erro" in vehicles) {
    res.status(400).json({ erro: vehicles.erro });
    return;
  }

  const driverId = new mongoose.Types.ObjectId(id);
  if (await placaEmOutroDono(driverId, vehicles.map((vehicle) => vehicle.plate))) {
    res.status(409).json({ erro: "Placa já cadastrada" });
    return;
  }

  const updateUser = {
    ...resto,
    driver: resto.driver === true,
    thirdParty,
    ...(typeof password === "string" && password.length > 0
      ? { password: await hashPassword(password) }
      : {}),
  };

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateUser, $unset: { vehicles: "" } },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ erro: "Usuário não encontrado" });
      return;
    }

    const salvos = await gravarVeiculos(user._id, thirdParty, vehicles);
    if ("erro" in salvos) {
      res.status(409).json({ erro: salvos.erro });
      return;
    }

    res.json(serializar(user as UsersType, salvos));
  } catch (err) {
    if (placaDuplicada(err)) {
      res.status(409).json({ erro: "CPF já cadastrado" });
      return;
    }
    throw err;
  }
}
