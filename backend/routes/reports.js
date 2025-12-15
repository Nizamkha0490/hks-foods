import express from "express"
import {
  getSalesReport,
  getInventoryReport,
  getFinancialReport,
  getClientReport,
  getSupplierReport,
  getDashboardSummary,
  getDailyReport,
  getMonthlyReport,
  getYearlyReport,
  getStockReport,
  getProductReport,
  getProductSaleReport,
  getSalesStats,
  getTopProducts,
  getSalesOverview,
  getProfitStats,
  getProfitReport,
} from "../controllers/reportController.js"
import { createFullBackup, exportBackupAsJSON } from "../controllers/backupController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.use(verifyToken)

router.get("/sales", getSalesReport)
router.get("/inventory", getInventoryReport)
router.get("/financial", getFinancialReport)
router.get("/clients", getClientReport)
router.get("/sales-stats", getSalesStats)
router.get("/top-products", getTopProducts)
router.get("/sales-overview", getSalesOverview)
router.get("/profit-stats", getProfitStats)
router.get("/profit-report", getProfitReport)
router.get("/daily", getDailyReport)
router.get("/monthly", getMonthlyReport)
router.get("/yearly", getYearlyReport)
router.get("/stock", getStockReport)
router.get("/product", getProductReport)
router.get("/product-sale", getProductSaleReport)
router.get("/suppliers", getSupplierReport)
router.get("/dashboard-summary", getDashboardSummary)
router.get("/summary", getDashboardSummary)
router.get("/backup", createFullBackup)
router.get("/backup/export", exportBackupAsJSON)

export default router
