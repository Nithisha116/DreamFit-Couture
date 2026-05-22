import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: [
        "cutting_master",
        "tailor",
        "helper",
        "embroidery",
        "aari",
        "ironing",
        "packing",
        "finishing",
        "qc",
        "delivery",
        "store_keeper",
        "admin"
      ],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
      index: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    assignedTasks: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workerSchema.index({ role: 1, status: 1 });
workerSchema.index({ name: "text" });

const Worker = mongoose.model("Worker", workerSchema);
export default Worker;
