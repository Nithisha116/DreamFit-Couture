import mongoose from "mongoose";

const salaryTransactionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    payrollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeSalary",
      required: true,
    },
    transactionType: {
      type: String,
      enum: [
        "Payroll Salary",
        "Advance Salary",
        "Bonus",
        "Overtime",
        "Incentive",
        "Deduction Adjustment",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "bank-transfer", "card"],
      required: true,
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
    paidAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    refNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Mirror entry in Transaction (expense ledger)
    transactionLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast ref-number generation
salaryTransactionSchema.index({ employeeId: 1, month: 1, year: 1 });
salaryTransactionSchema.index({ payrollId: 1 });

const SalaryTransaction = mongoose.model(
  "SalaryTransaction",
  salaryTransactionSchema
);
export default SalaryTransaction;
