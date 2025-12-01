import mongoose from "mongoose";
import Order from "../models/Order.js";
import Counter from "../models/Counter.js";

// ⚙️ Replace with your MongoDB connection string
const MONGO_URI = "mongodb+srv://nizamkhan123nkkn_db_user:nNrC0ksT3uFDQ5ce@HKS.kxxsztn.mongodb.net/hks_foods";

async function syncOrderCounter() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find the highest existing order number
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });

    let nextSeq = 0;
    if (lastOrder && lastOrder.orderNo) {
      const match = lastOrder.orderNo.match(/\d+/);
      if (match) nextSeq = parseInt(match[0], 10);
    }

    // Update or create counter - using 'name' field instead of 'key'
    const counter = await Counter.findOneAndUpdate(
      { name: "orderNo", userId: lastOrder?.userId },  // Changed from 'key' to 'name'
      { seq: nextSeq },
      { upsert: true, new: true }
    );

    console.log(`✅ Counter synced. Next order number will start from: ORD${String(counter.seq + 1).padStart(4, "0")}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error syncing counter:", err);
    process.exit(1);
  }
}

syncOrderCounter();