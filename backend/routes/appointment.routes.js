import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments
} from "../controllers/appointment.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route("/")
  .post(createAppointment)
  .get(getAppointments);

router.get("/dashboard/upcoming", getUpcomingAppointments);

router.route("/:id")
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(deleteAppointment);

export default router;
