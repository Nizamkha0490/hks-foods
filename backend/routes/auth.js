import express from "express"
import {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
} from "../controllers/authController.js"
// import { protect } from "../middleware/auth.js"
import { verifyToken } from "../middleware/auth.js"


const router = express.Router()
// Public routes
router.post("/register", registerAdmin)
router.post("/login", loginAdmin)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOTP)
router.post("/reset-password", resetPassword)
router.post("/resend-otp", resendOTP) // ADD THIS LINE

// Protected routes
router.get("/me", verifyToken, getCurrentAdmin)
router.post("/change-password", verifyToken, changePassword)

export default router
