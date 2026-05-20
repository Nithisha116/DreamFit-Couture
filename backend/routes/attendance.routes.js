import express from "express";
import {
  getAllAttendance,
  getAttendanceStats,
  getAttendanceEmployees,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all attendance routes
router.use(protect);

router.route("/stats").get(getAttendanceStats);
router.route("/employees").get(getAttendanceEmployees);

router
  .route("/")
  .get(getAllAttendance)
  .post(createAttendance);

router
  .route("/:id")
  .put(updateAttendance)
  .delete(deleteAttendance);

export default router;
