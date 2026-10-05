import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";

function tokenDoCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("access_token="));
  if (!match) return undefined;
  const value = match.slice("access_token=".length);
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function tokenDaRequisicao(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) return token;
  }
  return tokenDoCookie(req.headers.cookie);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = tokenDaRequisicao(req);
  if (!token) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}
