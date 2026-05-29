import OutsourcingVendor from "../models/OutsourcingVendor.js";

// @desc    Get all active/inactive outsourcing vendors
// @route   GET /api/outsourcing-vendors
export const getAllVendors = async (req, res) => {
  try {
    const { status, specialization, search } = req.query;
    
    let query = {};
    if (status && status !== "all") query.status = status;
    if (specialization && specialization !== "all") query.workSpecialization = specialization;
    if (search) {
      query.vendorName = { $regex: search, $options: "i" };
    }

    const vendors = await OutsourcingVendor.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Get All Vendors Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
    });
  }
};

// @desc    Create a new vendor
// @route   POST /api/outsourcing-vendors
export const createVendor = async (req, res) => {
  try {
    const { vendorName, mobileNumber, email, workSpecialization, address, status } = req.body;

    const vendor = await OutsourcingVendor.create({
      vendorName,
      mobileNumber,
      email,
      workSpecialization,
      address,
      status: status || "Active",
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Create Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create vendor",
    });
  }
};

// @desc    Update a vendor
// @route   PUT /api/outsourcing-vendors/:id
export const updateVendor = async (req, res) => {
  try {
    const vendor = await OutsourcingVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const updatedVendor = await OutsourcingVendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Update Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update vendor",
    });
  }
};

// @desc    Delete a vendor
// @route   DELETE /api/outsourcing-vendors/:id
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await OutsourcingVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete vendor",
    });
  }
};
