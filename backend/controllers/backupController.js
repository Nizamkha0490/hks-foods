// import Product from "../models/Product.js"
// import Order from "../models/Order.js"
// import Client from "../models/Client.js"
// import Supplier from "../models/Supplier.js"
// import Ledger from "../models/Ledger.js"
// import CreditorDebtor from "../models/CreditorDebtor.js"
// import Expense from "../models/Expense.js"
// import { asyncHandler } from "../middleware/errorHandler.js"

// // Create Full Backup
// export const createFullBackup = asyncHandler(async (req, res) => {
//   const [products, orders, clients, suppliers, ledger, creditorDebtor, expenses] = await Promise.all([
//     Product.find(),
//     Order.find().populate("client").populate("items.product"),
//     Client.find(),
//     Supplier.find(),
//     Ledger.find().populate("entity"),
//     CreditorDebtor.find().populate("entity"),
//     Expense.find(),
//   ])

//   const backup = {
//     timestamp: new Date().toISOString(),
//     data: {
//       products,
//       orders,
//       clients,
//       suppliers,
//       ledger,
//       creditorDebtor,
//       expenses,
//     },
//   }

//   res.status(200).json({
//     success: true,
//     message: "Backup created successfully",
//     backup,
//   })
// })

// // Export Backup as JSON
// export const exportBackupAsJSON = asyncHandler(async (req, res) => {
//   const [products, orders, clients, suppliers, ledger, creditorDebtor, expenses] = await Promise.all([
//     Product.find(),
//     Order.find().populate("client").populate("items.product"),
//     Client.find(),
//     Supplier.find(),
//     Ledger.find().populate("entity"),
//     CreditorDebtor.find().populate("entity"),
//     Expense.find(),
//   ])

//   const backup = {
//     timestamp: new Date().toISOString(),
//     data: {
//       products,
//       orders,
//       clients,
//       suppliers,
//       ledger,
//       creditorDebtor,
//       expenses,
//     },
//   }

//   res.setHeader("Content-Type", "application/json")
//   res.setHeader("Content-Disposition", `attachment; filename="backup-${Date.now()}.json"`)
//   res.send(JSON.stringify(backup, null, 2))
// })








import Product from "../models/Product.js"
import Order from "../models/Order.js"
import Client from "../models/Client.js"
import Supplier from "../models/Supplier.js"
import Ledger from "../models/Ledger.js"
import CreditorDebtor from "../models/CreditorDebtor.js"
import Expense from "../models/Expense.js"
import { asyncHandler } from "../middleware/errorHandler.js"

// Create Full Backup (owner-only)
export const createFullBackup = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const userId = req.admin._id

  const [products, orders, clients, suppliers, ledger, creditorDebtor, expenses] = await Promise.all([
    Product.find({ userId }),
    Order.find({ userId }).populate("clientId").populate("lines.productId"),
    Client.find({ userId }),
    Supplier.find({ userId }),
    Ledger.find({ userId }).populate("entity"),
    CreditorDebtor.find({ userId }).populate("entity"),
    Expense.find({ userId }),
  ])

  const backup = {
    timestamp: new Date().toISOString(),
    data: {
      products,
      orders,
      clients,
      suppliers,
      ledger,
      creditorDebtor,
      expenses,
    },
  }

  res.status(200).json({
    success: true,
    message: "Backup created successfully",
    backup,
  })
})

// Export Backup as JSON (owner-only)
export const exportBackupAsJSON = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const userId = req.admin._id

  const [products, orders, clients, suppliers, ledger, creditorDebtor, expenses] = await Promise.all([
    Product.find({ userId }),
    Order.find({ userId }).populate("clientId").populate("lines.productId"),
    Client.find({ userId }),
    Supplier.find({ userId }),
    Ledger.find({ userId }).populate("entity"),
    CreditorDebtor.find({ userId }).populate("entity"),
    Expense.find({ userId }),
  ])

  const backup = {
    timestamp: new Date().toISOString(),
    data: {
      products,
      orders,
      clients,
      suppliers,
      ledger,
      creditorDebtor,
      expenses,
    },
  }

  res.setHeader("Content-Type", "application/json")
  res.setHeader("Content-Disposition", `attachment; filename="backup-${Date.now()}.json"`)
  res.send(JSON.stringify(backup, null, 2))
})
