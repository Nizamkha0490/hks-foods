import Order from "../models/Order.js"
import Product from "../models/Product.js"
import Client from "../models/Client.js"
import Settings from "../models/Settings.js"
import CreditNote from "../models/CreditNote.js"
import PDFDocument from "pdfkit"
import { asyncHandler } from "../middleware/errorHandler.js"
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// GET ALL ORDERS (owner-only)
export const getOrders = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const orders = await Order.find({ userId: req.admin._id })
      .populate("clientId", "name email") // Only select name and email
      .populate("lines.productId", "name vat") // Only select name and vat
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders: orders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    })
  }
})

// GET ORDERS BY CLIENT
export const getOrdersByClient = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const orders = await Order.find({
      clientId: req.params.clientId,
      userId: req.admin._id,
    })
      .populate("lines.productId", "name vat")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Error fetching client orders:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching client orders",
    })
  }
})

// GET CREDIT NOTES BY CLIENT (owner-only)
export const getCreditNotesByClient = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const creditNotes = await Order.find({
      clientId: req.params.clientId,
      userId: req.admin._id,
      status: { $in: ["cancelled", "returned"] },
    })
      .populate("clientId", "name email") // Only select name and email
      .populate("lines.productId", "name vat") // Only select name and vat
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      creditNotes: creditNotes,
    })
  } catch (error) {
    console.error("Error fetching credit notes:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching credit notes",
    })
  }
})

// GET INVOICES BY CLIENT (owner-only)
export const getInvoicesByClient = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const invoices = await Order.find({ clientId: req.params.clientId, userId: req.admin._id })
      .populate("clientId", "name email") // Only select name and email
      .populate("lines.productId", "name vat") // Only select name and vat
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      invoices: invoices,
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching invoices",
    })
  }
})

// GET SINGLE ORDER (owner-only)
export const getOrder = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.admin._id })
      .populate("clientId", "name email phone address") // Only select required fields
      .populate("lines.productId", "name vat unit") // Only select required fields

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    res.json({
      success: true,
      order: order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching order",
    })
  }
})

// CREATE ORDER (owner-only)
export const createOrder = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const { clientId, lines, paymentMethod, deliveryCost, includeVAT, status, type } = req.body

    if (!clientId || !lines || lines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Client and order lines are required",
      })
    }

    // Validate client belongs to user
    const client = await Client.findOne({ _id: clientId, userId: req.admin._id })
    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client not found or does not belong to you",
      })
    }

    // Validate stock availability and calculate total - OPTIMIZED: Batch product lookup
    let total = 0
    const productIds = lines.map(line => line.productId)
    const products = await Product.find({ _id: { $in: productIds } })
    const productMap = new Map(products.map(p => [p._id.toString(), p]))

    // Validate all products exist and have sufficient stock
    for (const line of lines) {
      const product = productMap.get(line.productId.toString())
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${line.productId}`,
        })
      }

      if (product.stock < line.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${line.qty}`,
        })
      }

      let lineTotal = line.qty * line.price

      // Calculate VAT if included
      if (includeVAT !== false) {
        const vatRate = product.vat !== undefined && product.vat !== null ? product.vat : 20
        lineTotal = lineTotal * (1 + vatRate / 100)
      }

      total += lineTotal
    }

    // Batch stock reduction - OPTIMIZED: Use bulkWrite instead of individual updates
    const bulkOps = lines.map(line => ({
      updateOne: {
        filter: { _id: line.productId },
        update: { $inc: { stock: -line.qty } }
      }
    }))
    await Product.bulkWrite(bulkOps)

    if (deliveryCost) {
      total += deliveryCost
    }

    // Create order - let the Order model handle the orderNo automatically
    const backendInvoiceType = {
      'On Account': 'on_account',
      'Cash': 'cash',
      'Picking List': 'picking_list',
      'Proforma': 'proforma',
      'Invoice': 'invoice'
    }[type] || 'invoice';

    const order = await Order.create({
      clientId,
      lines: lines,
      paymentMethod: paymentMethod || "Bank Transfer",
      deliveryCost: deliveryCost || 0,
      includeVAT: includeVAT !== false,
      status: status || "pending",
      total: total,
      userId: req.admin._id,
      invoiceType: backendInvoiceType,
      // Don't set orderNo here - let the model handle it automatically
    })

    // Increment client's totalDues if this is an on_account order
    if (backendInvoiceType === "on_account") {
      await Client.findByIdAndUpdate(clientId, {
        $inc: { totalDues: total }
      })
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("clientId", "name")
      .populate("lines.productId", "name unit")

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(500).json({
      success: false,
      message: "Error creating order: " + error.message,
    })
  }
})

// UPDATE ORDER - check ownership, manage stock
export const updateOrder = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const { clientId, lines, status, paymentMethod, deliveryCost, includeVAT, type } = req.body
    const orderId = req.params.id

    const existingOrder = await Order.findOne({ _id: orderId, userId: req.admin._id })
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    if (lines && lines.length > 0) {
      // STEP 1: Validate new lines FIRST (before touching stock)
      const newProductIds = lines.map(line => line.productId)
      const newProducts = await Product.find({ _id: { $in: newProductIds } })
      const newProductMap = new Map(newProducts.map(p => [p._id.toString(), p]))

      for (const newLine of lines) {
        const product = newProductMap.get(newLine.productId.toString())
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product not found: ${newLine.productId}`,
          })
        }
        // Check stock AFTER restoring old stock (product.stock + oldQty - newQty >= 0)
        const oldLine = existingOrder.lines.find(l => l.productId.toString() === newLine.productId.toString())
        const oldQty = oldLine ? oldLine.qty : 0
        const availableStock = product.stock + oldQty

        if (availableStock < newLine.qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${newLine.qty}`,
          })
        }
      }

      // STEP 2: Now safe to modify stock - restore old stock
      const oldBulkOps = existingOrder.lines.map(line => ({
        updateOne: {
          filter: { _id: line.productId },
          update: { $inc: { stock: line.qty } }
        }
      }))
      await Product.bulkWrite(oldBulkOps)

      // STEP 3: Reduce stock for new lines
      const newBulkOps = lines.map(line => ({
        updateOne: {
          filter: { _id: line.productId },
          update: { $inc: { stock: -line.qty } }
        }
      }))
      await Product.bulkWrite(newBulkOps)
    }

    const updateFields = {}
    if (clientId) updateFields.clientId = clientId
    if (lines) updateFields.lines = lines
    if (status) updateFields.status = status
    if (paymentMethod) updateFields.paymentMethod = paymentMethod
    if (deliveryCost !== undefined) updateFields.deliveryCost = deliveryCost
    if (includeVAT !== undefined) updateFields.includeVAT = includeVAT

    // Recalculate total - OPTIMIZED: Batch product lookup
    let calculatedTotal = 0
    const linesToUse = lines || existingOrder.lines
    const useVAT = includeVAT !== undefined ? includeVAT : existingOrder.includeVAT

    // Batch fetch products for VAT calculation
    const productIds = linesToUse.map(line => line.productId)
    const products = await Product.find({ _id: { $in: productIds } })
    const productMap = new Map(products.map(p => [p._id.toString(), p]))

    for (const line of linesToUse) {
      const product = productMap.get(line.productId.toString())
      if (product) {
        let lineTotal = line.qty * line.price

        if (useVAT) {
          const vatRate = product.vat !== undefined && product.vat !== null ? product.vat : 20
          lineTotal = lineTotal * (1 + vatRate / 100)
        }

        calculatedTotal += lineTotal
      }
    }

    if (deliveryCost !== undefined) {
      calculatedTotal += deliveryCost
    } else {
      calculatedTotal += existingOrder.deliveryCost || 0
    }

    updateFields.total = calculatedTotal

    // Handle Dues Logic
    // 1. Revert Old State (if it was On Account)
    if (existingOrder.invoiceType === 'on_account') {
      await Client.findByIdAndUpdate(existingOrder.clientId, { $inc: { totalDues: -existingOrder.total } })
    }

    // Determine new invoice type
    const backendInvoiceType = type ? {
      'On Account': 'on_account',
      'Cash': 'cash',
      'Picking List': 'picking_list',
      'Proforma': 'proforma',
      'By Invoice': 'invoice',
      'Invoice': 'invoice'
    }[type] : existingOrder.invoiceType;

    // 2. Apply New State (if it is On Account)
    if (backendInvoiceType === 'on_account') {
      const targetClientId = clientId || existingOrder.clientId
      await Client.findByIdAndUpdate(targetClientId, { $inc: { totalDues: calculatedTotal } })
    }

    if (type) updateFields.invoiceType = backendInvoiceType;

    await Order.findOneAndUpdate({ _id: orderId, userId: req.admin._id }, updateFields, { new: true })

    const updatedOrder = await Order.findById(orderId).populate("clientId").populate("lines.productId")

    res.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("❌ UPDATE ORDER ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Error updating order: " + error.message,
    })
  }
})

// UPDATE ORDER STATUS (owner-only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const { status } = req.body
    const orderId = req.params.id

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      })
    }

    // Fetch original order to check previous status
    const originalOrder = await Order.findOne({ _id: orderId, userId: req.admin._id })
    if (!originalOrder) {
      return res.status(404).json({ success: false, message: "Order not found" })
    }

    // Handle Balance Updates for On Account orders
    if (originalOrder.invoiceType === "on_account") {
      // If cancelling, reduce dues
      if (status === "cancelled" && originalOrder.status !== "cancelled") {
        await Client.findByIdAndUpdate(originalOrder.clientId, {
          $inc: { totalDues: -originalOrder.total }
        })
      }
      // If un-cancelling, increase dues
      else if (originalOrder.status === "cancelled" && status !== "cancelled") {
        await Client.findByIdAndUpdate(originalOrder.clientId, {
          $inc: { totalDues: originalOrder.total }
        })
      }
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId: req.admin._id },
      { status },
      { new: true },
    ).populate("clientId")

    // Create Credit Note if status is cancelled
    if (status === "cancelled" && originalOrder.status !== "cancelled") {
      const existingCN = await CreditNote.findOne({ orderId: order._id });
      if (!existingCN) {
        await CreditNote.create({
          clientId: order.clientId._id || order.clientId,
          clientName: order.clientId.name || order.clientName,
          type: "cancellation",
          orderId: order._id,
          orderNo: order.orderNo,
          items: order.lines.map(line => ({
            productId: line.productId._id || line.productId,
            productName: line.productName,
            qty: line.qty,
            price: line.price,
            reason: "Order Cancelled"
          })),
          totalAmount: order.total,
          status: "pending",
          userId: req.admin._id
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    })

  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({
      success: false,
      message: "Error updating order status",
    })
  }
})

// DELETE ORDER - restore stock and owner-only delete
export const deleteOrder = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const orderId = req.params.id

    const order = await Order.findOne({ _id: orderId, userId: req.admin._id })
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // OPTIMIZED: Batch restore stock using bulkWrite
    const bulkOps = order.lines.map(line => ({
      updateOne: {
        filter: { _id: line.productId },
        update: { $inc: { stock: line.qty } }
      }
    }))
    await Product.bulkWrite(bulkOps)

    await Order.findOneAndDelete({ _id: orderId, userId: req.admin._id })

    res.json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting order:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting order",
    })
  }
})

export const exportOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("clientId").populate("lines.productId")

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="receipt-${order.orderNo}.pdf"`)

    doc.pipe(res)

    // Helper Functions
    const drawWatermark = () => {
      doc.save()
      doc
        .translate(297, 421) // Center of A4 page
        .rotate(-45)
        .opacity(0.03)
        .fontSize(60)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("HKS FOODS", -80, -20)
        .text("LTD", 40, 30)
      doc.restore()
      doc.opacity(1)
    }

    const drawHeader = (settings) => {
      // Company Name and Details - Centered
      doc
        .fillColor("#1e3a8a")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(settings?.warehouseName || "HKS FOODS LTD", 0, 40, { align: "center" })

      doc
        .fillColor("#666666")
        .fontSize(9)
        .font("Helvetica")
        .text(settings?.address || "104 ANTHONY ROAD", { align: "center" })
        .text(settings?.postalCode || "BIRMINGHAM B83AA", { align: "center" })

      // Separator
      doc.moveDown(0.5)
      doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.5)

      // Order Info Line
      doc.moveDown(0.3)
      doc
        .fontSize(10)
        .text(
          `Order Number: ${order.orderNo} | Date: ${new Date(order.createdAt).toLocaleDateString("en-GB")} | Status: ${order.status.toUpperCase()}`,
          { align: "center" },
        )
    }

    const drawReceiptDetails = (detailsY) => {
      // Two column layout
      const leftColumnX = 40
      const rightColumnX = 280

      // Client Details - Left Column
      doc.fillColor("#1e3a8a").fontSize(10).font("Helvetica-Bold").text("BILL TO:", leftColumnX, detailsY)

      doc.fillColor("#000000").font("Helvetica").fontSize(9)
      const client = order.clientId
      let clientY = detailsY + 15
      if (client) {
        doc.text(client.name || "N/A", leftColumnX, clientY)
        clientY += 12
        if (client.email) {
          doc.text(`Email: ${client.email}`, leftColumnX, clientY)
          clientY += 12
        }
        if (client.phone) {
          doc.text(`Phone: ${client.phone}`, leftColumnX, clientY)
          clientY += 12
        }
        if (client.address) {
          let addressY = clientY
          if (client.address.street) {
            doc.text(`Address: ${client.address.street}`, leftColumnX, addressY)
            addressY += 12
          }
          const cityInfo = [client.address.city, client.address.postalCode].filter(Boolean).join(", ")
          if (cityInfo) {
            doc.text(cityInfo, leftColumnX, addressY)
          }
        }
      }

      // Order Details - Right Column
      doc.fillColor("#1e3a8a").font("Helvetica-Bold").text("ORDER INFORMATION:", rightColumnX, detailsY)

      doc
        .fillColor("#000000")
        .font("Helvetica")
        .fontSize(9)
        .text(`Invoice Type: ${order.invoiceType || "N/A"}`, rightColumnX, detailsY + 15)
        .text(`VAT Treatment: ${order.includeVAT ? "VAT Included" : "VAT Excluded"}`, rightColumnX, detailsY + 27)

      if (order.deliveryCost && order.deliveryCost > 0) {
        doc.text(`Delivery: £${Number(order.deliveryCost).toFixed(2)}`, rightColumnX, detailsY + 39)
      }

      // Stamp
      try {
        const stampPath = path.join(__dirname, '../assets/paid_stamp.png')
        doc.image(stampPath, 460, detailsY - 20, { width: 80, height: 80, align: 'right' })
      } catch (e) { /* ignore */ }

      // Return Y position where table should start
      return Math.max(clientY, detailsY + 90) + 15
    }

    const drawTableHead = (y) => {
      doc.fillColor("#1e3a8a").rect(40, y, 515, 20).fill()
      doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")
      doc.text("#", 45, y + 7)
      doc.text("DESCRIPTION", 70, y + 7)
      doc.text("QTY", 310, y + 7)
      doc.text("PRICE", 360, y + 7)
      doc.text("VAT", 420, y + 7)
      doc.text("AMOUNT", 480, y + 7)
      doc.fillColor("#000000").fontSize(8).font("Helvetica") // Reset font
    }


    // --- Start Drawing ---

    const settings = await Settings.findOne({ userId: req.admin._id })

    // Page 1 Setup
    drawWatermark()
    drawHeader(settings)
    let tableTop = drawReceiptDetails(doc.y + 15)
    drawTableHead(tableTop)

    let y = tableTop + 25
    let subtotal = 0
    let totalVAT = 0
    let pageNumber = 1
    const ITEMS_PER_PAGE = 25
    let itemsOnCurrentPage = 0

    // Process Lines with Strict Pagination
    order.lines.forEach((line, index) => {
      // STRICT PAGINATION: Check if we hit the limit
      if (itemsOnCurrentPage >= ITEMS_PER_PAGE) {
        doc.addPage()
        pageNumber++
        itemsOnCurrentPage = 0 // Reset counter for new page

        drawWatermark()
        drawHeader(settings)

        // On subsequent pages, we don't redraw the massive Receipt Details.
        // We just start the table higher up.
        y = 150
        drawTableHead(y)
        y += 25
      }

      const productName = line.productId?.name || line.productName || "Unknown Product"
      const qty = Number(line.qty) || 0
      const price = Number(line.price) || 0
      let lineTotal = qty * price

      const vatRate = line.productId?.vat !== undefined && line.productId?.vat !== null ? line.productId.vat : 20
      const vatAmount = lineTotal * (vatRate / 100)

      if (order.includeVAT) {
        totalVAT += vatAmount
        lineTotal += vatAmount
      }
      subtotal += lineTotal

      // Alternate row bg
      if (index % 2 === 0) {
        doc.fillColor("#f8fafc").rect(40, y - 3, 515, 16).fill()
        doc.fillColor("#000000")
      }

      // Draw Row
      doc.text(`${index + 1}`, 45, y)
      doc.text(productName, 70, y, { width: 220, align: "left" })
      doc.text(qty.toString(), 310, y, { width: 35, align: "right" })
      doc.text(`£${price.toFixed(2)}`, 360, y, { width: 45, align: "right" })

      if (order.includeVAT) {
        doc.text(`£${vatAmount.toFixed(2)}`, 420, y, { width: 45, align: "right" })
      } else {
        doc.text("-", 420, y, { width: 45, align: "right" })
      }

      doc.text(`£${lineTotal.toFixed(2)}`, 480, y, { width: 60, align: "right" })

      y += 16
      itemsOnCurrentPage++
    })

    // Totals Section Logic - Draw ONLY after loop finishes
    // If not enough space for totals on current page, add new page
    // We estimate totals need ~120 units of space
    if (y > 700) {
      doc.addPage()
      drawWatermark()
      drawHeader(settings) // Optional: can just be a blank continue page, but header looks nicer
      y = 150
    } else {
      y += 10
    }

    doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(350, y).lineTo(555, y).stroke()
    y += 12

    const vatValue = order.includeVAT ? totalVAT : 0
    doc.text("Total VAT:", 420, y, { width: 80, align: "right" })
    doc.text(`£${vatValue.toFixed(2)}`, 480, y, { width: 60, align: "right" })
    y += 12

    const subtotalBeforeVAT = order.lines.reduce((sum, line) => sum + (line.qty * line.price), 0)
    doc.text("Subtotal:", 420, y, { width: 80, align: "right" })
    doc.text(`£${subtotalBeforeVAT.toFixed(2)}`, 480, y, { width: 60, align: "right" })
    y += 12

    const orderTotal = subtotal + (Number(order.deliveryCost) || 0)
    const clientTotalDues = order.clientId?.totalDues || 0
    let previousBalance = order.invoiceType === 'on_account' ? clientTotalDues - orderTotal : clientTotalDues

    if (previousBalance > 0) {
      doc.text("Previous Balance:", 420, y, { width: 80, align: "right" })
      doc.text(`£${previousBalance.toFixed(2)}`, 480, y, { width: 60, align: "right" })
      y += 12
    }

    if (order.deliveryCost > 0) {
      doc.text("Delivery Charge:", 420, y, { width: 80, align: "right" })
      doc.text(`£${Number(order.deliveryCost).toFixed(2)}`, 480, y, { width: 60, align: "right" })
      y += 12
    }

    doc.fontSize(10).font("Helvetica-Bold")
    doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(350, y).lineTo(555, y).stroke()
    y += 8

    const finalTotal = orderTotal + (previousBalance > 0 ? previousBalance : 0)
    doc.text("TOTAL:", 420, y, { width: 80, align: "right" })
    doc.text(`£${finalTotal.toFixed(2)}`, 480, y, { width: 60, align: "right" })

    // Footer - Add page numbers
    const pages = doc.bufferedPageRange()
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i)

      const footerY = 770 // Raised from 790 to avoid auto-page-break on margin
      doc.fontSize(9).font("Helvetica").fillColor("#1e3a8a")
      doc.text("Thank you for your business with HKS Foods Ltd", 0, footerY - 35, { align: "center" })

      doc.fontSize(7).fillColor("#666666")
      doc.text("payment within 3 days term", 0, footerY - 22, { align: "center" })

      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(40, footerY - 12).lineTo(555, footerY - 12).stroke()

      const footerContentY = footerY
      doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 40, footerContentY)

      doc.text(`HKS Foods Ltd | VAT Reg No: ${settings?.vatNumber || "495814839"} | Company No: ${settings?.companyNumber || "16372393"}`, 0, footerContentY, { align: "center" })

      // Add account info significantly below VAT info
      const accountInfo = []
      if (settings?.accountNumber) accountInfo.push(`Account No: ${settings.accountNumber}`)
      if (settings?.sortCode) accountInfo.push(`Sort Code: ${settings.sortCode}`)
      if (accountInfo.length > 0) {
        doc.text(accountInfo.join(' | '), 0, footerContentY + 10, { align: "center" })
      }

      doc.text(`Page ${i + 1} of ${pages.count}`, 515, footerContentY, { align: "right" })
    }

    doc.end()
  } catch (error) {
    console.error("Error exporting receipt:", error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error exporting receipt: " + error.message,
      })
    }
  }
}