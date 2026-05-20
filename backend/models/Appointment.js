import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    garment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garment",
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming general staff assignment using User model. Could be Tailor/CuttingMaster as well
      default: null,
    },
    appointmentType: {
      type: String,
      enum: [
        "measurement",
        "fitting",
        "delivery",
        "consultation",
        "alteration",
        "home_visit",
        "video"
      ],
      required: true,
      default: "consultation",
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // duration in minutes
      required: true,
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "missed",
        "rescheduled"
      ],
      default: "scheduled",
    },
    location: {
      type: String,
      default: "Store",
    },
    reminderSettings: {
      whatsapp: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      timeBefore: { type: Number, default: 60 }, // minutes before
      sent: { type: Boolean, default: false },
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
appointmentSchema.index({ customer: 1 });
appointmentSchema.index({ assignedStaff: 1 });
appointmentSchema.index({ startTime: 1, endTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentType: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
