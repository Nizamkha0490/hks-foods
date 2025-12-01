import express from "express"
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientStats,
  getClientProfile,
  exportClientStatement,
} from "../controllers/clientController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// All routes require authentication
router.use(verifyToken)

// Create client
router.post("/", createClient)

// Get all clients with search and pagination
router.get("/", getAllClients)

// Get client stats
router.get("/stats", getClientStats)

// Get single client by ID
router.get("/:id", getClientById)

// Get client profile
router.get("/:id/profile", getClientProfile)

// Export client statement
router.get("/:id/statement", exportClientStatement)

// Update client
router.put("/:id", updateClient)

// Delete client (soft delete)
router.delete("/:id", deleteClient)

export default router
