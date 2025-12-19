// import mongoose from "mongoose"

// const expenseSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: true,
//       enum: ["salary", "rent", "utilities", "transportation", "maintenance", "supplies", "other"],
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     paymentMethod: {
//       type: String,
//       enum: ["cash", "bank_transfer", "credit_card", "check"],
//       default: "cash",
//     },
//     reference: {
//       type: String,
//       default: "",
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true },
// )

// expenseSchema.index({ category: 1, createdAt: -1 })

// export default mongoose.model("Expense", expenseSchema)














import mongoose from "mongoose"

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    vat: {
      type: Number,
      enum: [0, 5, 20],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true },
)

expenseSchema.index({ category: 1, createdAt: -1 })

export default mongoose.model("Expense", expenseSchema)
