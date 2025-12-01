import express from "express"
import { protect } from "../middleware/auth.js"
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deactivateAdmin,
  deleteAdmin,
  changeAdminRole
} from "../controllers/adminManagementController.js"

const router = express.Router()

// All admin management routes require authentication
router.use(protect)

// Only super_admin can manage other admins
router.get("/", getAllAdmins)
router.get("/:id", getAdminById)
router.post("/", createAdmin)
router.put("/:id", updateAdmin)
router.patch("/:id/deactivate", deactivateAdmin)
router.patch("/:id/role", changeAdminRole)
router.delete("/:id", deleteAdmin)

export default router
