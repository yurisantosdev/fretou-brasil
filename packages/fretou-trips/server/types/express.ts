import type { Request } from "express";

export type AuthenticatedRequest = Request & {
  user?: {
    sub: string;
    email: string;
    photo?: string;
    position?: string;
    status?: string;
    birthDate?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};
