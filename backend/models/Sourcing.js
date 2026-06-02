import mongoose from "mongoose";

const sourcingSchema = new mongoose.Schema(
  {
    clientLabel: {
      type: String,
      trim: true,
      default: "",
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sourcingType: {
      type: String,
      enum: ["Fabrics", "Trims", "Accessories", "Embroidery"],
      default: "Fabrics",
      index: true,
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["To Start", "In Progress", "Ordered", "Delivered", "Delayed"],
      default: "To Start",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    supplier: {
      type: String,
      trim: true,
      default: "",
    },
    deliveryDate: {
      type: Date,
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

sourcingSchema.index({ productName: "text", clientLabel: "text", supplier: "text" });

const Sourcing = mongoose.model("Sourcing", sourcingSchema);
export default Sourcing;
