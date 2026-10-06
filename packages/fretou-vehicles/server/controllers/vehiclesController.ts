import type { Request, Response } from "express";
import mongoose from "mongoose";
import { VehiclesResponse, VehiclesType } from "../types/Vehicles";
import { Vehicle } from "../models/Vehicles";

const VEHICLE_TYPES = [
  "Van",
  "VUC",
  "Utilitário",
  "Toco",
  "Truck",
  "Bitruck",
  "Carreta",
  "Cavalo mecânico",
  "Ônibus",
] as const;

function placaNormalizada(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const plate = value.trim().toUpperCase();
  return plate || null;
}

function tipoValido(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return (VEHICLE_TYPES as readonly string[]).includes(value) ? value : null;
}

function anoValido(value: unknown): number | null {
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year)) return null;
  const maximo = new Date().getFullYear() + 1;
  if (year < 1970 || year > maximo) return null;
  return year;
}

function cargaValida(value: unknown): number | null {
  const totalLoad = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(totalLoad) || totalLoad <= 0) return null;
  return totalLoad;
}

function ativoValido(value: unknown, padrao: boolean): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === undefined) return padrao;
  return null;
}

function placaDuplicada(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  );
}

export function serializar(vehicle: VehiclesType): VehiclesResponse {
  return {
    _id: vehicle._id,
    plate: vehicle.plate,
    model: vehicle.model,
    year: vehicle.year,
    totalLoad: vehicle.totalLoad,
    thirdParty: vehicle.thirdParty,
    driver: vehicle.driver,
    active: vehicle.active,
  };
}

function dadosVeiculo(body: VehiclesType, ativoPadrao: boolean) {
  const plate = placaNormalizada(body.plate);
  const model = tipoValido(body.model);
  const year = anoValido(body.year);
  const totalLoad = cargaValida(body.totalLoad);
  const active = ativoValido(body.active, ativoPadrao);

  if (!plate) return { erro: "Campo placa é obrigatório" } as const;
  if (!model) return { erro: "Campo tipo é obrigatório" } as const;
  if (year === null) return { erro: "Campo ano é obrigatório" } as const;
  if (totalLoad === null) return { erro: "Campo carga total é obrigatório" } as const;
  if (active === null) return { erro: "Campo status é obrigatório" } as const;

  return { plate, model, year, totalLoad, active } as const;
}

export async function list(req: Request, res: Response): Promise<void> {
  const driver = typeof req.query.driver === "string" ? req.query.driver : "";
  const filtro =
    driver && mongoose.isValidObjectId(driver) ? { driver, thirdParty: true } : {};
  const itens = await Vehicle.find(filtro).sort({ createdAt: -1 }).lean();
  res.json(itens.map((c) => serializar(c as unknown as VehiclesType)));
}

export async function create(req: Request, res: Response): Promise<void> {
  const dados = dadosVeiculo(req.body as VehiclesType, true);
  if ("erro" in dados) {
    res.status(400).json({ erro: dados.erro });
    return;
  }

  const existente = await Vehicle.findOne({ plate: dados.plate }).lean();
  if (existente) {
    res.status(409).json({ erro: "Placa já cadastrada" });
    return;
  }

  try {
    const vehicle = await Vehicle.create({ ...dados, thirdParty: false });
    res.status(201).json(serializar(vehicle as VehiclesType));
  } catch (err) {
    if (placaDuplicada(err)) {
      res.status(409).json({ erro: "Placa já cadastrada" });
      return;
    }
    throw err;
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id || Array.isArray(id) || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const dados = dadosVeiculo(req.body as VehiclesType, true);
  if ("erro" in dados) {
    res.status(400).json({ erro: dados.erro });
    return;
  }

  const existente = await Vehicle.findOne({ plate: dados.plate, _id: { $ne: id } }).lean();
  if (existente) {
    res.status(409).json({ erro: "Placa já cadastrada" });
    return;
  }

  try {
    const vehicle = await Vehicle.findByIdAndUpdate(id, dados, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      res.status(404).json({ erro: "Veículo não encontrado" });
      return;
    }

    res.json(serializar(vehicle as VehiclesType));
  } catch (err) {
    if (placaDuplicada(err)) {
      res.status(409).json({ erro: "Placa já cadastrada" });
      return;
    }
    throw err;
  }
}
