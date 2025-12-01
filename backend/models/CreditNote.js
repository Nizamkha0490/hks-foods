import mongoose from "mongoose";

const creditNoteSchema = new mongoose.Schema(
  {
    creditNoteNo: { type: String, required: true, unique: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    clientName: { type: String },
    type: {
      type: String,
      enum: ["cancellation", "return"],
      required: true,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Optional, linked if from cancellation
    orderNo: { type: String }, // Snapshot of order number
    
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        reason: { type: String }, // e.g., "Damaged", "Wrong Item", "Order Cancelled"
      },
    ],

    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "refunded", "adjusted"],
      default: "pending",
    },
    
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate Credit Note Number
creditNoteSchema.pre("validate", async function (next) {
  if (!this.creditNoteNo) {
    try {
      const randomNum = Math.floor(Math.random() * 90000) + 10000;
      this.creditNoteNo = `CN-${randomNum}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model("CreditNote", creditNoteSchema);
