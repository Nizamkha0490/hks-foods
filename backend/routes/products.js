import express from "express"
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  updateStock,
} from "../controllers/productController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.use(verifyToken)

router.post("/", createProduct)
router.get("/", getAllProducts)
router.get("/low-stock", getLowStockProducts)
router.get("/:id", getProductById)
router.put("/:id", updateProduct)
router.delete("/:id", deleteProduct)
router.patch("/:id/stock", updateStock)

export default router
