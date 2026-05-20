import mongoose from "mongoose";

const payrollConfigSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
    },
    workingDaysPerMonth: {
      type: Number,
      required: true,
      default: 26,
    },
    weeklyOffs: {
      type: [String],
      default: ["Sunday"],
    },
    holidays: [
      {
        date: Date,
        name: String,
      },
    ],
    overtimeRatePerHour: {
      type: Number,
      required: true,
      default: 100,
    },
    minimumOvertimeThreshold: {
      type: Number,
      default: 0.5, // 30 minutes
    },
    maxOvertimePerDay: {
      type: Number,
      default: 4,
    },
    latePenaltyAmount: {
      type: Number,
      default: 50,
    },
    taxPercentage: {
      type: Number,
      default: 0,
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

// We can have a global config (no month/year) or month-specific overrides
payrollConfigSchema.index({ month: 1, year: 1 }, { unique: true, sparse: true });

const PayrollConfig = mongoose.model("PayrollConfig", payrollConfigSchema);

export default PayrollConfig;
