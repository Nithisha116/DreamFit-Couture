import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

/**
 * Aggregates attendance statistics for a given employee and month.
 */
export const getMonthlyAttendanceStats = async (employeeId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const attendanceRecords = await Attendance.find({
    employeeId,
    attendanceDate: { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  const stats = {
    totalPresent: 0,
    totalAbsent: 0,
    totalLeave: 0,
    totalHalfDay: 0,
    totalLate: 0,
    overtimeHours: 0,
    attendanceDays: attendanceRecords.length,
  };

  attendanceRecords.forEach((record) => {
    switch (record.status) {
      case "Present":
        stats.totalPresent++;
        break;
      case "Absent":
        stats.totalAbsent++;
        break;
      case "Leave":
        stats.totalLeave++;
        break;
      case "Half Day":
        stats.totalHalfDay++;
        break;
      case "Late":
        stats.totalLate++;
        stats.totalPresent++; // Late still counts as present for base day count usually
        break;
    }
    if (record.overtimeHours) {
      stats.overtimeHours += record.overtimeHours;
    }
  });

  return stats;
};

/**
 * Calculates payable days based on attendance stats.
 * Formula: Present + Late + Approved Leaves + (Half Days * 0.5)
 */
export const calculatePayableDays = (stats) => {
  return stats.totalPresent + stats.totalLeave + stats.totalHalfDay * 0.5;
};

/**
 * Calculates salary components based on basic salary, attendance stats, and month/year.
 * "Positive Attendance Model": Salary is earned ONLY for days present/paid.
 */
export const calculateSalaryComponents = (basicSalary, stats, config, month, year) => {
  // 1. Determine total days in the month for precise calculation
  const daysInMonth = new Date(year, month, 0).getDate();
  const standardHoursPerDay = 8;
  const totalStandardHours = daysInMonth * standardHoursPerDay;

  // 2. Calculate Precise Rates
  const perDaySalary = basicSalary / daysInMonth;
  const perHourSalary = basicSalary / totalStandardHours;

  // 3. Calculate Earned Regular Pay (Positive Model)
  // Only pay for days where they were Present, Late (counts as present), or on Paid Leave
  // Half days pay 50%
  const payableDays = stats.totalPresent + stats.totalLeave + (stats.totalHalfDay * 0.5);
  const earnedRegularPay = payableDays * perDaySalary;

  // 4. Overtime Pay
  const overtimePay = stats.overtimeHours * config.overtimeRatePerHour;

  // 5. Deductions
  const latePenalty = stats.totalLate * config.latePenaltyAmount;
  
  // No "Absent Deduction" needed anymore because they simply didn't earn that day's pay.
  // However, we can still calculate it for display/reporting if needed.
  const absentDeduction = stats.totalAbsent * perDaySalary;
  const halfDayDeduction = stats.totalHalfDay * 0.5 * perDaySalary;

  // 6. Final Totals
  // Gross Salary is now based on EARNED pay, not the theoretical full basic salary
  const grossSalary = earnedRegularPay + overtimePay;
  const totalDeductions = latePenalty; // Only penalties and taxes are deducted from earned pay
  
  // Apply tax if applicable (calculated on earned gross)
  const tax = grossSalary * (config.taxPercentage / 100);
  
  const netSalary = grossSalary - totalDeductions - tax;

  return {
    perDaySalary,
    perHourSalary,
    overtimePay,
    earnedRegularPay,
    deductions: {
      absentDeduction,
      halfDayDeduction,
      latePenalty,
      tax,
    },
    grossSalary: Math.round(grossSalary),
    netSalary: Math.max(0, Math.round(netSalary)),
  };
};

/**
 * Helper to get all employees from all categories.
 */
export const getAllEmployees = async () => {
  const [tailors, cuttingMasters, storeKeepers, admins] = await Promise.all([
    mongoose.model("Tailor").find({ isActive: true }),
    mongoose.model("CuttingMaster").find({ isActive: true }),
    mongoose.model("StoreKeeper").find({ isActive: true }),
    mongoose.model("User").find({ isActive: true }),
  ]);

  return [
    ...tailors.map(t => ({ ...t.toObject(), type: "tailor" })),
    ...cuttingMasters.map(cm => ({ ...cm.toObject(), type: "cuttingMaster" })),
    ...storeKeepers.map(sk => ({ ...sk.toObject(), type: "storeKeeper" })),
    ...admins.map(a => ({ ...a.toObject(), type: "admin" })),
  ];
};
