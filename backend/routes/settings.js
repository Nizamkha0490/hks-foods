// import express from "express"
// import { getSettings, updateSettings, changePassword, createBackup } from "../controllers/settingsController.js"
// import { protect } from "../middleware/auth.js"

// const router = express.Router()

// // All settings routes require authentication
// router.use(protect)

// router.get("/", getSettings)
// router.put("/", updateSettings)
// router.post("/change-password", changePassword)
// router.get("/backup", createBackup)

// export default router














import express from "express"
import { getSettings, updateSettings, changePassword, createBackup } from "../controllers/settingsController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// All settings routes require authentication
router.use(verifyToken)

router.get("/", getSettings)
router.put("/", updateSettings)
router.post("/change-password", changePassword)
router.get("/backup", createBackup)

export default router
