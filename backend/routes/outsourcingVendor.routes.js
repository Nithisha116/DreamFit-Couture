import express from "express";
import {
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../controllers/outsourcingVendor.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route("/")
  .get(getAllVendors)
  .post(createVendor); // Add admin middleware if only admin can create

router
  .route("/:id")
  .put(updateVendor)
  .delete(deleteVendor);

export default router;
