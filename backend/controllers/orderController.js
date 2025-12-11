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

    const doc = new PDFDocument({ margin: 40, size: "A4" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="receipt-${order.orderNo}.pdf"`)

    doc.pipe(res)

    // Add centered watermark background with two lines
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

    // Header Section
    const headerY = 40

    // Fetch settings
    const settings = await Settings.findOne({ userId: req.admin._id })


    // Company Name and Details - Centered
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

    // Receipt Title and Order Info
    doc.moveDown(0.5)
    doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
    doc.moveDown(0.5)
    // doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("TAX INVOICE", { align: "center" })

    doc.moveDown(0.3)
    doc
      .fontSize(10)
      .text(
        `Order Number: ${order.orderNo} | Date: ${new Date(order.createdAt).toLocaleDateString("en-GB")} | Status: ${order.status.toUpperCase()}`,
        { align: "center" },
      )

    // Client and Order Details
    const detailsY = doc.y + 15

    // Two column layout - ADJUSTED for stamp
    const leftColumnX = 40
    const rightColumnX = 280  // Moved left to make room for stamp

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

    // Order Details - Right Column (shifted left)
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

    // Add Company Stamp to the right of ORDER INFORMATION
    try {
      const stampPath = path.join(__dirname, '../assets/paid_stamp.png')
      const stampX = 460  // Right side position
      const stampY = detailsY - 20
      const stampWidth = 80
      const stampHeight = 80

      doc.image(stampPath, stampX, stampY, {
        width: stampWidth,
        height: stampHeight,
        align: 'right'
      })
    } catch (stampError) {
      console.log("Stamp image not found, skipping:", stampError.message)
    }

    // Items Table - Start at appropriate position
    const tableTop = Math.max(clientY, detailsY + 90) + 15

    // Table Header with dark blue background - UPDATED with VAT column
    doc.fillColor("#1e3a8a").rect(40, tableTop, 515, 20).fill()

    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")

    const itemX = 45
    const descX = 70
    const qtyX = 310
    const priceX = 360
    const vatX = 420
    const totalX = 480

    doc.text("#", itemX, tableTop + 7)
    doc.text("DESCRIPTION", descX, tableTop + 7)
    doc.text("QTY", qtyX, tableTop + 7)
    doc.text("PRICE", priceX, tableTop + 7)
    doc.text("VAT", vatX, tableTop + 7)
    doc.text("AMOUNT", totalX, tableTop + 7)


    // Table Rows - UPDATED with VAT column
    doc.fillColor("#000000").fontSize(8).font("Helvetica")

    let y = tableTop + 25
    let subtotal = 0
    let totalVAT = 0
    const vatBreakdown = {}

    // Process products with VAT
    order.lines.forEach((line, index) => {
      const productName = line.productId?.name || line.productName || "Unknown Product"
      const qty = Number(line.qty) || 0
      const price = Number(line.price) || 0
      let lineTotal = qty * price

      // Calculate VAT for products only (not delivery)
      // Explicitly check for undefined/null to allow 0% VAT
      const vatRate = line.productId?.vat !== undefined && line.productId?.vat !== null ? line.productId.vat : 20
      const vatAmount = lineTotal * (vatRate / 100)

      if (order.includeVAT) {
        totalVAT += vatAmount
        lineTotal += vatAmount
        if (!vatBreakdown[vatRate]) vatBreakdown[vatRate] = 0
        vatBreakdown[vatRate] += vatAmount
      }

      subtotal += lineTotal

      // Alternate row background
      if (index % 2 === 0) {
        doc
          .fillColor("#f8fafc")
          .rect(40, y - 3, 515, 16)
          .fill()
        doc.fillColor("#000000")
      }

      doc.text(`${index + 1}`, itemX, y)
      doc.text(productName, descX, y, { width: 220, align: "left" })
      doc.text(qty.toString(), qtyX, y, { width: 35, align: "right" })
      doc.text(`£${price.toFixed(2)}`, priceX, y, { width: 45, align: "right" })

      // VAT Value Column - show VAT amount
      if (order.includeVAT) {
        doc.text(`£${vatAmount.toFixed(2)}`, vatX, y, { width: 45, align: "right" })
      } else {
        doc.text("-", vatX, y, { width: 45, align: "right" })
      }

      doc.text(`£${lineTotal.toFixed(2)}`, totalX, y, { width: 60, align: "right" })

      y += 16
    })



    // Summary Section
    y += 10
    const summaryTop = y

    doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(350, summaryTop).lineTo(555, summaryTop).stroke()
    y += 12

    // Total VAT - Always show, even if 0 (BEFORE Subtotal)
    doc.fontSize(9)
    const vatAmount = order.includeVAT ? totalVAT : 0
    doc.text("Total VAT:", 420, y, { width: 80, align: "right" })
    doc.text(`£${vatAmount.toFixed(2)}`, totalX, y, { width: 60, align: "right" })
    y += 12

    // Subtotal (Products only - before VAT)
    const subtotalBeforeVAT = order.lines.reduce((sum, line) => {
      const lineTotal = (Number(line.qty) || 0) * (Number(line.price) || 0)
      return sum + lineTotal
    }, 0)

    doc.text("Subtotal:", 420, y, { width: 80, align: "right" })
    doc.text(`£${subtotalBeforeVAT.toFixed(2)}`, totalX, y, { width: 60, align: "right" })
    y += 12

    // Calculate order total (before previous balance) for use in previous balance calculation
    const orderTotal = subtotal + (Number(order.deliveryCost) || 0)

    // Previous Balance - Calculate based on order type
    const clientTotalDues = client?.totalDues || 0
    let previousBalance = 0

    // If this is an on_account order, the current order total is already in totalDues
    // So we need to subtract it to show only the previous balance
    if (order.invoiceType === 'on_account') {
      previousBalance = clientTotalDues - orderTotal
    } else {
      // For other payment types, show the full totalDues as previous balance
      previousBalance = clientTotalDues
    }

    // Only show previous balance if it exists and is greater than 0
    if (previousBalance > 0) {
      doc.text("Previous Balance:", 420, y, { width: 80, align: "right" })
      doc.text(`£${previousBalance.toFixed(2)}`, totalX, y, { width: 60, align: "right" })
      y += 12
    }

    // Delivery Cost - NO VAT
    if (order.deliveryCost && order.deliveryCost > 0) {
      const deliveryTotal = Number(order.deliveryCost) // No VAT on delivery

      doc.text("Delivery Charge:", 420, y, { width: 80, align: "right" })
      doc.text(`£${deliveryTotal.toFixed(2)}`, totalX, y, { width: 60, align: "right" })
      y += 12
    }

    // Total - Includes products, delivery, and previous balance
    doc.fontSize(10).font("Helvetica-Bold")
    doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(350, y).lineTo(555, y).stroke()
    y += 8

    // Calculate final total including delivery and previous balance
    const finalTotal = orderTotal + (previousBalance > 0 ? previousBalance : 0)
    doc.text("TOTAL:", 420, y, { width: 80, align: "right" })
    doc.text(`£${finalTotal.toFixed(2)}`, totalX, y, { width: 60, align: "right" })

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

    // Footer content - moved down for better spacing
    const footerContentY = footerY + 12

    // Left - Generation info
    doc
      .fontSize(7)
      .text(
        `Generated: ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}`,
        40,
        footerContentY,
      )

    // Center - Company info
    doc.text(`HKS Foods Ltd | VAT Reg No: ${settings?.vatNumber || "495814839"} | Company No: ${settings?.companyNumber || "16372393"}`, 0, footerContentY, { align: "center" })

    // Account details on next line
    const accountInfo = []
    if (settings?.accountNumber) accountInfo.push(`Account No: ${settings.accountNumber}`)
    if (settings?.sortCode) accountInfo.push(`Sort Code: ${settings.sortCode}`)

    if (accountInfo.length > 0) {
      doc.text(accountInfo.join(' | '), 0, footerContentY + 10, { align: "center" })
    }

    // Right - Page info
    doc.text("Page 1 of 1", 515, footerContentY, { align: "right" })

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