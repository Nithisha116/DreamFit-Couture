import mongoose from "mongoose";

const outsourcingSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      default: 0,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    givenDate: {
      type: Date,
      required: [true, "Given date is required"],
    },
    expectedDate: {
      type: Date,
      required: [true, "Expected date is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Given", "In Progress", "Completed", "Pending"],
      default: "Given",
    },
    referenceImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
outsourcingSchema.index({ status: 1 });
outsourcingSchema.index({ employeeName: 1 });
outsourcingSchema.index({ orderNumber: 1 });
outsourcingSchema.index({ productName: "text", employeeName: "text" });

const Outsourcing = mongoose.model("Outsourcing", outsourcingSchema);

export default Outsourcing;
