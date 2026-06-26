import Order from "../models/Order.js";
import AuditLog from "../models/AuditLog.js";

export async function assertOrderNotLocked(orderId) {
  const order = await Order.findById(orderId).select("pricingLocked lockReason");
  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }
  if (order.pricingLocked) {
    const err = new Error(`Order is locked (${order.lockReason || "FINAL_BILL_GENERATED"}). Cancel the Final Bill to edit.`);
    err.statusCode = 409;
    err.isLockedError = true;
    throw err;
  }
}

export async function unlockOrder(orderId, userId, session) {
  await Order.findByIdAndUpdate(orderId, {
    pricingLocked: false,
    lockedAt: null,
    lockedBy: null,
    lockReason: null
  }, { session });

  await AuditLog.create([{
    action: "ORDER_UNLOCKED",
    user: userId,
    entityType: "Order",
    entityId: orderId,
    description: "Order unlocked after invoice cancellation."
  }], { session });
}
