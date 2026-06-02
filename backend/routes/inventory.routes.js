import express from "express";
import { getInventorySummary } from "../controllers/inventory.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("ADMIN", "STORE_KEEPER"));

router.get("/summary", getInventorySummary);

export default router;
