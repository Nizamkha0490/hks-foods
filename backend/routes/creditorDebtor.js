import express from "express"
import {
  getAllCreditorDebtors,
  createCreditorDebtor,
  getCreditorDebtorStatement,
} from "../controllers/creditorDebtorController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.use(verifyToken)

router.get("/", getAllCreditorDebtors)
router.post("/", createCreditorDebtor)
router.get("/statement", getCreditorDebtorStatement)

export default router
