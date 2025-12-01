import Admin from "../models/Admin.js"
import { asyncHandler } from "../middleware/errorHandler.js"

// Get all admins (only super_admin can access)
export const getAllAdmins = asyncHandler(async (req, res) => {
  // Check if current admin is super_admin
  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin role required.",
    })
  }

  const admins = await Admin.find().select("-password")
  
  res.status(200).json({
    success: true,
    count: admins.length,
    admins,
  })
})

// Get admin by ID
export const getAdminById = asyncHandler(async (req, res) => {
  if (req.admin.role !== "super_admin" && req.admin._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    })
  }

  const admin = await Admin.findById(req.params.id).select("-password")
  
  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    })
  }

  res.status(200).json({
    success: true,
    admin,
  })
})

// Create new admin (only super_admin can create)
export const createAdmin = asyncHandler(async (req, res) => {
  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin role required.",
    })
  }

  const { username, email, password, role = "admin" } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username, email, and password",
    })
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { username }],
  })

  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: "Admin with this email or username already exists",
    })
  }

  const admin = await Admin.create({
    username,
    email,
    password,
    role,
  })

  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    },
  })
})

// Update admin
export const updateAdmin = asyncHandler(async (req, res) => {
  if (req.admin.role !== "super_admin" && req.admin._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    })
  }

  const { username, email } = req.body
  const updateData = {}

  if (username) updateData.username = username
  if (email) updateData.email = email

  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select("-password")

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    })
  }

  res.status(200).json({
    success: true,
    message: "Admin updated successfully",
    admin,
  })
})

// Deactivate admin (only super_admin can deactivate)
export const deactivateAdmin = asyncHandler(async (req, res) => {
  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin role required.",
    })
  }

  // Prevent deactivating yourself
  if (req.admin._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: "Cannot deactivate your own account",
    })
  }

  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select("-password")

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    })
  }

  res.status(200).json({
    success: true,
    message: "Admin deactivated successfully",
    admin,
  })
})

// Change admin role (only super_admin can change roles)
export const changeAdminRole = asyncHandler(async (req, res) => {
  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin role required.",
    })
  }

  const { role } = req.body

  if (!["admin", "super_admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Must be 'admin' or 'super_admin'",
    })
  }

  // Prevent changing your own role
  if (req.admin._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: "Cannot change your own role",
    })
  }

  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select("-password")

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    })
  }

  res.status(200).json({
    success: true,
    message: "Admin role updated successfully",
    admin,
  })
})

// Delete admin (only super_admin can delete)
export const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin role required.",
    })
  }

  // Prevent deleting yourself
  if (req.admin._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete your own account",
    })
  }

  const admin = await Admin.findByIdAndDelete(req.params.id)

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    })
  }

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
  })
})
