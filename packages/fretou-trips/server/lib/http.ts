import type { NextFunction, Request, Response } from "express";
import { isDuplicate, ErroHttp } from "./erroHttp";

export function idDaRota(valor: string | string[] | undefined): string {
  const id = Array.isArray(valor) ? valor[0] : valor;
  return id ?? "";
}

export function tratar(acao: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    acao(req, res).catch((err: unknown) => {
      if (err instanceof ErroHttp) {
        res.status(err.status).json({ erro: err.message });
        return;
      }
      if (isDuplicate(err)) {
        res.status(409).json({ erro: "Este lançamento já existe para a viagem" });
        return;
      }
      next(err);
    });
  };
}
