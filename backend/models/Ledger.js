// import mongoose from "mongoose"

// const ledgerSchema = new mongoose.Schema(
//   {
//     transactionType: {
//       type: String,
//       enum: ["client", "supplier"],
//       required: true,
//     },
//     entity: {
//       type: mongoose.Schema.Types.ObjectId,
//       refPath: "entityModel",
//       required: true,
//     },
//     entityModel: {
//       type: String,
//       enum: ["Client", "Supplier"],
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     debit: {
//       type: Number,
//       default: 0,
//     },
//     credit: {
//       type: Number,
//       default: 0,
//     },
//     balance: {
//       type: Number,
//       default: 0,
//     },
//     reference: {
//       type: String,
//       default: "",
//     },
//     referenceId: {
//       type: mongoose.Schema.Types.ObjectId,
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//   },
//   { timestamps: true },
// )

// ledgerSchema.index({ transactionType: 1, entity: 1, createdAt: -1 })

// export default mongoose.model("Ledger", ledgerSchema)











import mongoose from "mongoose"

const ledgerSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ["client", "supplier"],
      required: true,
    },
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityModel",
      required: true,
    },
    entityModel: {
      type: String,
      enum: ["Client", "Supplier"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    reference: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "",
    },
    phoneNo: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    postalCode: {
      type: String,
      default: "",
    },
    entryDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true },
)

ledgerSchema.index({ transactionType: 1, entity: 1, createdAt: -1 })

export default mongoose.model("Ledger", ledgerSchema)
