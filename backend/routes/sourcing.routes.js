import express from "express";
import {
  createSourcingRecord,
  deleteSourcingRecord,
  getSourcingRecords,
  updateSourcingRecord,
} from "../controllers/sourcing.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("ADMIN", "STORE_KEEPER"));

router.route("/").get(getSourcingRecords).post(createSourcingRecord);
router.route("/:id").put(updateSourcingRecord).delete(deleteSourcingRecord);

export default router;
