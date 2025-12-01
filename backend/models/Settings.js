import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    warehouseName: {
      type: String,
      default: "Khyber Foods Main Warehouse",
    },
    address: {
      type: String,
      default: "123 Industrial Park, London, UK",
    },
    postalCode: {
      type: String,
      default: "SW1A 1AA",
    },
    city: {
      type: String,
      default: "London",
    },
    vatNumber: {
      type: String,
      default: "",
    },
    companyNumber: {
      type: String,
      default: "",
    },
    contactNumber: {
      type: String,
      default: "+44 20 1234 5678",
    },
    email: {
      type: String,
      default: "info@khyberfoods.com",
    },
    currency: {
      type: String,
      default: "GBP",
    },
    taxRate: {
      type: Number,
      default: 20,
    },
    businessRegistration: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true },
)

export default mongoose.model("Settings", settingsSchema)
