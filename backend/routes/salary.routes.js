import express from "express";
import { protect, isAdmin } from "../middleware/auth.middleware.js";
import {
  generateMonthlySalary,
  getAllSalaryReports,
  lockSalaryRecord,
  updatePayrollConfig,
  getPayrollConfigData,
  getLiveSalaryRecalculation
} from "../controllers/salary.controller.js";
import {
  getActiveEmployees,
  getPayrollSummary,
  paySalary,
  getSalaryHistory,
  getSalarySlip,
  lockPayroll,
  unlockPayroll,
} from "../controllers/salaryPayment.controller.js";

const router = express.Router();

// Protected admin routes
router.use(protect);
router.use(isAdmin);

router.post("/generate", generateMonthlySalary);
router.get("/reports", getAllSalaryReports);
router.put("/lock/:id", lockSalaryRecord);
router.post("/config", updatePayrollConfig);
router.get("/config", getPayrollConfigData);
router.get("/live/:id", getLiveSalaryRecalculation);

// ── Salary Payment Workflow ──────────────────────────────────────────────────
router.get("/employees/active", getActiveEmployees);
router.get("/payroll/summary", getPayrollSummary);         // ?employeeId&month&year
router.post("/pay", paySalary);
router.get("/history/:employeeId", getSalaryHistory);      // ?year
router.get("/slip/:employeeId/:month/:year", getSalarySlip);
router.post("/payroll/lock", lockPayroll);
router.post("/payroll/unlock", unlockPayroll);

export default router;
