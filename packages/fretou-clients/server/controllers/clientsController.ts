import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ClientsResponse, ClientsType } from "../types/Clients";
import { Client } from "../models/Clients";

export function serializar(client: ClientsType): ClientsResponse {
  return {
    _id: client._id,
    corporateName: client.corporateName,
    cnpj: client.cnpj,
    timePeriod: client.timePeriod,
    active: client.active,
  };
}

export async function list(req: Request, res: Response): Promise<void> {
  const itens = await Client.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((c) => serializar(c as unknown as ClientsType)));
}

export async function create(req: Request, res: Response): Promise<void> {
  const dataClient: ClientsType = req.body;

  if (typeof dataClient.corporateName !== "string" || !dataClient.corporateName.trim()) {
    res.status(400).json({ erro: "Campo razão social é obrigatório" });
    return;
  }
  if (typeof dataClient.cnpj !== "string" || dataClient.cnpj.length === 0) {
    res.status(400).json({ erro: "Campo CNPJ é obrigatório" });
    return;
  }

  if (typeof dataClient.timePeriod !== "string" || !dataClient.timePeriod.trim()) {
    res.status(400).json({ erro: "Campo período é obrigatório" });
    return;
  }

  const client = await Client.create({
    ...dataClient,
  });

  if (
    !client) {
    res.status(400).json({ erro: "Erro ao criar cliente" });
    return;
  }

  res.status(201).json(serializar(client as ClientsType));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const dataClient: ClientsType = req.body;

  const updateClient = {
    ...dataClient,
  };

  try {
    const client = await Client.findByIdAndUpdate(id, updateClient, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      res.status(404).json({ erro: "Client não encontrado" });
      return;
    }

    res.json(serializar(client as ClientsType));
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      res.status(409).json({ erro: "CNPJ já cadastrado" });
      return;
    }
    throw err;
  }
}