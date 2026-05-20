import Appointment from "../models/Appointment.js";
import mongoose from "mongoose";

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const {
      customer,
      order,
      garment,
      assignedStaff,
      appointmentType,
      title,
      description,
      startTime,
      endTime,
      duration,
      status,
      location,
      reminderSettings,
      notes,
    } = req.body;

    // Optional: Check for overlaps for the same staff or customer
    // We can add overlap logic here if needed

    const appointment = new Appointment({
      customer,
      order: order || null,
      garment: garment || null,
      assignedStaff: assignedStaff || null,
      appointmentType,
      title: title || `${appointmentType} Appointment`,
      description,
      startTime,
      endTime,
      duration,
      status: status || "scheduled",
      location,
      reminderSettings,
      notes,
      createdBy: req.user._id,
    });

    const createdAppointment = await appointment.save();

    // Populate the newly created appointment
    await createdAppointment.populate("customer", "name phone email");
    if (assignedStaff) {
      await createdAppointment.populate("assignedStaff", "name role");
    }

    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error("Create Appointment Error:", error);
    res.status(400).json({ message: error.message || "Failed to create appointment" });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const { start, end, staff, customer, status, type } = req.query;

    let query = {};

    // Filter by date range if provided
    if (start && end) {
      query.startTime = { $gte: new Date(start) };
      query.endTime = { $lte: new Date(end) };
    } else if (start) {
      query.startTime = { $gte: new Date(start) };
    }

    if (staff) query.assignedStaff = staff;
    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (type) query.appointmentType = type;

    const appointments = await Appointment.find(query)
      .populate("customer", "name phone email")
      .populate("assignedStaff", "name role")
      .populate("order", "orderNumber status totalAmount")
      .populate("createdBy", "name")
      .sort({ startTime: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Get Appointments Error:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("customer", "name phone email")
      .populate("assignedStaff", "name role")
      .populate("order", "orderNumber status")
      .populate("garment", "name description")
      .populate("createdBy", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Get Appointment Error:", error);
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
};

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update fields
    const fieldsToUpdate = [
      "customer",
      "order",
      "garment",
      "assignedStaff",
      "appointmentType",
      "title",
      "description",
      "startTime",
      "endTime",
      "duration",
      "status",
      "location",
      "reminderSettings",
      "notes",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    const updatedAppointment = await appointment.save();

    await updatedAppointment.populate("customer", "name phone email");
    if (updatedAppointment.assignedStaff) {
      await updatedAppointment.populate("assignedStaff", "name role");
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Update Appointment Error:", error);
    res.status(400).json({ message: error.message || "Failed to update appointment" });
  }
};

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.deleteOne();

    res.status(200).json({ message: "Appointment removed successfully" });
  } catch (error) {
    console.error("Delete Appointment Error:", error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
};

// @desc    Get upcoming appointments for dashboard
// @route   GET /api/appointments/dashboard/upcoming
// @access  Private
export const getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const appointments = await Appointment.find({
      startTime: { $gte: today, $lte: endOfWeek },
      status: { $in: ["scheduled", "confirmed"] }
    })
      .populate("customer", "name phone")
      .populate("assignedStaff", "name")
      .sort({ startTime: 1 })
      .limit(10);

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Get Upcoming Appointments Error:", error);
    res.status(500).json({ message: "Failed to fetch upcoming appointments" });
  }
};
