import express from "express";
import {
  getAllOutsourcing,
  createOutsourcing,
  updateOutsourcing,
  deleteOutsourcing,
} from "../controllers/outsourcing.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route("/")
  .get(getAllOutsourcing)
  .post(createOutsourcing);

router.route("/:id")
  .put(updateOutsourcing)
  .delete(deleteOutsourcing);

export default router;
