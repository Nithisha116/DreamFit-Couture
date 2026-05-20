import { EventEmitter } from "events";
import AuditLog from "../models/AuditLog.js";
import InventoryMovement from "../models/InventoryMovement.js";

const billingEmitter = new EventEmitter();

// 1. Asynchronous Audit Logger
billingEmitter.on("AUDIT_LOG", async ({ action, user, entityType, entityId, description, previousData, newData }) => {
  try {
    const log = new AuditLog({
      action,
      user,
      entityType,
      entityId,
      description,
      previousData,
      newData
    });
    await log.save();
    console.log(`📝 [Audit Logged Success]: ${action} on ${entityType} ID: ${entityId}`);
  } catch (error) {
    console.error("❌ Failed to record Audit Log event:", error.message);
  }
});

// 2. Asynchronous Inventory Material/Accessory consumption sync
billingEmitter.on("INVENTORY_REDUCE", async ({ items = [], invoiceId, notes }) => {
  try {
    if (!items || items.length === 0) return;
    
    console.log(`📦 [Inventory Sync]: Processing ${items.length} items for Invoice ID: ${invoiceId}`);
    
    for (const item of items) {
      // If the item contains a linked raw material ID or inventory item reference, we deduct it
      if (item.itemId || item.item) {
        const movement = new InventoryMovement({
          item: item.itemId || item.item,
          type: "OUT",
          qty: item.qty || 1,
          source: "INVOICE",
          referenceId: invoiceId,
          notes: notes || `Auto-consumed via Invoice creation`
        });
        await movement.save();
      }
    }
  } catch (error) {
    console.error("❌ Failed to process inventory movement event:", error.message);
  }
});

export default billingEmitter;
