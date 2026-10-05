import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/", authController.login);
router.get("/me", requireAuth, authController.me);

export default router;
