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

export default router;
