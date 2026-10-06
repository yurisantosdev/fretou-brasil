import type { Request, Response } from "express";
import mongoose from "mongoose";
import { hashPassword } from "@fretou/components/password";
import { UsersResponse, UsersType } from "../types/Users";
import { User } from "../models/Users";

export function serializar(user: UsersType): UsersResponse {
  return {
    _id: user._id,
    name: user.name,
    cpf: user.cpf,
    driver: user.driver,
    plateVehicle: user.plateVehicle,
    keyPix: user.keyPix,
    active: user.active,
  };
}

export async function list(req: Request, res: Response): Promise<void> {
  const itens = await User.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((c) => serializar(c as unknown as UsersType)));
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

  const user = await User.create({
    ...dataUser,
    password: await hashPassword(dataUser.password),
  });

  if (
    !user) {
    res.status(400).json({ erro: "Erro ao criar usuário" });
    return;
  }

  res.status(201).json(serializar(user as UsersType));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const dataUser = req.body;
  const { password, ...resto } = dataUser;

  if (typeof resto.name !== "string" || !resto.name.trim()) {
    res.status(400).json({ erro: "Campo name é obrigatório" });
    return;
  }

  const updateUser = {
    ...resto,
    ...(typeof password === "string" && password.length > 0
      ? { password: await hashPassword(password) }
      : {}),
  };

  try {
    const user = await User.findByIdAndUpdate(id, updateUser, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).json({ erro: "Usuário não encontrado" });
      return;
    }

    res.json(serializar(user as UsersType));
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      res.status(409).json({ erro: "CPF já cadastrado" });
      return;
    }
    throw err;
  }
}