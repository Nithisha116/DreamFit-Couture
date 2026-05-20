import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Tailor from "../models/Tailor.js";
import CuttingMaster from "../models/CuttingMaster.js";
import StoreKeeper from "../models/StoreKeeper.js";

// @desc    Get all attendance records (with pagination, filtering, search)
// @route   GET /api/attendance
// @access  Private
export const getAllAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isDeleted: false };

    // Search by employee name or ID
    if (req.query.search) {
      filter.$or = [
        { employeeName: { $regex: req.query.search, $options: "i" } },
        { employeeId: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Filter by exact date or month
    if (req.query.date) {
      const queryDate = new Date(req.query.date);
      // Get start and end of that specific day
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      filter.attendanceDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (req.query.month && req.query.year) {
      // For calendar view
      const month = parseInt(req.query.month);
      const year = parseInt(req.query.year);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.attendanceDate = { $gte: startDate, $lte: endDate };
    }

    // Filter by status
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    // Filter by department
    if (req.query.department && req.query.department !== "all") {
      filter.department = req.query.department;
    }

    // Execute query for existing records
    const attendances = await Attendance.find(filter)
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .lean();

    // IF a specific date is filtered, fetch ALL employees to show "Step 4" complete list
    let finalData = attendances;
    
    if (req.query.date) {
      // 1. Fetch all active employees from all categories
      const [tailors, cuttingMasters, storeKeepers] = await Promise.all([
        Tailor.find({ isActive: true }).select("name tailorId specialization").lean(),
        CuttingMaster.find({ isActive: true }).select("name cuttingMasterId").lean(),
        StoreKeeper.find({ isActive: true }).select("name storeKeeperId department").lean()
      ]);

      // 2. Map them to a unified format
      const allEmployees = [
        ...tailors.map(t => ({ employeeName: t.name, employeeId: t.tailorId, department: "Tailoring" })),
        ...cuttingMasters.map(cm => ({ employeeName: cm.name, employeeId: cm.cuttingMasterId, department: "Cutting" })),
        ...storeKeepers.map(sk => ({ employeeName: sk.name, employeeId: sk.storeKeeperId, department: sk.department || "Store" }))
      ];

      // 3. Merge with existing attendance records
      finalData = allEmployees.map(emp => {
        const record = attendances.find(r => r.employeeId === emp.employeeId);
        if (record) return record;
        
        // Return a "ghost" record for the UI to show as "Not Marked"
        return {
          ...emp,
          status: "Not Marked",
          attendanceDate: new Date(req.query.date),
          isGhost: true // Flag for frontend
        };
      });

      // Handle search on merged data if needed
      if (req.query.search) {
        const search = req.query.search.toLowerCase();
        finalData = finalData.filter(item => 
          item.employeeName.toLowerCase().includes(search) || 
          item.employeeId.toLowerCase().includes(search)
        );
      }

      // Handle pagination on merged data
      const total = finalData.length;
      finalData = finalData.slice(skip, skip + limit);

      return res.status(200).json({
        success: true,
        data: finalData,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const total = await Attendance.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: finalData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllAttendance:", error);
    res.status(500).json({ success: false, message: "Server error fetching attendance" });
  }
};

// @desc    Get attendance statistics for a specific date (defaults to today)
// @route   GET /api/attendance/stats
// @access  Private
export const getAttendanceStats = async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Base match for today's records
    const matchToday = {
      isDeleted: false,
      attendanceDate: { $gte: startOfDay, $lte: endOfDay },
    };

    const stats = await Attendance.aggregate([
      { $match: matchToday },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format results
    const result = {
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      lateEmployees: 0,
      onLeave: 0,
      halfDay: 0,
    };

    // Fetch total active workforce count
    const [tailorCount, cmCount, skCount] = await Promise.all([
      Tailor.countDocuments({ isActive: true }),
      CuttingMaster.countDocuments({ isActive: true }),
      StoreKeeper.countDocuments({ isActive: true })
    ]);

    const totalActiveEmployees = tailorCount + cmCount + skCount;

    // Fetch today's records to count unique people marked
    const markedEmployeesCount = await Attendance.distinct("employeeId", matchToday);

    result.totalEmployees = Math.max(totalActiveEmployees, markedEmployeesCount.length);
    
    // Calculate stats from aggregation
    stats.forEach((stat) => {
      if (stat._id === "Present") result.presentToday = stat.count;
      else if (stat._id === "Absent") result.absentToday = stat.count;
      else if (stat._id === "Late") result.lateEmployees = stat.count;
      else if (stat._id === "Leave") result.onLeave = stat.count;
      else if (stat._id === "Half Day") result.halfDay = stat.count;
    });
    // Absent count should also reflect those not marked?
    // Usually, in ERPs, Absent = explicitly marked Absent. 
    // But we'll stick to the "Total Employees" being the active workforce.

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error in getAttendanceStats:", error);
    res.status(500).json({ success: false, message: "Server error fetching stats" });
  }
};

// @desc    Get all active employees from master lists
// @route   GET /api/attendance/employees
// @access  Private
export const getAttendanceEmployees = async (req, res) => {
  try {
    const [tailors, cuttingMasters, storeKeepers] = await Promise.all([
      Tailor.find({ isActive: true }).select('tailorId name').lean(),
      CuttingMaster.find({ isActive: true }).select('cuttingMasterId name').lean(),
      StoreKeeper.find({ isActive: true }).select('storeKeeperId name').lean()
    ]);

    const allEmployees = [
      ...tailors.map(t => ({ employeeId: t.tailorId, employeeName: t.name, department: "Tailoring" })),
      ...cuttingMasters.map(cm => ({ employeeId: cm.cuttingMasterId, employeeName: cm.name, department: "Cutting" })),
      ...storeKeepers.map(sk => ({ employeeId: sk.storeKeeperId, employeeName: sk.name, department: "Store" }))
    ].sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    res.status(200).json({ success: true, data: allEmployees });
  } catch (error) {
    console.error("Error in getAttendanceEmployees:", error);
    res.status(500).json({ success: false, message: "Server error fetching master employee list" });
  }
};

// @desc    Create new attendance record
// @route   POST /api/attendance
// @access  Private
export const createAttendance = async (req, res) => {
  try {
    const { employeeId, employeeName, department, shift, attendanceDate, status, checkInTime, checkOutTime, overtimeHours, notes } = req.body;

    // Validate required fields
    if (!employeeId || !employeeName || !attendanceDate || !status) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    // Normalize date to start of day for accurate duplicate checking
    const targetDate = new Date(attendanceDate);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Check for duplicate on the exact same day
    const existingAttendance = await Attendance.findOne({
      employeeId,
      attendanceDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: `Attendance for ${employeeName} on this date already exists`,
      });
    }

    const attendance = await Attendance.create({
      employeeId,
      employeeName,
      department,
      shift,
      attendanceDate: startOfDay,
      status,
      checkInTime,
      checkOutTime,
      overtimeHours: overtimeHours || 0,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    console.error("Error in createAttendance:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate attendance record found" });
    }
    res.status(500).json({ success: false, message: "Server error creating attendance" });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ _id: req.params.id, isDeleted: false });

    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    // Prevent date changing to create duplicates
    if (req.body.attendanceDate && new Date(req.body.attendanceDate).toDateString() !== attendance.attendanceDate.toDateString()) {
      const targetDate = new Date(req.body.attendanceDate);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      const duplicate = await Attendance.findOne({
        employeeId: attendance.employeeId,
        _id: { $ne: attendance._id },
        attendanceDate: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: false,
      });

      if (duplicate) {
        return res.status(400).json({ success: false, message: "An attendance record already exists for this new date" });
      }
      req.body.attendanceDate = startOfDay;
    }

    req.body.updatedBy = req.user._id;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate("createdBy", "name")
    .populate("updatedBy", "name");

    res.status(200).json({ success: true, data: updatedAttendance });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate attendance record found" });
    }
    res.status(500).json({ success: false, message: "Server error updating attendance" });
  }
};

// @desc    Soft delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ _id: req.params.id, isDeleted: false });

    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    attendance.isDeleted = true;
    attendance.updatedBy = req.user._id;
    await attendance.save();

    res.status(200).json({ success: true, message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAttendance:", error);
    res.status(500).json({ success: false, message: "Server error deleting attendance" });
  }
};
