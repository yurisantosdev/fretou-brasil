import { Router } from "express";
import * as controller from "../controllers/vehiclesController";

export const vehiclesRoutes = Router();

vehiclesRoutes.get("/", controller.list);
vehiclesRoutes.post("/", controller.create);
vehiclesRoutes.put("/:id", controller.update);