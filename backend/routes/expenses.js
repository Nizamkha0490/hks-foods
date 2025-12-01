import express from "express"
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../controllers/expenseController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.use(verifyToken)

router.post("/", createExpense)
router.get("/", getAllExpenses)
router.get("/summary", getExpenseSummary)
router.get("/:id", getExpenseById)
router.put("/:id", updateExpense)
router.delete("/:id", deleteExpense)

export default router
