import { Router } from "express";
import { vehiclesRoutes } from "./routes/vehiclesRoutes";

export const vehiclesRouter = Router();

vehiclesRouter.use("/", vehiclesRoutes);
