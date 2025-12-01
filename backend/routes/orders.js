// import express from "express";
// import {
//   createOrder,
//   getOrders,
//   getOrder,
//   updateOrder,
//   updateOrderStatus,
//   deleteOrder,
//   exportOrderReceipt,
// } from "../controllers/orderController.js";


// const router = express.Router();

// // SIMPLE AUTH MIDDLEWARE (or remove auth from frontend)
// const simpleAuth = (req, res, next) => {
//   // Just allow all requests for now, or add proper token verification
//   console.log('API called:', req.method, req.path);
//   next();
// };

// router.use(simpleAuth);

// // Routes
// router.post("/", createOrder);
// router.get("/", getOrders);
// router.get("/:id", getOrder);
// router.put("/:id", updateOrder);
// router.patch("/:id/status", updateOrderStatus);
// router.delete("/:id", deleteOrder);
// router.get("/:id/export", exportOrderReceipt);

// export default router;













import express from "express"
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  exportOrderReceipt,
  getOrdersByClient,
  getCreditNotesByClient,
} from "../controllers/orderController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()  // ✅ define router first

// ✅ Apply authentication middleware to all order routes
router.use(verifyToken)

// SIMPLE AUTH MIDDLEWARE (optional, for debugging)
const simpleAuth = (req, res, next) => {
  console.log("API called:", req.method, req.path)
  next()
}
router.use(simpleAuth)

// ✅ Routes
router.post("/", createOrder)
router.get("/", getOrders)
router.get("/client/:clientId", getOrdersByClient)
router.get("/client/:clientId/credit-notes", getCreditNotesByClient)
router.get("/:id", getOrder)
router.put("/:id", updateOrder)
router.patch("/:id/status", updateOrderStatus)
router.delete("/:id", deleteOrder)
router.get("/:id/export", exportOrderReceipt)

export default router
