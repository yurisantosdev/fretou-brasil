import type { Request, Response } from "express";
import { User } from "@fretou/users/server/models/Users";
import { comparePassword } from "@fretou/components/password";
import { signAccessToken } from "../lib/jwt";

export async function login(req: Request, res: Response): Promise<void> {
  const { cpf, password } = req.body as {
    cpf: string;
    password: string;
  };

  if (typeof cpf !== "string" || !cpf.trim()) {
    res.status(400).json({ erro: "Campo CPF é obrigatório!" });
    return;
  }

  if (typeof password !== "string" || password.length === 0) {
    res.status(400).json({ erro: "Campo password é obrigatório e deve ser uma string" });
    return;
  }

  const user = await User.findOne({
    cpf,
  }).select("+password");

  if (!user) {
    res.status(401).json({ erro: "Credenciais inválidas" });
    return;
  }

  const hash = user.password;
  if (!hash) {
    res.status(500).json({ erro: "Dados de autenticação inconsistentes" });
    return;
  }

  const senhaOk = await comparePassword(password, hash);
  if (!senhaOk) {
    res.status(401).json({ erro: "Credenciais inválidas" });
    return;
  }

  if (user.active === false) {
    res.status(403).json({ erro: "Usuário desativado" });
    return;
  }

  const token = signAccessToken({
    sub: user._id.toString(),
    name: user.name,
    cpf: user.cpf,
    driver: user.driver,
    plateVehicle: user.plateVehicle,
    keyPix: user.keyPix,
  });

  res.json({
    token,
    tipo: "Bearer",
    expiraEm: "1d",
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const user = await User.findById(req.user.sub);
  if (!user || user.active === false) {
    res.status(401).json({ erro: "Sessão inválida" });
    return;
  }

  res.json({
    id: user._id.toString(),
    name: user.name,
    cpf: user.cpf,
    driver: user.driver,
    thirdParty: user.thirdParty === true,
    plateVehicle: user.plateVehicle,
    keyPix: user.keyPix,
    active: user.active !== false,
  });
}
