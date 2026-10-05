import { Router } from "express";
import * as controller from "../controllers/clientsController";

export const clientsRoutes = Router();

clientsRoutes.get("/", controller.list);
clientsRoutes.post("/", controller.create);
clientsRoutes.put("/:id", controller.update);