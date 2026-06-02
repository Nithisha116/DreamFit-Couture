import Sourcing from "../models/Sourcing.js";

const allowedUpdates = [
  "clientLabel",
  "productName",
  "sourcingType",
  "quantity",
  "totalAmount",
  "status",
  "priority",
  "supplier",
  "deliveryDate",
];

export const getSourcingRecords = async (req, res) => {
  try {
    const { search = "", status } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { clientLabel: { $regex: search, $options: "i" } },
        { supplier: { $regex: search, $options: "i" } },
      ];
    }

    const records = await Sourcing.find(query).sort({
      deliveryDate: 1,
      createdAt: -1,
    });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sourcing records",
    });
  }
};

export const createSourcingRecord = async (req, res) => {
  try {
    const record = await Sourcing.create({
      ...pickAllowed(req.body),
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      data: record,
      message: "Sourcing record created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create sourcing record",
    });
  }
};

export const updateSourcingRecord = async (req, res) => {
  try {
    const record = await Sourcing.findByIdAndUpdate(
      req.params.id,
      pickAllowed(req.body),
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Sourcing record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Sourcing record updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update sourcing record",
    });
  }
};

export const deleteSourcingRecord = async (req, res) => {
  try {
    const record = await Sourcing.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Sourcing record not found",
      });
    }

    await record.deleteOne();
    res.json({ success: true, message: "Sourcing record deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete sourcing record",
    });
  }
};

function pickAllowed(source = {}) {
  const picked = allowedUpdates.reduce((acc, field) => {
    if (source[field] !== undefined) acc[field] = source[field];
    return acc;
  }, {});

  if (picked.deliveryDate === "") {
    picked.deliveryDate = null;
  }

  return picked;
}
