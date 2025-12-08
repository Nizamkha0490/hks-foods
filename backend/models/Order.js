// Remove the Counter import
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Auto-incremented order number
    orderNo: { type: String, required: true, unique: true },

    // Client reference and static name snapshot
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    clientName: { type: String }, // ✅ Save client name at order creation

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    // Line items
    lines: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String }, // ✅ Save product name snapshot
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "in_progress", "dispatched", "delivered", "cancelled"],
      default: "pending",
    },

    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "Bank Transfer" },
    invoiceType: {
      type: String,
      enum: ["on_account", "cash", "picking_list", "proforma", "invoice"],
      default: "invoice",
    },
    deliveryCost: { type: Number, default: 0 },
    includeVAT: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    // ✅ Prevent duplicate submissions
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// ✅ Simple timestamp-based order number generation
orderSchema.pre("validate", async function (next) {
  if (!this.orderNo) {
    try {
      // Generate random 5-digit number between 10000 and 99999
      const randomNum = Math.floor(Math.random() * 90000) + 10000;
      this.orderNo = `INV-${randomNum}`;
      this.invoiceNo = this.orderNo;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// ✅ Before saving, auto-fill clientName and productName if missing
orderSchema.pre("save", async function (next) {
  try {
    if (this.isModified("clientId") && !this.clientName) {
      const Client = mongoose.model("Client");
      const client = await Client.findById(this.clientId).select("name");
      if (client) this.clientName = client.name;
    }

    if (this.isModified("lines")) {
      const Product = mongoose.model("Product");
      for (const line of this.lines) {
        if (line.productId && !line.productName) {
          const product = await Product.findById(line.productId).select("name");
          if (product) line.productName = product.name;
        }
      }
    }


    next();
  } catch (err) {
    next(err);
  }
});

// Performance indexes for faster queries
orderSchema.index({ userId: 1, createdAt: -1 }); // Fast order listing (newest first)
orderSchema.index({ clientId: 1, status: 1 }); // Fast client orders lookup
orderSchema.index({ orderNo: 1, userId: 1 }); // Fast order number lookup
orderSchema.index({ status: 1, userId: 1 }); // Fast status filtering
orderSchema.index({ userId: 1, invoiceType: 1 }); // Fast invoice type filtering

export default mongoose.model("Order", orderSchema);