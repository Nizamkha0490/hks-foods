import express from "express"
import {
  getAllLedgerEntries,
  getLedgerStatement,
} from "../controllers/ledgerController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.use(verifyToken)

router.get("/", getAllLedgerEntries)
router.get("/statement", getLedgerStatement)

export default router
