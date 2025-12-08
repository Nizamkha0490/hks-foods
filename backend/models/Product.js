import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    serialNo: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minStockLevel: {
      type: Number,
      default: 50,
    },
    vat: {
      type: Number,
      default: 0, // Default VAT rate
      min: 0,
      max: 100,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    },
  },
  { timestamps: true },
)


// Remove the compound index creation - we'll handle uniqueness in controller
// productSchema.index({ serialNo: 1, userId: 1 }, { unique: true });

// Method to reduce stock with validation
productSchema.methods.reduceStock = function (quantity) {
  if (this.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${this.stock}, Requested: ${quantity}`);
  }
  this.stock -= quantity;
  return this.save();
};

// Method to restore stock (for order modifications/cancellations)
productSchema.methods.restoreStock = function (quantity) {
  this.stock += quantity;
  return this.save();
};

// Index for search
productSchema.index({ name: "text", serialNo: "text", category: "text" })

// Performance indexes
productSchema.index({ userId: 1, isActive: 1 }); // Fast active products lookup
productSchema.index({ userId: 1, stock: 1 }); // Fast low stock queries
productSchema.index({ supplier: 1, userId: 1 }); // Fast supplier products lookup
productSchema.index({ userId: 1, category: 1 }); // Fast category filtering


export default mongoose.model("Product", productSchema, "products");
