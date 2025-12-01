import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true },
    paymentNo: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

paymentSchema.pre("validate", async function (next) {
  if (this.isNew) {
    try {
      const Counter = mongoose.model("Counter")
      const counter = await Counter.findOneAndUpdate(
        { name: "paymentNo", userId: this.userId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      )
      this.paymentNo = `PAY${String(counter.seq).padStart(4, "0")}`
    } catch (error) {
      return next(error);
    }
  }
  next()
})

export default mongoose.model("Payment", paymentSchema)