import express from "express";
import { 
  createLeaveRequest, 
  getAllLeaves, 
  updateLeaveStatus 
} from "../controllers/leave.controller.js";
import { protect, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createLeaveRequest)
  .get(protect, getAllLeaves);

router.route("/:id/status")
  .patch(protect, isAdmin, updateLeaveStatus);

export default router;
