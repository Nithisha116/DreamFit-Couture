import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema({
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Item", 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ["IN", "OUT"], 
    required: true,
    index: true 
  },
  qty: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  source: { 
    type: String, 
    enum: ["INVOICE", "MANUAL", "PURCHASE"], 
    required: true,
    index: true 
  },
  referenceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true 
  },
  notes: { 
    type: String, 
    trim: true 
  }
}, { 
  timestamps: true 
});

inventoryMovementSchema.index({ item: 1, createdAt: -1 });

const InventoryMovement = mongoose.model("InventoryMovement", inventoryMovementSchema);
export default InventoryMovement;
