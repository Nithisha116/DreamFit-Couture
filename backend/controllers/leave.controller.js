import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";
import Tailor from "../models/Tailor.js";
import CuttingMaster from "../models/CuttingMaster.js";
import StoreKeeper from "../models/StoreKeeper.js";

// Helper to get employee model by ID prefix or department
const getEmployeeModel = (employeeId) => {
  if (employeeId.startsWith("TLR")) return Tailor;
  if (employeeId.startsWith("CM")) return CuttingMaster;
  if (employeeId.startsWith("SK")) return StoreKeeper;
  return null;
};

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private (Admin/HR/Employee)
export const createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, leaveType, reason } = req.body;

    // 1. Basic Validation
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: "End date cannot be before start date" });
    }

    // 2. Check for overlapping requests
    const overlapping = await Leave.findOne({
      employeeId,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ 
        success: false, 
        message: `Already has a ${overlapping.status.toLowerCase()} leave request for this date range.` 
      });
    }

    // 3. Calculate total days (simple diff for now, can be improved for business days)
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      ...req.body,
      totalDays,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    console.error("Error in createLeaveRequest:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all leave requests with filters
// @route   GET /api/leaves
export const getAllLeaves = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== "all") filter.status = req.query.status;
    if (req.query.department && req.query.department !== "all") filter.department = req.query.department;
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    
    if (req.query.search) {
      filter.$or = [
        { employeeName: { $regex: req.query.search, $options: "i" } },
        { employeeId: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("approvedBy", "name")
      .lean();

    const totalRecords = await Leave.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        leaves,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        totalRecords
      }
    });
  } catch (error) {
    console.error("Error in getAllLeaves:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update leave status (Approve/Reject/Cancel)
// @route   PATCH /api/leaves/:id/status
export const updateLeaveStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, adminNotes } = req.body;
    const leave = await Leave.findById(req.params.id).session(session);

    if (!leave) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    if (leave.status !== "Pending" && status !== "Cancelled") {
       await session.abortTransaction();
       return res.status(400).json({ success: false, message: "Only pending requests can be approved or rejected" });
    }

    const employeeModel = getEmployeeModel(leave.employeeId);
    const employee = await employeeModel.findOne({ 
      $or: [
        { tailorId: leave.employeeId },
        { cuttingMasterId: leave.employeeId },
        { storeKeeperId: leave.employeeId }
      ]
    }).session(session);

    if (!employee) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Employee not found for balance check" });
    }

    // --- CASE: APPROVE ---
    if (status === "Approved") {
      const typeKey = leave.leaveType.toLowerCase(); // 'casual', 'sick', 'paid'
      
      // Balance check
      if (["casual", "sick", "paid"].includes(typeKey)) {
        if (employee.leaveBalance[typeKey] < leave.totalDays) {
          await session.abortTransaction();
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient ${leave.leaveType} balance. Remaining: ${employee.leaveBalance[typeKey]}` 
          });
        }
        // Deduct balance
        employee.leaveBalance[typeKey] -= leave.totalDays;
        await employee.save({ session });
      }

      // Sync Attendance
      const syncResult = await syncLeaveAttendance(leave, session);
      leave.adminNotes = syncResult.warning ? `${adminNotes || ""} (Warning: ${syncResult.warning})` : adminNotes;
      leave.approvedAt = new Date();
      leave.approvedBy = req.user._id;
    }

    // --- CASE: CANCEL ---
    if (status === "Cancelled" && leave.status === "Approved") {
      const typeKey = leave.leaveType.toLowerCase();
      // Rollback balance
      if (["casual", "sick", "paid"].includes(typeKey)) {
        employee.leaveBalance[typeKey] += leave.totalDays;
        await employee.save({ session });
      }
      // Rollback attendance
      await Attendance.deleteMany({
        employeeId: leave.employeeId,
        source: "AutoLeave",
        attendanceDate: { $gte: leave.startDate, $lte: leave.endDate }
      }).session(session);
    }

    if (status === "Rejected") {
      leave.rejectedAt = new Date();
    }

    leave.status = status;
    leave.updatedBy = req.user._id;
    if (adminNotes) leave.adminNotes = adminNotes;

    await leave.save({ session });

    await session.commitTransaction();
    res.status(200).json({ success: true, data: leave });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateLeaveStatus:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  } finally {
    session.endSession();
  }
};

// Helper: Sync Leave to Attendance
async function syncLeaveAttendance(leave, session) {
  const dates = [];
  let curr = new Date(leave.startDate);
  while (curr <= new Date(leave.endDate)) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  let conflicts = 0;
  for (const date of dates) {
    // Check existing attendance
    const startOfDay = new Date(date.setHours(0,0,0,0));
    const endOfDay = new Date(date.setHours(23,59,59,999));

    const existing = await Attendance.findOne({
      employeeId: leave.employeeId,
      attendanceDate: { $gte: startOfDay, $lte: endOfDay }
    }).session(session);

    if (existing) {
      // Overwrite only if Absent or System generated
      if (existing.status === "Absent" || existing.source === "System") {
        existing.status = "Leave";
        existing.source = "AutoLeave";
        existing.notes = `Auto-generated from Approved Leave: ${leave.reason}`;
        await existing.save({ session });
      } else {
        conflicts++;
      }
    } else {
      // Create new Leave record
      await Attendance.create([{
        employeeName: leave.employeeName,
        employeeId: leave.employeeId,
        department: leave.department,
        attendanceDate: date,
        status: "Leave",
        source: "AutoLeave",
        notes: `Auto-generated from Approved Leave: ${leave.reason}`,
        createdBy: leave.approvedBy || leave.createdBy
      }], { session });
    }
  }

  return { 
    success: true, 
    warning: conflicts > 0 ? `${conflicts} date(s) had existing 'Present/Manual' records and were skipped.` : null 
  };
}
