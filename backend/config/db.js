import mongoose from "mongoose";

// Disable strictPopulate globally to prevent StrictPopulateError with legacy schemas
mongoose.set('strictPopulate', false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
