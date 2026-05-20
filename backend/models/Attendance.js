import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Full Day", "Custom"],
      default: "Full Day",
    },
    attendanceDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Half Day", "Late"],
      required: true,
    },
    checkInTime: {
      type: String,
      trim: true,
    },
    checkOutTime: {
      type: String,
      trim: true,
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },
    attendanceSource: {
      type: String,
      enum: ["Manual", "AutoLeave", "System"],
      default: "Manual",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for the same employee on the same date (unless deleted)
attendanceSchema.index(
  { employeeId: 1, attendanceDate: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Index for faster queries
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ department: 1 });
attendanceSchema.index({ attendanceDate: -1 });
attendanceSchema.index({ employeeName: "text", employeeId: "text" });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
