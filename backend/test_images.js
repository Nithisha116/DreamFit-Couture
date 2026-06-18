import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Garment from "./models/Garment.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const gs = await Garment.find({ 'referenceImages.0': { $exists: true } }).limit(2);
  
  gs.forEach(g => {
    console.log('Garment ID:', g._id, '| ReferenceImages:', JSON.stringify(g.referenceImages, null, 2));
  });

  process.exit(0);
}

run().catch(console.error);
