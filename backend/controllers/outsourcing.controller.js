import Outsourcing from "../models/Outsourcing.js";

// @desc    Get all outsourcing records with search, filter, pagination
// @route   GET /api/outsourcing
// @access  Private
export const getAllOutsourcing = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      employee,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {};

    // Search by order number or product name
    if (search) {
      const searchNum = Number(search);
      if (!isNaN(searchNum)) {
        query.$or = [
          { orderNumber: searchNum },
          { productName: { $regex: search, $options: "i" } },
          { employeeName: { $regex: search, $options: "i" } },
        ];
      } else {
        query.$or = [
          { productName: { $regex: search, $options: "i" } },
          { employeeName: { $regex: search, $options: "i" } },
        ];
      }
    }

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by employee
    if (employee && employee !== "all") {
      query.employeeName = employee;
    }

    // Count total
    const total = await Outsourcing.countDocuments(query);

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch with pagination
    const outsourcings = await Outsourcing.find(query)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("createdBy", "name");

    // Get unique employees for filter dropdown
    const employees = await Outsourcing.distinct("employeeName");

    res.status(200).json({
      success: true,
      data: outsourcings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      employees,
    });
  } catch (error) {
    console.error("Get All Outsourcing Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch outsourcing records",
    });
  }
};

// @desc    Create a new outsourcing record
// @route   POST /api/outsourcing
// @access  Private
export const createOutsourcing = async (req, res) => {
  try {
    const {
      orderNumber,
      productName,
      employeeName,
      givenDate,
      expectedDate,
      notes,
      status,
      referenceImage,
    } = req.body;

    const outsourcing = new Outsourcing({
      orderNumber: orderNumber || 0,
      productName,
      employeeName,
      givenDate,
      expectedDate,
      notes: notes || "",
      status: status || "Given",
      referenceImage: referenceImage || "",
      createdBy: req.user?._id,
    });

    const created = await outsourcing.save();

    res.status(201).json({
      success: true,
      data: created,
      message: "Outsourcing record created successfully",
    });
  } catch (error) {
    console.error("Create Outsourcing Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create outsourcing record",
    });
  }
};

// @desc    Update an outsourcing record
// @route   PUT /api/outsourcing/:id
// @access  Private
export const updateOutsourcing = async (req, res) => {
  try {
    const outsourcing = await Outsourcing.findById(req.params.id);

    if (!outsourcing) {
      return res.status(404).json({
        success: false,
        message: "Outsourcing record not found",
      });
    }

    // Update allowed fields
    const fieldsToUpdate = [
      "orderNumber",
      "productName",
      "employeeName",
      "givenDate",
      "expectedDate",
      "notes",
      "status",
      "referenceImage",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        outsourcing[field] = req.body[field];
      }
    });

    const updated = await outsourcing.save();

    res.status(200).json({
      success: true,
      data: updated,
      message: "Outsourcing record updated successfully",
    });
  } catch (error) {
    console.error("Update Outsourcing Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update outsourcing record",
    });
  }
};

// @desc    Delete an outsourcing record
// @route   DELETE /api/outsourcing/:id
// @access  Private
export const deleteOutsourcing = async (req, res) => {
  try {
    const outsourcing = await Outsourcing.findById(req.params.id);

    if (!outsourcing) {
      return res.status(404).json({
        success: false,
        message: "Outsourcing record not found",
      });
    }

    await outsourcing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Outsourcing record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Outsourcing Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete outsourcing record",
    });
  }
};
