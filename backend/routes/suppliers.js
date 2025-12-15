// backend/routes/suppliers.js
import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  recordGoods,
  getPurchasesForSupplier,
  getSupplierStats,
  getSupplierProfile,
  exportSupplierStatement,
  updatePurchase,
  deletePurchase,
  getSuppliersWithBalances,
  recordInvoice,
  updateInvoice,
} from "../controllers/supplierController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", createSupplier);
router.get("/", getAllSuppliers);
router.get("/with-balances", getSuppliersWithBalances);
router.get("/stats", getSupplierStats);
router.get("/:id", getSupplierById);
router.get("/:id/profile", getSupplierProfile);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

// New endpoints
router.post("/:id/record", recordGoods); // record goods for supplier
router.post("/:id/invoice", recordInvoice); // record invoice for supplier
router.put("/:id/invoice/:purchaseId", updateInvoice); // update invoice for supplier
router.get("/:id/purchases", getPurchasesForSupplier); // get recent purchases
router.get("/:id/statement", exportSupplierStatement); // export statement
router.put("/:id/purchases/:purchaseId", updatePurchase); // update purchase
router.delete("/:id/purchases/:purchaseId", deletePurchase); // delete purchase

export default router;
