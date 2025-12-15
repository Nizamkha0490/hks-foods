import Supplier from "../models/Supplier.js"
import Purchase from "../models/Purchase.js"
import Product from "../models/Product.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import mongoose from "mongoose"
import PDFDocument from "pdfkit"
import Payment from "../models/Payment.js"

export const createSupplier = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { name, email, phone, address, city, state, zipCode, bankDetails } = req.body

  if (!name || !phone || !address || !city) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    })
  }

  const supplier = await Supplier.create({
    name,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    bankDetails,
    userId: req.admin._id,
  })

  res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    supplier,
  })
})

export const getAllSuppliers = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { search, limit = 99999, skip = 0 } = req.query

  const query = { isActive: true, userId: req.admin._id }
  if (search) {
    query.$text = { $search: search }
  }

  const total = await Supplier.countDocuments(query)
  const suppliers = await Supplier.find(query).limit(Number(limit)).skip(Number(skip)).sort({ createdAt: -1 }).lean()

  // Return suppliers with all balance fields for frontend
  const suppliersWithPayable = suppliers.map((s) => ({
    ...s,
    totalDebit: s.totalDebit || 0,
    totalCredit: s.totalCredit || 0,
    payable: (s.totalDebit || 0) - (s.totalCredit || 0),
  }))

  res.status(200).json({
    success: true,
    total,
    limit: Number(limit),
    skip: Number(skip),
    suppliers: suppliersWithPayable,
  })
})

export const getSuppliersWithBalances = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const suppliers = await Supplier.find({
    isActive: true,
    userId: req.admin._id
  }).sort({ name: 1 }).lean()

  const suppliersWithBalance = suppliers.map((s) => ({
    _id: s._id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    totalDebit: s.totalDebit || 0,
    totalCredit: s.totalCredit || 0,
    balance: (s.totalDebit || 0) - (s.totalCredit || 0),
  }))

  // Filter out suppliers with zero balance if needed
  const activeSuppliers = suppliersWithBalance.filter(s => s.balance !== 0)

  res.status(200).json({
    success: true,
    suppliers: activeSuppliers,
    totalBalance: activeSuppliers.reduce((sum, s) => sum + s.balance, 0)
  })
})

export const getSupplierById = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid supplier id" })
  }

  const supplier = await Supplier.findOne({
    _id: id,
    userId: req.admin._id,
  }).lean()
  if (!supplier) {
    return res.status(404).json({ success: false, message: "Supplier not found" })
  }

  supplier.payable = (supplier.totalDebit || 0) - (supplier.totalCredit || 0)

  res.status(200).json({
    success: true,
    supplier,
  })
})

export const updateSupplier = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { name, email, phone, address, city, state, zipCode, bankDetails, totalCredit, totalDebit } = req.body

  let supplier = await Supplier.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  })

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: "Supplier not found",
    })
  }

  // Handle address object from frontend
  let addressString = supplier.address;
  if (address && typeof address === 'object') {
    // Convert address object to string format
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.postalCode) parts.push(address.postalCode);
    addressString = parts.join(', ');
  } else if (typeof address === 'string') {
    addressString = address;
  }

  supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, userId: req.admin._id },
    {
      name: name || supplier.name,
      email: email || supplier.email,
      phone: phone || supplier.phone,
      address: addressString || supplier.address,
      city: city || supplier.city,
      state: state || supplier.state,
      zipCode: zipCode || supplier.zipCode,
      bankDetails: bankDetails || supplier.bankDetails,
      totalCredit: totalCredit !== undefined ? totalCredit : supplier.totalCredit,
      totalDebit: totalDebit !== undefined ? totalDebit : supplier.totalDebit,
    },
    { new: true },
  ).lean()

  supplier.payable = (supplier.totalDebit || 0) - (supplier.totalCredit || 0)

  res.status(200).json({
    success: true,
    message: "Supplier updated successfully",
    supplier,
  })
})

export const deleteSupplier = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, userId: req.admin._id },
    { isActive: false },
    { new: true },
  )

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: "Supplier not found",
    })
  }

  res.status(200).json({
    success: true,
    message: "Supplier deleted successfully",
  })
})

export const recordGoods = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { invoiceNo, dateReceived, items = [], notes, vatRate = 0 } = req.body
  const supplierId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return res.status(400).json({ success: false, message: "Invalid supplier id" })
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    userId: req.admin._id,
  })
  if (!supplier) {
    return res.status(404).json({ success: false, message: "Supplier not found" })
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "At least one item is required" })
  }

  let subTotal = 0
  const normalizedItems = items.map((it) => {
    const qty = Number(it.qty || 0)
    const unitPrice = Number(it.unitPrice || it.price || 0)
    const productName = it.productName || (it.productId ? String(it.productId) : "Unknown")
    const itemTotal = qty * unitPrice
    subTotal += itemTotal
    return {
      productId: it.productId || undefined,
      productName,
      qty,
      unitPrice,
      total: itemTotal,
    }
  })

  const vatAmount = (subTotal * Number(vatRate)) / 100
  const totalAmount = subTotal + vatAmount

  try {
    const Counter = mongoose.model("Counter")
    const counter = await Counter.findOneAndUpdate(
      { name: "purchaseOrderNo", userId: req.admin._id },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )

    const purchaseOrderNo = `PO-ID-${String(counter.seq).padStart(4, "0")}`

    const purchase = await Purchase.create({
      supplierId,
      purchaseOrderNo,
      invoiceNo: invoiceNo || "", // Make invoiceNo optional
      dateReceived: dateReceived ? new Date(dateReceived) : new Date(),
      items: normalizedItems,
      notes,
      totalAmount,
      vatRate: Number(vatRate),
      vatAmount,
      userId: req.admin._id,
    })

    await Supplier.findOneAndUpdate({ _id: supplierId, userId: req.admin._id }, { $inc: { totalDebit: totalAmount } })

    // Update product stock
    for (const item of normalizedItems) {
      if (item.productId) {
        await Product.findOneAndUpdate(
          { _id: item.productId, userId: req.admin._id },
          { $inc: { stock: item.qty } }
        )
      }
    }

    res.status(201).json({
      success: true,
      message: "Goods recorded successfully",
      purchase,
    })
  } catch (error) {
    console.error("Error recording goods:", error)
    res.status(500).json({
      success: false,
      message: "Error recording goods: " + error.message,
    })
  }
})

export const getPurchasesForSupplier = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const supplierId = req.params.id
  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return res.status(400).json({ success: false, message: "Invalid supplier id" })
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    userId: req.admin._id,
  })
  if (!supplier) {
    return res.status(404).json({ success: false, message: "Supplier not found" })
  }

  const purchases = await Purchase.find({
    supplierId,
    userId: req.admin._id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  res.status(200).json({
    success: true,
    purchases,
  })
})

export const getSupplierStats = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const totalSuppliers = await Supplier.countDocuments({
    isActive: true,
    userId: req.admin._id,
  })

  // Get all suppliers and calculate total balance
  const suppliers = await Supplier.find({
    isActive: true,
    userId: req.admin._id,
  }).lean()

  // Calculate total balance as sum of (totalDebit - totalCredit) for all suppliers
  const totalBalance = suppliers.reduce((sum, supplier) => {
    const balance = (supplier.totalDebit || 0) - (supplier.totalCredit || 0)
    return sum + balance
  }, 0)

  res.status(200).json({
    success: true,
    total: totalSuppliers,
    totalSuppliers,  // Add this for clarity
    totalBalance,
  })
})

export const updatePurchase = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { purchaseId } = req.params
  const { dateReceived, notes, items } = req.body

  const purchase = await Purchase.findOne({ _id: purchaseId, userId: req.admin._id })
  if (!purchase) {
    return res.status(404).json({ success: false, message: "Purchase not found" })
  }

  // Revert old stock
  for (const item of purchase.items) {
    if (item.productId) {
      await Product.findOneAndUpdate(
        { _id: item.productId, userId: req.admin._id },
        { $inc: { stock: -item.qty } }
      )
    }
  }

  // Calculate new total and normalize items
  let totalAmount = 0
  const normalizedItems = items.map((it) => {
    const qty = Number(it.qty || 0)
    const unitPrice = Number(it.unitPrice || it.price || 0)
    const productName = it.productName || (it.productId ? String(it.productId) : "Unknown")
    const itemTotal = qty * unitPrice
    totalAmount += itemTotal
    return {
      productId: it.productId || undefined,
      productName,
      qty,
      unitPrice,
      total: itemTotal,
    }
  })

  // Apply new stock
  for (const item of normalizedItems) {
    if (item.productId) {
      await Product.findOneAndUpdate(
        { _id: item.productId, userId: req.admin._id },
        { $inc: { stock: item.qty } }
      )
    }
  }

  // Update Supplier totalDebit
  const amountDiff = totalAmount - purchase.totalAmount
  await Supplier.findOneAndUpdate(
    { _id: purchase.supplierId, userId: req.admin._id },
    { $inc: { totalDebit: amountDiff } }
  )

  // Update Purchase
  purchase.dateReceived = dateReceived ? new Date(dateReceived) : purchase.dateReceived
  purchase.notes = notes
  purchase.items = normalizedItems
  purchase.totalAmount = totalAmount
  await purchase.save()

  res.status(200).json({ success: true, purchase })
})

export const deletePurchase = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { purchaseId } = req.params

  const purchase = await Purchase.findOne({ _id: purchaseId, userId: req.admin._id })
  if (!purchase) {
    return res.status(404).json({ success: false, message: "Purchase not found" })
  }

  // Revert stock (decrement because purchase added stock)
  for (const item of purchase.items) {
    if (item.productId) {
      await Product.findOneAndUpdate(
        { _id: item.productId, userId: req.admin._id },
        { $inc: { stock: -item.qty } }
      )
    }
  }

  // Revert Supplier totalDebit
  await Supplier.findOneAndUpdate(
    { _id: purchase.supplierId, userId: req.admin._id },
    { $inc: { totalDebit: -purchase.totalAmount } }
  )

  await purchase.deleteOne()

  res.status(200).json({ success: true, message: "Purchase deleted successfully" })
})

export const getSupplierProfile = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const supplier = await Supplier.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  })

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: "Supplier not found",
    })
  }

  const transactions = await Purchase.find({
    supplierId: req.params.id,
    userId: req.admin._id,
  }).sort({ createdAt: -1 })

  const totalDues = (supplier.totalDebit || 0) - (supplier.totalCredit || 0)

  res.status(200).json({
    success: true,
    supplier,
    transactions,
    totalDues,
  })
})

export const exportSupplierStatement = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const supplier = await Supplier.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  })

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: "Supplier not found",
    })
  }

  // Get query parameters
  const { type = "all", from, to } = req.query

  // Get transactions (Purchases) and payments with date filtering
  let transactionQuery = { supplierId: req.params.id, userId: req.admin._id }
  let paymentQuery = { supplierId: req.params.id, userId: req.admin._id }

  if (from && to) {
    const startDate = new Date(from)
    const endDate = new Date(to)
    endDate.setHours(23, 59, 59, 999)

    transactionQuery.createdAt = { $gte: startDate, $lte: endDate }
    paymentQuery.createdAt = { $gte: startDate, $lte: endDate }
  }

  const transactions = await Purchase.find(transactionQuery).sort({ createdAt: -1 })
  const payments = await Payment.find(paymentQuery).sort({ createdAt: -1 })

  // Calculate totals
  const totalPurchases = transactions.reduce((acc, p) => acc + p.totalAmount, 0)
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0)
  const outstandingBalance = (supplier.totalDebit || 0) - (supplier.totalCredit || 0)

  const doc = new PDFDocument({ margin: 40, size: "A4" })

  res.setHeader("Content-Type", "application/pdf")

  // Generate filename based on type and date range
  let filename = `statement-${supplier.name}`
  if (type !== "all") filename += `-${type}`
  if (from && to) filename += `-${from}-to-${to}`
  filename += ".pdf"

  res.setHeader("Content-Disposition", `attachment; filename=${filename}`)

  doc.pipe(res)

  // Add centered watermark background with two lines
  doc.save()
    .translate(297, 421) // Center of A4 page
    .rotate(-45)
    .opacity(0.03)
    .fontSize(60)
    .font("Helvetica-Bold")
    .fillColor("#000000")
    .text("HKS FOODS", -80, -20)
    .text("LTD", 40, 30)
  doc.restore()
    .opacity(1)

  // Header Section
  const headerY = 40

  // Company Name and Details - Centered
  doc
    .fillColor("#1e3a8a")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("HKS FOODS LTD", { align: "center" })

  doc
    .fillColor("#666666")
    .fontSize(9)
    .font("Helvetica")
    .text("104 ANTHONY ROAD", { align: "center" })
    .text("BIRMINGHAM B83AA", { align: "center" })
    .text(
      "Tel:+44 7477 956299 | VAT NUMBER: 495814839 | Company No: 16372393",
      { align: "center" }
    )

  // Statement Title based on type
  let statementTitle = "SUPPLIER STATEMENT"
  let statementSubtitle = "All Transactions"

  if (type === "invoices") {
    statementTitle = "PURCHASE LIST"
    statementSubtitle = "Purchase Transactions Only"
  } else if (type === "payments") {
    statementTitle = "PAYMENT LIST"
    statementSubtitle = "Payment Transactions Only"
  }

  doc.moveDown(0.5)
  doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.5)
  doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text(statementTitle, { align: "center" })

  doc.moveDown(0.3)
  let dateRangeText = "All Transactions"
  if (from && to) {
    dateRangeText = `From ${new Date(from).toLocaleDateString("en-GB")} to ${new Date(to).toLocaleDateString("en-GB")}`
  }
  doc
    .fontSize(10)
    .text(
      `${statementSubtitle} | ${dateRangeText} | Generated: ${new Date().toLocaleDateString("en-GB")}`,
      { align: "center" }
    )

  // Supplier Information Section
  const detailsY = doc.y + 15

  // Supplier Details
  doc.fillColor("#1e3a8a").fontSize(10).font("Helvetica-Bold").text("SUPPLIER INFORMATION:", 40, detailsY)

  doc.fillColor("#000000").font("Helvetica").fontSize(9)
  let supplierY = detailsY + 15

  doc.text(`Name: ${supplier.name}`, 40, supplierY)
  supplierY += 12
  if (supplier.email) {
    doc.text(`Email: ${supplier.email}`, 40, supplierY)
    supplierY += 12
  }
  if (supplier.phone) {
    doc.text(`Phone: ${supplier.phone}`, 40, supplierY)
    supplierY += 12
  }
  if (supplier.address) {
    doc.text(`Address: ${supplier.address}`, 40, supplierY)
    supplierY += 12
    const cityInfo = [supplier.city, supplier.zipCode].filter(Boolean).join(", ")
    if (cityInfo) {
      doc.text(cityInfo, 40, supplierY)
    }
  }

  // Summary Section - Right Column
  const summaryX = 300
  doc.fillColor("#1e3a8a").font("Helvetica-Bold").text("ACCOUNT SUMMARY:", summaryX, detailsY)

  doc
    .fillColor("#000000")
    .font("Helvetica")
    .fontSize(9)

  let summaryY = detailsY + 15

  if (type === "all" || type === "invoices") {
    doc.text(`Total Purchases: ${transactions.length}`, summaryX, summaryY)
    summaryY += 12
    doc.text(`Purchase Amount: £${totalPurchases.toFixed(2)}`, summaryX, summaryY)
    summaryY += 12
  }

  if (type === "all" || type === "payments") {
    doc.text(`Total Payments: ${payments.length}`, summaryX, summaryY)
    summaryY += 12
    doc.text(`Amount Paid: £${totalPayments.toFixed(2)}`, summaryX, summaryY)
    summaryY += 12
  }

  if (type === "all") {
    doc.font("Helvetica-Bold").fillColor("#1e3a8a")
    doc.text(`Outstanding Balance: £${outstandingBalance.toFixed(2)}`, summaryX, summaryY)
  }

  let y = Math.max(supplierY, summaryY + 25) + 15

  // PURCHASES SECTION (only for "all" or "invoices")
  if ((type === "all" || type === "invoices") && transactions.length > 0) {
    if (type === "all") {
      // Section header for purchases
      doc.fillColor("#1e3a8a").fontSize(12).font("Helvetica-Bold").text("PURCHASES", 40, y)
      y += 20
    }

    // Purchases Table Header
    doc.fillColor("#1e3a8a").rect(40, y, 515, 20).fill()
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")

    const purDateX = 45, purNoX = 100, purInvX = 180, purAmountX = 450
    doc.text("DATE", purDateX, y + 7)
    doc.text("PO NO", purNoX, y + 7)
    doc.text("INVOICE NO", purInvX, y + 7)
    doc.text("AMOUNT", purAmountX, y + 7)

    // Purchases Table Rows
    doc.fillColor("#000000").fontSize(8).font("Helvetica")
    y += 25

    transactions.forEach((transaction, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.fillColor("#f8fafc").rect(40, y - 3, 515, 16).fill()
        doc.fillColor("#000000")
      }

      doc.text(new Date(transaction.dateReceived || transaction.createdAt).toLocaleDateString("en-GB"), purDateX, y)
      doc.text(transaction.purchaseOrderNo || "N/A", purNoX, y)
      doc.text(transaction.invoiceNo || "N/A", purInvX, y)
      doc.text(`£${transaction.totalAmount.toFixed(2)}`, purAmountX, y, { width: 50, align: "right" })

      y += 16

      // Add page break if needed
      if (y > 650) {
        doc.addPage()
        y = 40
      }
    })

    y += 10
  }

  // PAYMENTS SECTION (only for "all" or "payments")
  if ((type === "all" || type === "payments") && payments.length > 0) {
    if (type === "all") {
      // Add separation line and section header for payments
      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(40, y).lineTo(555, y).stroke()
      y += 15
      doc.fillColor("#1e3a8a").fontSize(12).font("Helvetica-Bold").text("PAYMENTS", 40, y)
      y += 20
    }

    // Payments Table Header
    doc.fillColor("#1e3a8a").rect(40, y, 515, 20).fill()
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")

    const payDateX = 45, payNoX = 100, payDescX = 180, payMethodX = 350, payAmountX = 450
    doc.text("DATE", payDateX, y + 7)
    doc.text("PAYMENT NO", payNoX, y + 7)
    doc.text("DESCRIPTION", payDescX, y + 7)
    doc.text("METHOD", payMethodX, y + 7)
    doc.text("AMOUNT", payAmountX, y + 7)

    // Payments Table Rows
    doc.fillColor("#000000").fontSize(8).font("Helvetica")
    y += 25

    payments.forEach((payment, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.fillColor("#f8fafc").rect(40, y - 3, 515, 16).fill()
        doc.fillColor("#000000")
      }

      doc.text(new Date(payment.createdAt).toLocaleDateString("en-GB"), payDateX, y)
      doc.text(payment._id.toString().slice(-6), payNoX, y)
      doc.text(`Payment - ${payment.paymentMethod}`, payDescX, y, { width: 150, align: "left" })
      doc.text(payment.paymentMethod, payMethodX, y, { width: 80, align: "left" })
      doc.fillColor("#059669") // Green for payments
      doc.text(`£${payment.amount.toFixed(2)}`, payAmountX, y, { width: 50, align: "right" })
      doc.fillColor("#000000")

      y += 16

      // Add page break if needed
      if (y > 650) {
        doc.addPage()
        y = 40
      }
    })

    y += 10
  }

  // Show message if no data
  if ((type === "invoices" && transactions.length === 0) ||
    (type === "payments" && payments.length === 0) ||
    (type === "all" && transactions.length === 0 && payments.length === 0)) {
    doc.fillColor("#666666").fontSize(10).font("Helvetica")
      .text("No transactions found for the selected criteria.", 40, y, { align: "center" })
    y += 20
  }

  // Final Summary Section (only for "all")
  if (type === "all") {
    y += 10
    const summaryTop = y

    doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(350, summaryTop).lineTo(555, summaryTop).stroke()
    y += 12

    doc.fontSize(9).fillColor("#000000")
    doc.text("Total Purchased:", 420, y, { width: 80, align: "right" })
    doc.text(`£${totalPurchases.toFixed(2)}`, 500, y, { width: 50, align: "right" })
    y += 12

    doc.text("Total Paid:", 420, y, { width: 80, align: "right" })
    doc.text(`£${totalPayments.toFixed(2)}`, 500, y, { width: 50, align: "right" })
    y += 12

    doc.fontSize(10).font("Helvetica-Bold")
    doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(350, y).lineTo(555, y).stroke()
    y += 8

    doc.text("Outstanding Balance:", 420, y, { width: 80, align: "right" })
    doc.text(`£${outstandingBalance.toFixed(2)}`, 500, y, { width: 50, align: "right" })
  }

  // Footer Section
  const footerY = Math.max(y + 30, 700)

  // Thank you message
  doc.fontSize(9).font("Helvetica").fillColor("#1e3a8a")
  doc.text("Thank you for your business with HKS Foods Ltd", { align: "center" })
  doc.moveDown(0.3)

  // Terms and conditions
  doc.fontSize(7).fillColor("#666666")
  doc.text("payment within 3 days term", { align: "center" })
  doc.moveDown(0.5)

  // Bottom separator line
  doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(40, footerY).lineTo(555, footerY).stroke()

  // Footer content
  const footerContentY = footerY + 8

  // Left - Generation info
  doc
    .fontSize(7)
    .text(
      `Generated: ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}`,
      40,
      footerContentY,
    )

  // Center - Company info
  doc.text("HKS Foods Ltd | Registered in England | Company No: 16372393", { align: "center" })

  // Right - Page info
  doc.text("Page 1 of 1", 515, footerContentY, { align: "right" })

  // VAT info on second line
  doc.text("VAT Registration No: 495814839", { align: "center" })

  doc.end()
})

export const recordInvoice = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { invoiceNo, dateReceived, netAmount, vatAmount, notes, paymentMethod } = req.body
  const supplierId = req.params.id

  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return res.status(400).json({ success: false, message: "Invalid supplier id" })
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    userId: req.admin._id,
  })
  if (!supplier) {
    return res.status(404).json({ success: false, message: "Supplier not found" })
  }

  const net = Number(netAmount || 0)
  const vat = Number(vatAmount || 0)

  if (net <= 0) {
    return res.status(400).json({ success: false, message: "Net value must be greater than 0" })
  }

  const totalAmount = net + vat

  try {
    const Counter = mongoose.model("Counter")
    const counter = await Counter.findOneAndUpdate(
      { name: "purchaseOrderNo", userId: req.admin._id },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )

    const purchaseOrderNo = `PO-ID-${String(counter.seq).padStart(4, "0")}`

    const items = [{
      productName: notes || `Invoice ${invoiceNo || purchaseOrderNo}`,
      qty: 1,
      unitPrice: net,
      total: net
    }];

    const purchase = await Purchase.create({
      supplierId,
      purchaseOrderNo,
      invoiceNo: invoiceNo || "",
      dateReceived: dateReceived ? new Date(dateReceived) : new Date(),
      items,
      notes,
      totalAmount,
      vatRate: net > 0 ? (vat / net) * 100 : 0,
      vatAmount: vat,
      userId: req.admin._id,
      paymentMethod,
    })

    await Supplier.findOneAndUpdate({ _id: supplierId, userId: req.admin._id }, { $inc: { totalDebit: totalAmount } })

    res.status(201).json({
      success: true,
      message: "Invoice recorded successfully",
      purchase,
    })
  } catch (error) {
    console.error("Error recording invoice:", error)
    res.status(500).json({
      success: false,
      message: "Error recording invoice: " + error.message,
    })
  }
})


export const updateInvoice = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { purchaseId } = req.params
  const { invoiceNo, dateReceived, netAmount, vatAmount, notes, paymentMethod } = req.body

  const purchase = await Purchase.findOne({ _id: purchaseId, userId: req.admin._id })
  if (!purchase) {
    return res.status(404).json({ success: false, message: "Purchase not found" })
  }

  const net = Number(netAmount || 0)
  const vat = Number(vatAmount || 0)

  if (net <= 0) {
    return res.status(400).json({ success: false, message: "Net value must be greater than 0" })
  }

  const totalAmount = net + vat

  // Revert old total from Supplier totalDebit
  await Supplier.findOneAndUpdate(
    { _id: purchase.supplierId, userId: req.admin._id },
    { $inc: { totalDebit: -purchase.totalAmount } }
  )

  // Update logic
  // Update dummy item
  const items = [{
    productName: notes || `Invoice ${invoiceNo || purchase.purchaseOrderNo}`,
    qty: 1,
    unitPrice: net,
    total: net,
    // Preserve productId if it existed (unlikely for invoice but good practice)
    productId: purchase.items[0]?.productId
  }];

  purchase.invoiceNo = invoiceNo || "";
  purchase.dateReceived = dateReceived ? new Date(dateReceived) : purchase.dateReceived;
  purchase.items = items;
  purchase.notes = notes;
  purchase.totalAmount = totalAmount;
  purchase.vatRate = net > 0 ? (vat / net) * 100 : 0;
  purchase.vatAmount = vat;
  purchase.paymentMethod = paymentMethod;

  await purchase.save();

  // Add new total to Supplier totalDebit
  await Supplier.findOneAndUpdate(
    { _id: purchase.supplierId, userId: req.admin._id },
    { $inc: { totalDebit: totalAmount } }
  )

  res.status(200).json({ success: true, purchase })
})