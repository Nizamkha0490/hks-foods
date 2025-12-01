import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/products.js"
import clientRoutes from "./routes/clients.js"
import supplierRoutes from "./routes/suppliers.js"
import ledgerRoutes from "./routes/ledger.js"
import creditorDebtorRoutes from "./routes/creditorDebtor.js"
import expenseRoutes from "./routes/expenses.js"
import reportRoutes from "./routes/reports.js"
import settingsRoutes from "./routes/settings.js" // ADD THIS LINE
import paymentRoutes from "./routes/payments.js"
import { errorHandler } from "./middleware/errorHandler.js"
import orderRoutes from "./routes/orders.js"
import adminManagementRoutes from "./routes/adminManagement.js"
import creditNoteRoutes from "./routes/creditNoteRoutes.js"
import { getPublicProducts } from "./controllers/publicController.js"
import { sendContactEmail } from "./controllers/contactController.js"
import { cleanupCounters } from "./controllers/cleanupController.js"
import { protect } from "./middleware/auth.js"

dotenv.config()

// Set timezone to UK Birmingham (Europe/London)
process.env.TZ = 'Europe/London'

const app = express()

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:5173",
      "https://hksfoods.com",
      "https://www.hksfoods.com",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Public Routes (no authentication required)
app.get("/api/public/products", getPublicProducts)
app.post("/api/contact", sendContactEmail)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/ledger", ledgerRoutes)
app.use("/api/creditor-debtor", creditorDebtorRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/settings", settingsRoutes) // ADD THIS LINE
app.use("/api/admin-management", adminManagementRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/credit-notes", creditNoteRoutes)

// Cleanup endpoint (temporary - for fixing counter issues)
app.post("/api/cleanup/counters", protect, cleanupCounters)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use(errorHandler)

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully to HKS Foods database")
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })

export default app
