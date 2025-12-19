import Ledger from "../models/Ledger.js"
import Client from "../models/Client.js"
import Supplier from "../models/Supplier.js"
import Order from "../models/Order.js"
import Purchase from "../models/Purchase.js"
import Payment from "../models/Payment.js"
import Settings from "../models/Settings.js"
import PDFDocument from "pdfkit"
import { asyncHandler } from "../middleware/errorHandler.js"

// Create Ledger Entry
export const createLedgerEntry = asyncHandler(async (req, res) => {
  const {
    transactionType,
    entity,
    description,
    amount,
    reference,
    paymentMethod,
    phoneNo,
    notes,
    postalCode,
    entryDate,
  } = req.body

  console.log("Creating ledger entry:", req.body)

  if (!transactionType || !entity || !description || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: transactionType, entity, description, amount",
    })
  }

  // Validate entity exists
  const entityModel = transactionType === "client" ? Client : Supplier
  const entityExists = await entityModel.findById(entity)
  if (!entityExists) {
    return res.status(404).json({
      success: false,
      message: `${transactionType} not found`,
    })
  }

  // Calculate balance
  const lastEntry = await Ledger.findOne({
    transactionType,
    entity,
  }).sort({ createdAt: -1 })

  const previousBalance = lastEntry ? lastEntry.balance : 0
  const newBalance = previousBalance + Number(amount)

  const ledgerEntry = await Ledger.create({
    transactionType,
    entity,
    entityModel: transactionType === "client" ? "Client" : "Supplier",
    description,
    amount: Number(amount),
    balance: newBalance,
    reference: reference || "",
    paymentMethod: paymentMethod || "",
    phoneNo: phoneNo || "",
    notes: notes || "",
    postalCode: postalCode || "",
    entryDate: entryDate ? new Date(entryDate) : new Date(),
    userId: req.admin._id,
  })

  // Populate the entity name for response
  await ledgerEntry.populate("entity", "name email phone address postalCode")

  res.status(201).json({
    success: true,
    message: "Ledger entry created successfully",
    ledgerEntry,
  })
})

// Get All Ledger Entries with Filters
export const getAllLedgerEntries = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { type } = req.query
  const userId = req.admin._id

  let orders = []
  let purchases = []
  let payments = []

  // Fetch Orders (Client Debits)
  if (!type || type === "all" || type === "client") {
    orders = await Order.find({ userId }).populate("clientId", "name")
  }

  // Fetch Purchases (Supplier Credits)
  if (!type || type === "all" || type === "supplier") {
    purchases = await Purchase.find({ userId }).populate("supplierId", "name")
  }

  // Fetch Payments (Client Credits / Supplier Debits)
  const paymentQuery = { userId }
  if (type === "client") paymentQuery.clientId = { $exists: true }
  if (type === "supplier") paymentQuery.supplierId = { $exists: true }

  payments = await Payment.find(paymentQuery)
    .populate("clientId", "name")
    .populate("supplierId", "name")

  // Map Orders to Ledger Entries
  const clientOrderEntries = orders.map((order) => ({
    _id: order._id,
    date: order.createdAt,
    description: `Order #${order.orderNo}`,
    entity: order.clientId?.name || "Unknown Client",
    type: "Client",
    transactionType: "Debit", // Increases balance (Owed to us)
    amount: order.total,
    reference: order.orderNo
  }))

  // Map Purchases to Ledger Entries
  const supplierPurchaseEntries = purchases.map((purchase) => ({
    _id: purchase._id,
    date: purchase.createdAt,
    description: `Purchase #${purchase.invoiceNo || purchase.purchaseOrderNo}`,
    entity: purchase.supplierId?.name || "Unknown Supplier",
    type: "Supplier",
    transactionType: "Credit", // Increases balance (Owed by us)
    amount: purchase.totalAmount,
    reference: purchase.invoiceNo || purchase.purchaseOrderNo
  }))

  // Map Payments to Ledger Entries
  const paymentEntries = payments.map((payment) => {
    const isClientPayment = !!payment.clientId
    return {
      _id: payment._id,
      date: payment.createdAt,
      description: `Payment (${payment.paymentMethod})`,
      entity: isClientPayment ? (payment.clientId?.name || "Unknown Client") : (payment.supplierId?.name || "Unknown Supplier"),
      type: isClientPayment ? "Client" : "Supplier",
      transactionType: isClientPayment ? "Credit" : "Debit", // Client Payment = Credit (Reduces balance), Supplier Payment = Debit (Reduces balance)
      amount: payment.amount,
      reference: payment.paymentNo || "-"
    }
  })

  // Combine and Sort based on type filter
  let ledgerEntries = []

  if (type === "client") {
    // Client ledger: only client orders and client payments
    const clientPayments = paymentEntries.filter(p => p.type === "Client")
    ledgerEntries = [...clientOrderEntries, ...clientPayments]
  } else if (type === "supplier") {
    // Supplier ledger: only supplier purchases and supplier payments
    const supplierPayments = paymentEntries.filter(p => p.type === "Supplier")
    ledgerEntries = [...supplierPurchaseEntries, ...supplierPayments]
  } else {
    // All: combine everything
    ledgerEntries = [...clientOrderEntries, ...supplierPurchaseEntries, ...paymentEntries]
  }

  ledgerEntries = ledgerEntries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  res.status(200).json({
    success: true,
    ledgerEntries,
  })
})

// Generate Ledger Statement
export const getLedgerStatement = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const { from, to, type } = req.query
    const userId = req.admin._id
    const query = { userId }

    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59))
      }
    }

    // Fetch Settings
    const settings = await Settings.findOne({ userId })

    // Helper to fetch data
    const fetchData = async (targetType) => {
      let orders = []
      let purchases = []
      let payments = []

      if (targetType === "client") {
        orders = await Order.find(query).populate("clientId", "name")
        const paymentQuery = { ...query, clientId: { $exists: true, $ne: null } }
        payments = await Payment.find(paymentQuery).populate("clientId", "name")
      } else if (targetType === "supplier") {
        purchases = await Purchase.find(query).populate("supplierId", "name")
        const paymentQuery = { ...query, supplierId: { $exists: true, $ne: null } }
        payments = await Payment.find(paymentQuery).populate("supplierId", "name")
      }

      const entries = [
        ...orders.map((o) => ({
          date: o.createdAt,
          description: `Order #${o.orderNo}`,
          entity: o.clientId?.name || "Unknown Client",
          type: "Debit",
          amount: o.total,
          reference: o.orderNo
        })),
        ...purchases.map((p) => ({
          date: p.createdAt,
          description: `Purchase #${p.invoiceNo || p.purchaseOrderNo}`,
          entity: p.supplierId?.name || "Unknown Supplier",
          type: "Debit", // Purchases increase what we owe (Debit)
          amount: p.totalAmount,
          reference: p.invoiceNo || p.purchaseOrderNo
        })),
        ...payments.map((p) => ({
          date: p.createdAt,
          description: `Payment (${p.paymentMethod})`,
          entity: p.clientId ? p.clientId.name : p.supplierId?.name,
          type: "Credit", // Payments are always credits (reducing balance owed)
          amount: p.amount,
          reference: p.paymentNo || "-"
        }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date))

      return entries
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" })
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=ledger-statement.pdf`)
    doc.pipe(res)

    // Helper to draw header
    const drawHeader = (title) => {
      // Company Info
      doc
        .fillColor("#1e3a8a")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(settings?.warehouseName || "HKS FOODS LTD", { align: "center" })

      doc
        .fillColor("#666666")
        .fontSize(9)
        .font("Helvetica")
        .text(settings?.address || "104 ANTHONY ROAD", { align: "center" })
        .text(settings?.postalCode || "BIRMINGHAM B83AA", { align: "center" })
        .text(
          `${settings?.contactNumber || "Tel:+44 7477 956299"} | VAT: ${settings?.vatNumber || "495814839"}`,
          { align: "center" },
        )

      doc.moveDown(0.5)
      doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.5)

      doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text(title, { align: "center" })

      if (from && to) {
        doc.fontSize(10).font("Helvetica").text(`Period: ${new Date(from).toLocaleDateString("en-GB")} - ${new Date(to).toLocaleDateString("en-GB")}`, { align: "center" })
      }
      doc.moveDown(1)
    }

    // Helper to calculate totals
    const calculateTotals = (entries) => {
      let totalDebit = 0
      let totalCredit = 0

      entries.forEach((entry) => {
        if (entry.type === "Debit") totalDebit += entry.amount
        if (entry.type === "Credit") totalCredit += entry.amount
      })

      return { totalDebit, totalCredit, netBalance: totalDebit - totalCredit }
    }

    // Helper to draw totals summary (before table)
    const drawTotalsSummary = (totals) => {
      const startY = doc.y
      doc.fillColor("#f0f9ff").rect(40, startY, 515, 60).fill()
      doc.strokeColor("#1e3a8a").lineWidth(1).rect(40, startY, 515, 60).stroke()

      let y = startY + 10
      doc.fillColor("#000000").fontSize(10).font("Helvetica-Bold")

      // Total Debit
      doc.text("Total Debit:", 50, y)
      doc.text(`£${totals.totalDebit.toFixed(2)}`, 480, y, { align: "right", width: 65 })

      y += 20
      // Total Credit
      doc.text("Total Credit:", 50, y)
      doc.text(`£${totals.totalCredit.toFixed(2)}`, 480, y, { align: "right", width: 65 })

      y += 20
      // Net Balance
      doc.fontSize(11).text("Net Balance:", 50, y)
      doc.text(`£${totals.netBalance.toFixed(2)}`, 480, y, { align: "right", width: 65 })

      doc.moveDown(2)
    }

    // Helper to draw table
    const drawTable = (entries) => {
      const tableTop = doc.y
      doc.fillColor("#1e3a8a").rect(40, tableTop, 515, 20).fill()
      doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")

      const dateX = 45
      const descX = 110
      const entityX = 230
      const refX = 330
      const typeX = 410
      const amountX = 480

      doc.text("DATE", dateX, tableTop + 7)
      doc.text("DESCRIPTION", descX, tableTop + 7)
      doc.text("ENTITY", entityX, tableTop + 7)
      doc.text("REFERENCE", refX, tableTop + 7)
      doc.text("TYPE", typeX, tableTop + 7)
      doc.text("AMOUNT", amountX, tableTop + 7)

      let y = tableTop + 25
      doc.fillColor("#000000").fontSize(9).font("Helvetica")

      entries.forEach((entry, index) => {
        if (y > 750) {
          doc.addPage()
          y = 40
        }

        if (index % 2 === 0) {
          doc.fillColor("#f8fafc").rect(40, y - 3, 515, 20).fill()
          doc.fillColor("#000000")
        }

        doc.text(new Date(entry.date).toLocaleDateString("en-GB"), dateX, y)
        doc.text(entry.description, descX, y, { width: 110, ellipsis: true })
        doc.text(entry.entity || "-", entityX, y, { width: 90, ellipsis: true })
        doc.text(entry.reference, refX, y, { width: 70, ellipsis: true })
        doc.text(entry.type, typeX, y)
        doc.text(`£${entry.amount.toFixed(2)}`, amountX, y)

        y += 20
      })
    }

    // Execution Logic
    if (type === "client") {
      const entries = await fetchData("client")
      const totals = calculateTotals(entries)
      drawHeader("CLIENT LEDGER")
      drawTotalsSummary(totals)
      drawTable(entries)
    } else if (type === "supplier") {
      const entries = await fetchData("supplier")
      const totals = calculateTotals(entries)
      drawHeader("SUPPLIER LEDGER")
      drawTotalsSummary(totals)
      drawTable(entries)
    } else {
      // Both
      const clientEntries = await fetchData("client")
      const clientTotals = calculateTotals(clientEntries)
      drawHeader("COMBINED LEDGER - CLIENT")
      drawTotalsSummary(clientTotals)
      drawTable(clientEntries)

      doc.addPage()

      const supplierEntries = await fetchData("supplier")
      const supplierTotals = calculateTotals(supplierEntries)
      drawHeader("COMBINED LEDGER - SUPPLIER")
      drawTotalsSummary(supplierTotals)
      drawTable(supplierEntries)

      // Add Grand Total Page
      doc.addPage()
      drawHeader("COMBINED LEDGER - GRAND TOTAL")

      // Calculate combined totals
      const grandTotals = {
        totalDebit: clientTotals.totalDebit + supplierTotals.totalDebit,
        totalCredit: clientTotals.totalCredit + supplierTotals.totalCredit,
        netBalance: (clientTotals.totalDebit + supplierTotals.totalDebit) - (clientTotals.totalCredit + supplierTotals.totalCredit)
      }

      // Draw grand totals summary
      const startY = doc.y
      doc.fillColor("#f0f9ff").rect(40, startY, 515, 140).fill()
      doc.strokeColor("#1e3a8a").lineWidth(2).rect(40, startY, 515, 140).stroke()

      let y = startY + 15
      doc.fillColor("#1e3a8a").fontSize(14).font("Helvetica-Bold")
      doc.text("SUMMARY", 50, y)

      y += 30
      doc.fillColor("#000000").fontSize(11).font("Helvetica-Bold")

      // Client Section
      doc.text("Client Ledger:", 50, y)
      y += 20
      doc.fontSize(10).font("Helvetica")
      doc.text(`Debit: £${clientTotals.totalDebit.toFixed(2)}`, 70, y)
      doc.text(`Credit: £${clientTotals.totalCredit.toFixed(2)}`, 250, y)
      doc.text(`Balance: £${clientTotals.netBalance.toFixed(2)}`, 430, y)

      y += 25
      doc.fontSize(11).font("Helvetica-Bold")
      doc.text("Supplier Ledger:", 50, y)
      y += 20
      doc.fontSize(10).font("Helvetica")
      doc.text(`Debit: £${supplierTotals.totalDebit.toFixed(2)}`, 70, y)
      doc.text(`Credit: £${supplierTotals.totalCredit.toFixed(2)}`, 250, y)
      doc.text(`Balance: £${supplierTotals.netBalance.toFixed(2)}`, 430, y)

      // Grand Total Line
      y += 25
      doc.strokeColor("#1e3a8a").lineWidth(2).moveTo(50, y).lineTo(545, y).stroke()
      y += 15
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#1e3a8a")
      doc.text("GRAND TOTAL:", 50, y)
      doc.text(`£${grandTotals.totalDebit.toFixed(2)}`, 70, y + 20)
      doc.text(`£${grandTotals.totalCredit.toFixed(2)}`, 250, y + 20)
      doc.text(`£${grandTotals.netBalance.toFixed(2)}`, 430, y + 20)
    }

    doc.end()

  } catch (error) {
    console.error("Error generating ledger statement:", error)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Error generating ledger statement" })
    }
  }
})

// Get Ledger by Entity (owner-only)
export const getLedgerByEntity = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { entityId } = req.params
  const { limit = 99999, skip = 0 } = req.query

  const orders = await Order.find({ clientId: entityId, userId: req.admin._id })
  const purchases = await Purchase.find({ supplierId: entityId, userId: req.admin._id })

  const total = orders.length + purchases.length
  const ledgerEntries = [...orders, ...purchases]
    .slice(Number(skip), Number(skip) + Number(limit))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.status(200).json({
    success: true,
    total,
    limit: Number(limit),
    skip: Number(skip),
    ledgerEntries,
  })
})

// Update Ledger Entry (owner-only)
export const updateLedgerEntry = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  res.status(400).json({
    success: false,
    message: "Ledger entries cannot be updated directly",
  })
})

// Delete Ledger Entry (Soft Delete) (owner-only)
export const deleteLedgerEntry = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  res.status(400).json({
    success: false,
    message: "Ledger entries cannot be deleted directly",
  })
})

// Get Ledger Summary (owner-only)
export const getLedgerSummary = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const orders = await Order.find({ userId: req.admin._id })
  const purchases = await Purchase.find({ userId: req.admin._id })

  const totalFromOrders = orders.reduce((sum, o) => sum + o.total, 0)
  const totalFromPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0)

  res.status(200).json({
    success: true,
    summary: {
      totalCredit: totalFromOrders,
      totalDebit: totalFromPurchases,
      balance: totalFromOrders - totalFromPurchases,
      transactionCount: orders.length + purchases.length,
    },
  })
})
