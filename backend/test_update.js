import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Garment from "./models/Garment.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // Create a dummy garment
  const garment = new Garment({
    order: new mongoose.Types.ObjectId(),
    name: "Test Garment",
    category: new mongoose.Types.ObjectId(),
    item: new mongoose.Types.ObjectId()
  });

  // Simulate update behavior
  garment.referenceImages = []; // Clear
  
  // Push new image
  garment.referenceImages.push({ url: "test-url", key: "test-key" });
  
  await garment.save();
  
  const saved = await Garment.findById(garment._id);
  console.log("Saved length:", saved.referenceImages.length);

  // Clean up
  await Garment.deleteOne({ _id: garment._id });
  process.exit(0);
}

run().catch(console.error);
