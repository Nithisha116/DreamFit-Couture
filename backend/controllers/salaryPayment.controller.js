import mongoose from "mongoose";
import EmployeeSalary from "../models/EmployeeSalary.js";
import SalaryTransaction from "../models/SalaryTransaction.js";
import Transaction from "../models/Transaction.js";
import AuditLog from "../models/AuditLog.js";
import Tailor from "../models/Tailor.js";
import CuttingMaster from "../models/CuttingMaster.js";
import StoreKeeper from "../models/StoreKeeper.js";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Get all active employees unified
// ─────────────────────────────────────────────────────────────────────────────
const getAllActiveEmployees = async () => {
  const [tailors, cuttingMasters, storeKeepers, admins] = await Promise.all([
    Tailor.find({ isActive: true }).select("tailorId name phone department basicSalary"),
    CuttingMaster.find({ isActive: true }).select("cuttingMasterId name phone department basicSalary"),
    StoreKeeper.find({ isActive: true }).select("storeKeeperId name phone department basicSalary"),
    User.find({ isActive: true, role: "ADMIN" }).select("_id name email phone role basicSalary"),
  ]);

  return [
    ...tailors.map((e) => ({
      _id: e._id,
      employeeId: e.tailorId,
      name: e.name,
      phone: e.phone,
      department: "Tailor",
      basicSalary: e.basicSalary || 0,
      role: "TAILOR",
    })),
    ...cuttingMasters.map((e) => ({
      _id: e._id,
      employeeId: e.cuttingMasterId,
      name: e.name,
      phone: e.phone,
      department: "Cutting Master",
      basicSalary: e.basicSalary || 0,
      role: "CUTTING_MASTER",
    })),
    ...storeKeepers.map((e) => ({
      _id: e._id,
      employeeId: e.storeKeeperId,
      name: e.name,
      phone: e.phone,
      department: "Store Keeper",
      basicSalary: e.basicSalary || 0,
      role: "STORE_KEEPER",
    })),
    ...admins.map((e) => ({
      _id: e._id,
      employeeId: e._id.toString(),
      name: e.name,
      phone: e.phone,
      department: "Admin",
      basicSalary: e.basicSalary || 0,
      role: "ADMIN",
    })),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Compute authoritative paidAmount from SalaryTransaction aggregate
// ─────────────────────────────────────────────────────────────────────────────
const computeAuthoritativePaidAmount = async (payrollId) => {
  const result = await SalaryTransaction.aggregate([
    { $match: { payrollId: new mongoose.Types.ObjectId(payrollId) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total || 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Generate ref number DF/TXN/YYYY/MM/empId/NNN
// ─────────────────────────────────────────────────────────────────────────────
const generateRefNumber = async (employeeId, month, year) => {
  const count = await SalaryTransaction.countDocuments({ employeeId, month, year });
  const seq = String(count + 1).padStart(3, "0");
  const mm = String(month).padStart(2, "0");
  return `DF/TXN/${year}/${mm}/${employeeId}/${seq}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary/employees/active
// ─────────────────────────────────────────────────────────────────────────────
export const getActiveEmployees = async (req, res) => {
  try {
    const employees = await getAllActiveEmployees();
    res.status(200).json(employees);
  } catch (error) {
    console.error("getActiveEmployees error:", error);
    res.status(500).json({ message: "Failed to fetch active employees", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary/payroll/summary?employeeId=&month=&year=
// ─────────────────────────────────────────────────────────────────────────────
export const getPayrollSummary = async (req, res) => {
  const { employeeId, month, year } = req.query;

  if (!employeeId || !month || !year) {
    return res.status(400).json({ message: "employeeId, month, and year are required" });
  }

  try {
    const payroll = await EmployeeSalary.findOne({
      employeeId,
      month: Number(month),
      year: Number(year),
    });

    if (!payroll) {
      return res.status(404).json({ message: "No payroll record found for this employee and period. Please generate salary first." });
    }

    // Authoritative paid amount from aggregate
    const authPaidAmount = await computeAuthoritativePaidAmount(payroll._id);
    const totalSalary = payroll.netSalary || 0;
    const remaining = Math.max(0, totalSalary - authPaidAmount);

    // Derive status
    let paymentStatus = "unpaid";
    if (authPaidAmount > 0 && remaining > 0) paymentStatus = "partial";
    else if (remaining <= 0 && authPaidAmount > 0) paymentStatus = "paid";

    // Fetch full payment history with transaction details
    const transactions = await SalaryTransaction.find({ payrollId: payroll._id })
      .sort({ paidAt: -1 })
      .select("amount paymentMethod transactionType paidAt refNumber notes");

    res.status(200).json({
      payrollId: payroll._id,
      employeeId,
      month: Number(month),
      year: Number(year),
      totalSalary,
      paidAmount: authPaidAmount,
      remainingAmount: remaining,
      paymentStatus,
      isLocked: payroll.isLocked,
      lockedAt: payroll.lockedAt,
      basicSalary: payroll.basicSalary,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
      attendance: {
        present: payroll.totalPresent,
        absent: payroll.totalAbsent,
        leave: payroll.totalLeave,
        halfDay: payroll.totalHalfDay,
        workHours: payroll.totalHoursWorked,
        overtime: payroll.overtimeHours,
        totalDays: payroll.payableDays,
      },
      components: payroll.components,
      paymentHistory: transactions,
    });
  } catch (error) {
    console.error("getPayrollSummary error:", error);
    res.status(500).json({ message: "Failed to fetch payroll summary", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/salary/pay — PRIMARY SALARY PAYMENT ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
export const paySalary = async (req, res) => {
  const {
    employeeId,
    employeeName,
    department,
    payrollId,
    transactionType,
    amount,
    paymentMethod,
    month,
    year,
    notes,
  } = req.body;

  const createdBy = req.user._id;

  // ── Validate required fields ──────────────────────────────────────────────
  if (!employeeId || !payrollId || !transactionType || !amount || !paymentMethod || !month || !year) {
    return res.status(400).json({ message: "Missing required fields: employeeId, payrollId, transactionType, amount, paymentMethod, month, year" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount < 1) {
    return res.status(400).json({ message: "Amount must be at least ₹1" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ── Step A: Validate payroll ──────────────────────────────────────────
    const payroll = await EmployeeSalary.findById(payrollId).session(session);
    if (!payroll) {
      throw new Error("Payroll record not found");
    }

    if (payroll.isLocked && payroll.paymentStatus === "paid") {
      throw new Error("Payroll is fully paid and locked");
    }

    // Authoritative remaining amount
    const authPaidAmount = await computeAuthoritativePaidAmount(payrollId);
    const totalSalary = payroll.netSalary || 0;
    const currentRemaining = Math.max(0, totalSalary - authPaidAmount);

    // Float-safe comparison
    if (Math.round(parsedAmount * 100) > Math.round(currentRemaining * 100)) {
      throw new Error(`Payment amount ₹${parsedAmount.toLocaleString('en-IN')} exceeds remaining salary of ₹${currentRemaining.toLocaleString('en-IN')}`);
    }

    // ── Step B: Generate ref number ──────────────────────────────────────
    const refNumber = await generateRefNumber(employeeId, Number(month), Number(year));

    // ── Step C: Create SalaryTransaction ────────────────────────────────
    const [txn] = await SalaryTransaction.create(
      [
        {
          employeeId,
          employeeName: employeeName || payroll.employeeName,
          department: department || payroll.department,
          payrollId: payroll._id,
          transactionType,
          amount: parsedAmount,
          paymentMethod,
          month: Number(month),
          year: Number(year),
          notes,
          refNumber,
          paidAt: new Date(),
          createdBy,
        },
      ],
      { session }
    );

    // ── Step D: Create Transaction (expense ledger mirror) ───────────────
    const accountType = paymentMethod === "cash" ? "hand-cash" : "bank";
    const [ledgerEntry] = await Transaction.create(
      [
        {
          type: "expense",
          category: "salary",
          amount: parsedAmount,
          paymentMethod,
          accountType,
          description: `${transactionType} - ${employeeName || payroll.employeeName} (${refNumber})`,
          transactionDate: txn.paidAt,
          createdBy,
          referenceNumber: refNumber,
          isSystemGenerated: true,
          sourceType: "salary_transaction",
          sourceId: txn._id,
          employeeRef: employeeId,
        },
      ],
      { session }
    );

    // ── Step E: Link ledger entry back to SalaryTransaction ──────────────
    txn.transactionLedgerId = ledgerEntry._id;
    await txn.save({ session });

    // ── Step F: Update EmployeeSalary atomically ─────────────────────────
    const newPaid = authPaidAmount + parsedAmount;
    const newRemaining = Math.max(0, totalSalary - newPaid);
    let newStatus = "unpaid";
    if (newPaid > 0 && newRemaining > 0) newStatus = "partial";
    else if (newRemaining <= 0) newStatus = "paid";

    await EmployeeSalary.findByIdAndUpdate(
      payrollId,
      {
        $set: {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          paymentStatus: newStatus,
        },
        $push: {
          paymentHistory: {
            transactionId: txn._id,
            amount: parsedAmount,
            paidAt: txn.paidAt,
            method: paymentMethod,
            transactionType,
            refNumber,
          },
        },
      },
      { session, new: true }
    );

    // ── Step G: Commit ────────────────────────────────────────────────────
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      transaction: {
        _id: txn._id,
        refNumber,
        amount: parsedAmount,
        transactionType,
        paymentMethod,
        paidAt: txn.paidAt,
      },
      updatedPayroll: {
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        paymentStatus: newStatus,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("paySalary error:", error);
    const statusCode = error.message.includes("exceeds") || error.message.includes("locked") ? 400 : 500;
    res.status(statusCode).json({ message: error.message || "Salary payment failed" });
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary/history/:employeeId?year=
// ─────────────────────────────────────────────────────────────────────────────
export const getSalaryHistory = async (req, res) => {
  const { employeeId } = req.params;
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  try {
    const records = await EmployeeSalary.find({ employeeId, year }).sort({ month: -1 });

    const enriched = await Promise.all(
      records.map(async (r) => {
        const authPaid = await computeAuthoritativePaidAmount(r._id);
        const totalSalary = r.netSalary || 0;
        const remaining = Math.max(0, totalSalary - authPaid);
        let status = "unpaid";
        if (authPaid > 0 && remaining > 0) status = "partial";
        else if (remaining <= 0 && authPaid > 0) status = "paid";

        const transactions = await SalaryTransaction.find({ payrollId: r._id })
          .sort({ paidAt: -1 })
          .select("amount paymentMethod transactionType paidAt refNumber notes");

        return {
          _id: r._id,
          month: r.month,
          year: r.year,
          basicSalary: r.basicSalary,
          grossSalary: r.grossSalary,
          netSalary: totalSalary,
          totalSalary,
          paidAmount: authPaid,
          remainingAmount: remaining,
          paymentStatus: status,
          isLocked: r.isLocked,
          lockedAt: r.lockedAt,
          attendance: {
            present: r.totalPresent,
            absent: r.totalAbsent,
            leave: r.totalLeave,
            halfDay: r.totalHalfDay,
            workHours: r.totalHoursWorked,
            overtime: r.overtimeHours,
            totalDays: r.payableDays,
          },
          paymentHistory: transactions,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("getSalaryHistory error:", error);
    res.status(500).json({ message: "Failed to fetch salary history", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/salary/slip/:employeeId/:month/:year
// ─────────────────────────────────────────────────────────────────────────────
export const getSalarySlip = async (req, res) => {
  const { employeeId, month, year } = req.params;

  try {
    const payroll = await EmployeeSalary.findOne({
      employeeId,
      month: Number(month),
      year: Number(year),
    });

    if (!payroll) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    // Employee details
    let employee = null;
    const dept = payroll.department;
    if (dept === "Tailor") employee = await Tailor.findOne({ tailorId: employeeId });
    else if (dept === "Cutting Master") employee = await CuttingMaster.findOne({ cuttingMasterId: employeeId });
    else if (dept === "Store Keeper") employee = await StoreKeeper.findOne({ storeKeeperId: employeeId });
    else employee = await User.findById(employeeId);

    const authPaid = await computeAuthoritativePaidAmount(payroll._id);
    const totalSalary = payroll.netSalary || 0;
    const remaining = Math.max(0, totalSalary - authPaid);

    const transactions = await SalaryTransaction.find({ payrollId: payroll._id })
      .sort({ paidAt: -1 });

    const mm = String(month).padStart(2, "0");
    const slipRefNumber = `DF/PAY/${year}/${mm}/${employeeId}`;

    res.status(200).json({
      employee: {
        name: payroll.employeeName,
        employeeId,
        department: dept,
        basicSalary: payroll.basicSalary,
        phone: employee?.phone || "",
        joiningDate: employee?.joiningDate || employee?.createdAt || null,
      },
      company: {
        name: "DreamFit Couture",
        address: "DreamFit Couture, India",
        phone: "+91-XXXXXXXXXX",
      },
      payroll: {
        month: Number(month),
        year: Number(year),
        totalSalary,
        paidAmount: authPaid,
        remainingAmount: remaining,
        paymentStatus: remaining <= 0 ? "paid" : authPaid > 0 ? "partial" : "unpaid",
        isLocked: payroll.isLocked,
        payableDays: payroll.payableDays,
      },
      earnings: [
        { label: "Basic Salary", amount: payroll.basicSalary },
        { label: "Overtime Pay", amount: payroll.components?.overtimePay || 0 },
        { label: "Bonus", amount: payroll.components?.bonuses || 0 },
      ].filter((e) => e.amount > 0),
      deductions: [
        { label: "Absence Deduction", amount: payroll.components?.deductions?.absentDeduction || 0 },
        { label: "Half Day Deduction", amount: payroll.components?.deductions?.halfDayDeduction || 0 },
        { label: "Late Penalty", amount: payroll.components?.deductions?.latePenalty || 0 },
        { label: "Tax", amount: payroll.components?.deductions?.tax || 0 },
        { label: "Other Deductions", amount: payroll.components?.deductions?.other || 0 },
      ].filter((d) => d.amount > 0),
      grossEarnings: payroll.grossSalary,
      totalDeductions: Object.values(payroll.components?.deductions || {}).reduce((a, b) => a + b, 0),
      netPayable: totalSalary,
      attendance: {
        present: payroll.totalPresent,
        absent: payroll.totalAbsent,
        leave: payroll.totalLeave,
        halfDay: payroll.totalHalfDay,
        workHours: payroll.totalHoursWorked,
        overtime: payroll.overtimeHours,
        totalDays: payroll.payableDays,
      },
      transactions,
      slipRefNumber,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("getSalarySlip error:", error);
    res.status(500).json({ message: "Failed to generate salary slip", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/salary/payroll/lock
// ─────────────────────────────────────────────────────────────────────────────
export const lockPayroll = async (req, res) => {
  const { payrollId } = req.body;
  const lockedBy = req.user._id;

  try {
    const payroll = await EmployeeSalary.findById(payrollId);
    if (!payroll) return res.status(404).json({ message: "Payroll record not found" });
    if (payroll.paidAmount <= 0) return res.status(400).json({ message: "Cannot lock unpaid payroll. Make at least one payment first." });

    const updated = await EmployeeSalary.findByIdAndUpdate(
      payrollId,
      { isLocked: true, lockedAt: new Date(), lockedBy },
      { new: true }
    );

    await AuditLog.create({
      action: "LOCK_PAYROLL",
      user: lockedBy,
      entityType: "Payroll",
      entityId: payrollId,
      description: `Payroll locked for ${payroll.employeeName} - ${payroll.month}/${payroll.year}`,
    });

    res.status(200).json({ message: "Payroll locked successfully", payroll: updated });
  } catch (error) {
    console.error("lockPayroll error:", error);
    res.status(500).json({ message: "Failed to lock payroll", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/salary/payroll/unlock (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const unlockPayroll = async (req, res) => {
  const { payrollId, reason } = req.body;
  const unlockedBy = req.user._id;

  if (!reason) return res.status(400).json({ message: "Unlock reason is required" });

  try {
    const payroll = await EmployeeSalary.findById(payrollId);
    if (!payroll) return res.status(404).json({ message: "Payroll record not found" });

    const updated = await EmployeeSalary.findByIdAndUpdate(
      payrollId,
      { isLocked: false, $unset: { lockedAt: 1, lockedBy: 1 } },
      { new: true }
    );

    await AuditLog.create({
      action: "UNLOCK_PAYROLL",
      user: unlockedBy,
      entityType: "Payroll",
      entityId: payrollId,
      description: `Payroll unlocked for ${payroll.employeeName} - ${payroll.month}/${payroll.year}. Reason: ${reason}`,
    });

    res.status(200).json({ message: "Payroll unlocked successfully", payroll: updated });
  } catch (error) {
    console.error("unlockPayroll error:", error);
    res.status(500).json({ message: "Failed to unlock payroll", error: error.message });
  }
};
