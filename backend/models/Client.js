import mongoose from "mongoose"

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    totalDues: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

clientSchema.index({ name: "text", email: "text" })

// Performance indexes
clientSchema.index({ userId: 1, isActive: 1 }); // Fast active clients lookup
clientSchema.index({ userId: 1, totalDues: -1 }); // Fast sorting by balance
clientSchema.index({ email: 1, userId: 1 }); // Fast email lookup

export default mongoose.model("Client", clientSchema, "clients")