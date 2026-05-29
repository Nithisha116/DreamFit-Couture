import mongoose from "mongoose";

const outsourcingVendorSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    workSpecialization: {
      type: String,
      enum: ["Stitching", "Embroidery", "Alteration", "Finishing", "Other"],
      required: [true, "Work specialization is required"],
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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

outsourcingVendorSchema.index({ vendorName: 1 });
outsourcingVendorSchema.index({ workSpecialization: 1 });
outsourcingVendorSchema.index({ status: 1 });

const OutsourcingVendor = mongoose.model("OutsourcingVendor", outsourcingVendorSchema);

export default OutsourcingVendor;
