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

export default mongoose.model("Client", clientSchema, "clients")