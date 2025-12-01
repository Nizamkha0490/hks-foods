import mongoose from "mongoose"

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  seq: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

counterSchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.model("Counter", counterSchema);