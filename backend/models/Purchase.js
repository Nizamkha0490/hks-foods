import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    purchaseOrderNo: {
      type: String,
      required: true,
    },
    invoiceNo: {
      type: String,
    },
    dateReceived: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productName: {
          type: String,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    notes: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    vatRate: {
      type: Number,
      default: 0,
    },
    vatAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
