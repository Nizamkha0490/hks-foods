// import mongoose from "mongoose";

// const creditorDebtorSchema = new mongoose.Schema(
//   {
//     type: {
//       type: String,
//       enum: ["creditor", "debtor"],
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
//     amount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     remainingBalance: {
//       type: Number,
//       default: null, // can be manually provided
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     dueDate: {
//       type: Date,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "partial", "paid"],
//       default: "pending",
//     },
//     paidAmount: {
//       type: Number,
//       default: 0,
//     },
//     reference: {
//       type: String,
//       default: "",
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },

//   },
//   { timestamps: true }
// );

// creditorDebtorSchema.index({ type: 1, entity: 1, status: 1 });

// export default mongoose.model("CreditorDebtor", creditorDebtorSchema);














import mongoose from "mongoose";

const creditorDebtorSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["creditor", "debtor"],
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      default: null, // can be manually provided
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    reference: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    // ADD PAYMENT METHOD FIELD
    paymentMethod: {
      type: String,
      default: "", // will store "bank", "card", "cash", or custom value
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

creditorDebtorSchema.index({ type: 1, entity: 1, status: 1 });

export default mongoose.model("CreditorDebtor", creditorDebtorSchema);
