import { Router } from "express";
import * as controller from "../controllers/usersController";

export const usersRoutes = Router();

usersRoutes.get("/", controller.list);
usersRoutes.post("/", controller.create);
usersRoutes.put("/:id", controller.update);