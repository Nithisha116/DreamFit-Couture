import Invoice from "../models/Invoice.js";

/**
 * Find invoice by ID populated with Order, Customer, and User references
 */
export const findById = async (id, session = null) => {
  return Invoice.findOne({ _id: id, isDeleted: false })
    .populate({
      path: "order",
      populate: { path: "customer" }
    })
    .populate("customer")
    .populate("generatedBy", "name email role")
    .session(session);
};

/**
 * Find invoice by associated Order ID
 */
export const findByOrderId = async (orderId, session = null) => {
  return Invoice.findOne({ order: orderId, isDeleted: false })
    .populate("customer")
    .populate("generatedBy", "name email role")
    .session(session);
};

/**
 * Save new or updated invoice document
 */
export const save = async (invoice, session = null) => {
  return invoice.save({ session });
};

/**
 * Find all invoices matching filters
 */
export const findAll = async (query = {}, session = null) => {
  const mergedQuery = { ...query, isDeleted: false };
  return Invoice.find(mergedQuery)
    .populate("customer")
    .populate("order", "orderId orderDate deliveryDate status")
    .populate("generatedBy", "name email role")
    .sort({ createdAt: -1 })
    .session(session);
};

/**
 * Soft delete an invoice
 */
export const softDelete = async (id, userId, session = null) => {
  return Invoice.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    },
    { new: true, session }
  );
};
