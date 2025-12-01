import jwt from "jsonwebtoken"
import Admin from "../models/Admin.js"

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Check if admin still exists
      const admin = await Admin.findById(decoded.id).select("-password")
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin account no longer exists"
        })
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: "Admin account is deactivated"
        })
      }

      req.admin = admin
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Token has expired"
        })
      }
      
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: "Authentication error"
    })
  }
}

export const verifyToken = protect
