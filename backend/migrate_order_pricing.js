import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Order from "./models/Order.js";
import Garment from "./models/Garment.js";
import Payment from "./models/Payment.js";
import { updateOrderPaymentSummary } from "./controllers/order.controller.js";

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing!");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected ✅");

    const orders = await Order.find({ isActive: true });
    console.log(`Found ${orders.length} active orders to migrate.`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const orderIdentifier = order.orderId || order._id;
      console.log(`[${i + 1}/${orders.length}] Migrating order ${orderIdentifier}...`);
      
      try {
        const result = await updateOrderPaymentSummary(order._id);
        if (result && result.success) {
          console.log(`  ✅ Successfully updated order ${orderIdentifier}. Paid: ₹${result.totalPaid}, Status: ${result.paymentStatus}`);
          successCount++;
        } else {
          console.warn(`  ⚠️ Failed to update order ${orderIdentifier} - no result returned`);
          failCount++;
        }
      } catch (err) {
        console.error(`  ❌ Error updating order ${orderIdentifier}:`, err.message);
        failCount++;
      }
    }

    console.log("\n=================================");
    console.log("Migration Job Finished!");
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed/skipped: ${failCount}`);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

run();
