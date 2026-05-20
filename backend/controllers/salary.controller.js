import EmployeeSalary from "../models/EmployeeSalary.js";
import PayrollConfig from "../models/PayrollConfig.js";
import User from "../models/User.js";
import Tailor from "../models/Tailor.js";
import CuttingMaster from "../models/CuttingMaster.js";
import StoreKeeper from "../models/StoreKeeper.js";
import { 
  getMonthlyAttendanceStats, 
  calculatePayableDays, 
  calculateSalaryComponents 
} from "../utils/attendanceAnalytics.helper.js";
import mongoose from "mongoose";

/**
 * Gets the payroll configuration for a specific month or the global default.
 */
const getPayrollConfig = async (month, year) => {
  let config = await PayrollConfig.findOne({ month, year });
  if (!config) {
    config = await PayrollConfig.findOne({ month: null, year: null });
  }
  // Default fallbacks if nothing in DB
  return config || {
    workingDaysPerMonth: 26,
    weeklyOffs: ["Sunday"],
    overtimeRatePerHour: 100,
    latePenaltyAmount: 50,
    taxPercentage: 0,
    minimumOvertimeThreshold: 0.5,
    maxOvertimePerDay: 4
  };
};

/**
 * Generates monthly salary for all active employees.
 */
export const generateMonthlySalary = async (req, res) => {
  const { month, year } = req.body;
  const adminId = req.user._id;

  if (!month || !year) {
    return res.status(400).json({ message: "Month and Year are required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const config = await getPayrollConfig(month, year);
    
    // Fetch all active employees
    const [tailors, cuttingMasters, storeKeepers, admins] = await Promise.all([
      Tailor.find({ isActive: true }).session(session),
      CuttingMaster.find({ isActive: true }).session(session),
      StoreKeeper.find({ isActive: true }).session(session),
      User.find({ isActive: true }).session(session),
    ]);

    const allEmployees = [
      ...tailors.map(e => ({ ...e.toObject(), empId: e.tailorId, type: "Tailor" })),
      ...cuttingMasters.map(e => ({ ...e.toObject(), empId: e.cuttingMasterId, type: "Cutting Master" })),
      ...storeKeepers.map(e => ({ ...e.toObject(), empId: e.storeKeeperId, type: "Store Keeper" })),
      ...admins.map(e => ({ ...e.toObject(), empId: e._id.toString(), type: "Admin" })),
    ];

    const salaryRecords = [];

    for (const emp of allEmployees) {
      // Check if salary already exists and is locked
      const existingSalary = await EmployeeSalary.findOne({ 
        employeeId: emp.empId, 
        month, 
        year 
      }).session(session);

      if (existingSalary && existingSalary.isLocked) {
        continue; // Skip locked records
      }

      const stats = await getMonthlyAttendanceStats(emp.empId, month, year);
      const payableDays = calculatePayableDays(stats);
      const components = calculateSalaryComponents(emp.basicSalary || 0, stats, config, month, year);

      const salaryData = {
        employeeId: emp.empId,
        employeeName: emp.name,
        department: emp.type,
        month,
        year,
        basicSalary: emp.basicSalary || 0,
        totalPresent: stats.totalPresent,
        totalAbsent: stats.totalAbsent,
        totalLeave: stats.totalLeave,
        totalHalfDay: stats.totalHalfDay,
        overtimeHours: stats.overtimeHours,
        payableDays,
        perDaySalary: components.perDaySalary,
        perHourSalary: components.perHourSalary,
        totalHoursWorked: (stats.totalPresent * 8) + (stats.totalHalfDay * 4),
        grossSalary: components.grossSalary,
        netSalary: components.netSalary,
        components: {
          bonuses: 0,
          overtimePay: components.overtimePay,
          deductions: components.deductions
        },
        generatedBy: adminId
      };

      if (existingSalary) {
        await EmployeeSalary.findByIdAndUpdate(existingSalary._id, salaryData, { session });
      } else {
        await EmployeeSalary.create([salaryData], { session });
      }
      
      salaryRecords.push(salaryData);
    }

    await session.commitTransaction();
    res.status(201).json({ 
      message: `Salary generated for ${salaryRecords.length} employees`,
      count: salaryRecords.length 
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Salary Generation Error:", error);
    res.status(500).json({ message: "Failed to generate salary", error: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * Gets all salary reports with filters.
 */
export const getAllSalaryReports = async (req, res) => {
  const { month, year, department, isLocked } = req.query;
  const filter = {};
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);
  if (department) filter.department = department;
  if (isLocked !== undefined) filter.isLocked = isLocked === "true";

  try {
    const salaries = await EmployeeSalary.find(filter).sort({ createdAt: -1 });
    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

/**
 * Locks a specific salary record.
 */
export const lockSalaryRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const salary = await EmployeeSalary.findByIdAndUpdate(id, {
      isLocked: true,
      lockedAt: new Date(),
      lockedBy: req.user._id
    }, { new: true });
    
    if (!salary) return res.status(404).json({ message: "Salary record not found" });
    res.status(200).json({ message: "Salary locked successfully", salary });
  } catch (error) {
    res.status(500).json({ message: "Error locking salary", error: error.message });
  }
};

/**
 * Updates payroll configuration.
 */
export const updatePayrollConfig = async (req, res) => {
  const { month, year, ...configData } = req.body;
  try {
    const config = await PayrollConfig.findOneAndUpdate(
      { month: month || null, year: year || null },
      { ...configData, updatedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Payroll configuration updated", config });
  } catch (error) {
    res.status(500).json({ message: "Error updating config", error: error.message });
  }
};

/**
 * Gets payroll configuration.
 */
export const getPayrollConfigData = async (req, res) => {
  const { month, year } = req.query;
  try {
    const config = await getPayrollConfig(month ? Number(month) : null, year ? Number(year) : null);
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error fetching config", error: error.message });
  }
};
/**
 * Gets a real-time recalculation of a salary record based on current profile and attendance data.
 * Used for "Dynamic Pay Slips" that reflect recent changes immediately.
 */
export const getLiveSalaryRecalculation = async (req, res) => {
  const { id } = req.params;
  try {
    const salaryRecord = await EmployeeSalary.findById(id);
    if (!salaryRecord) return res.status(404).json({ message: "Salary record not found" });

    // If locked, we MUST return the historical record exactly as it is
    if (salaryRecord.isLocked) {
      return res.status(200).json({ ...salaryRecord.toObject(), isLive: false });
    }

    // Fetch latest employee data
    let employeeData = null;
    const { employeeId, department } = salaryRecord;

    switch (department) {
      case "Tailor": 
        employeeData = await Tailor.findOne({ tailorId: employeeId }); 
        break;
      case "Cutting Master": 
        employeeData = await CuttingMaster.findOne({ cuttingMasterId: employeeId }); 
        break;
      case "Store Keeper": 
        employeeData = await StoreKeeper.findOne({ storeKeeperId: employeeId }); 
        break;
      case "Admin": 
        employeeData = await User.findById(employeeId); 
        break;
      default: 
        employeeData = await User.findById(employeeId);
    }

    if (!employeeData) return res.status(404).json({ message: "Employee profile not found" });

    // Fetch latest payroll config
    const config = await getPayrollConfig(salaryRecord.month, salaryRecord.year);

    // Fetch latest attendance stats
    const stats = await getMonthlyAttendanceStats(employeeId, salaryRecord.month, salaryRecord.year);
    
    // Recalculate
    const components = calculateSalaryComponents(employeeData.basicSalary || 0, stats, config, salaryRecord.month, salaryRecord.year);
    const payableDays = calculatePayableDays(stats);

    const updatedData = {
      basicSalary: employeeData.basicSalary || 0,
      employeeName: employeeData.name, 
      totalPresent: stats.totalPresent,
      totalAbsent: stats.totalAbsent,
      totalLeave: stats.totalLeave,
      totalHalfDay: stats.totalHalfDay,
      overtimeHours: stats.overtimeHours,
      payableDays,
      perDaySalary: components.perDaySalary,
      perHourSalary: components.perHourSalary,
      totalHoursWorked: (stats.totalPresent * 8) + (stats.totalHalfDay * 4),
      grossSalary: components.grossSalary,
      netSalary: components.netSalary,
      components: {
        ...salaryRecord.components,
        overtimePay: components.overtimePay,
        deductions: components.deductions
      },
      isLive: true
    };

    // ✅ If 'save' query param is present, persist to DB
    if (req.query.save === 'true') {
      const savedRecord = await EmployeeSalary.findByIdAndUpdate(id, updatedData, { new: true });
      return res.status(200).json(savedRecord);
    }

    // Return merged data (Don't save yet, just for real-time preview)
    res.status(200).json({
      ...salaryRecord.toObject(),
      ...updatedData
    });
  } catch (error) {
    console.error("Recalculation Error:", error);
    res.status(500).json({ message: "Error recalculating salary", error: error.message });
  }
};
