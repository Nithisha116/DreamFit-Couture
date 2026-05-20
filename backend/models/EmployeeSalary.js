import mongoose from "mongoose";

const employeeSalarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
    totalLeave: {
      type: Number,
      default: 0,
    },
    totalHalfDay: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    payableDays: {
      type: Number,
      required: true,
      min: 0,
    },
    perDaySalary: {
      type: Number,
      default: 0,
    },
    perHourSalary: {
      type: Number,
      default: 0,
    },
    totalHoursWorked: {
      type: Number,
      default: 0,
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    components: {
      bonuses: {
        type: Number,
        default: 0,
      },
      overtimePay: {
        type: Number,
        default: 0,
      },
      deductions: {
        absentDeduction: { type: Number, default: 0 },
        halfDayDeduction: { type: Number, default: 0 },
        latePenalty: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedAt: {
      type: Date,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate salary for same employee, month and year
employeeSalarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const EmployeeSalary = mongoose.model("EmployeeSalary", employeeSalarySchema);

export default EmployeeSalary;
