import { Router } from "express";
import { clientsRoutes } from "./routes/clientsRoutes";

export const clientsRouter = Router();

clientsRouter.use("/", clientsRoutes);
