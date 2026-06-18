import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Order from "./models/Order.js";
import Garment from "./models/Garment.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const order = await Order.findOne({}).sort({ updatedAt: -1 })
    .populate('customer', 'name phone customerId')
    .populate("garments");

  if (!order || !order.garments || order.garments.length === 0) {
    console.log("No garments found");
    process.exit(0);
  }

  const g = order.garments[0];
  console.log("Garment Name:", g.name);
  console.log("Reference Images:", JSON.stringify(g.referenceImages, null, 2));

  process.exit(0);
}

run().catch(console.error);
