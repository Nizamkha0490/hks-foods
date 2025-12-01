import express from "express";
import {
    getCreditNotesByClient,
    createCreditNote,
    updateCreditNoteStatus,
    updateCreditNote,
    deleteCreditNote,
} from "../controllers/creditNoteController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/client/:clientId", protect, getCreditNotesByClient);
router.post("/", protect, createCreditNote);
router.put("/:id/status", protect, updateCreditNoteStatus);
router.put("/:id", protect, updateCreditNote);
router.delete("/:id", protect, deleteCreditNote);

export default router;
