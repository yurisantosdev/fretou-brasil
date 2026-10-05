import { Router } from "express";
import { tripsRoutes } from "./routes/tripsRoutes";

export const tripsRouter = Router();

tripsRouter.use("/", tripsRoutes);
