import { Router } from "express";
import { usersRoutes } from "./routes/usersRoutes";

export const usersRouter = Router();

usersRouter.use("/", usersRoutes);
