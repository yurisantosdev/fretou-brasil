import { Router } from "express";
import * as cte from "../controllers/cteController";
import * as events from "../controllers/eventsController";
import * as titles from "../controllers/titlesController";
import * as trips from "../controllers/tripsController";
import * as vouchers from "../controllers/vouchersController";

export const tripsRoutes = Router();

tripsRoutes.get("/", trips.list);
tripsRoutes.post("/", trips.create);
tripsRoutes.get("/:id", trips.getById);
tripsRoutes.put("/:id", trips.update);
tripsRoutes.post("/:id/cte", cte.issueCte);
tripsRoutes.post("/:id/foto", vouchers.attachPhoto);
tripsRoutes.post("/:id/descarga", events.registerUnload);
tripsRoutes.post("/:id/comprovantes", vouchers.registerDocuments);
tripsRoutes.post("/:id/liquidacao", titles.settleTitle);
tripsRoutes.post("/:id/adiantamento", trips.registerAdvance);
