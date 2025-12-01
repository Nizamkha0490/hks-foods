import express from "express"
import {
  createPayment, getPaymentsByClient, deletePayment, getAllPayments,
  updatePayment,
  exportPaymentStatement,
} from "../controllers/paymentController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// All routes require authentication
router.use(verifyToken)

// Create payment
router.post("/", createPayment)

// Update payment
router.put("/:id", updatePayment)

// Get all payments for a client
router.get("/client/:clientId", getPaymentsByClient)
router.get("/export", exportPaymentStatement)
router.get("/", getAllPayments)

router.get("/supplier/:supplierId", async (req, res) => {
  try {
    const Payment = (await import("../models/Payment.js")).default
    const payments = await Payment.find({
      supplierId: req.params.supplierId,
      userId: req.admin._id,
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      payments,
    })
  } catch (error) {
    console.error("Error fetching supplier payments:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
    })
  }
})

// Delete payment
router.delete("/:id", deletePayment)

export default router
