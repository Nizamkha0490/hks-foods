// Add this at the top with other imports
import mongoose from "mongoose";

import Payment from "../models/Payment.js"
import Client from "../models/Client.js"
import Supplier from "../models/Supplier.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import Counter from "../models/Counter.js";
import PDFDocument from "pdfkit"
import Settings from "../models/Settings.js"

export const createPayment = asyncHandler(async (req, res) => {
  // Add this check at the start of the function
  if (!mongoose.models.Counter) {
    console.error('Counter model not registered');
    return res.status(500).json({
      success: false,
      message: "Server configuration error"
    });
  }
  console.log('Payment creation request received:', req.body);

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { clientId, supplierId, amount, paymentMethod } = req.body

  if (!amount || !paymentMethod || (!clientId && !supplierId)) {
    console.error('Missing required fields');
    return res.status(400).json({
      success: false,
      message: "Amount, payment method, and either client or supplier are required",
    })
  }

  try {
    // Client validation
    if (clientId) {
      const client = await Client.findOne({ _id: clientId, userId: req.admin._id })
      console.log('Client found:', client?._id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found",
        })
      }
    }

    // Supplier validation
    if (supplierId) {
      const supplier = await Supplier.findOne({ _id: supplierId, userId: req.admin._id })
      console.log('Supplier found:', supplier?._id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        })
      }
    }

    // Create payment
    const payment = await Payment.create({
      clientId: clientId || null,
      supplierId: supplierId || null,
      amount,
      paymentMethod,
      userId: req.admin._id,
    })
    console.log('Payment created:', payment._id);

    // Update client balances
    if (clientId) {
      console.log('Updating client balances with amount:', amount);

      // Use $inc to properly update the totalDues
      await Client.findByIdAndUpdate(clientId, {
        $inc: {
          totalDues: -amount  // This should be negative to reduce dues
        }
      }, { new: true });

      // Debug: Check updated client
      const updatedClient = await Client.findById(clientId);
      console.log('Updated client totalDues:', updatedClient.totalDues);
      console.log('Client balances updated');
    }

    // Update supplier balances
    if (supplierId) {
      console.log('Updating supplier balances with amount:', amount);

      // We increment totalCredit (Total Paid) by the amount
      // Balance will be calculated as totalDebit (Total Purchased) - totalCredit (Total Paid)
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: {
          totalCredit: amount
        }
      }, { new: true });
      console.log('Supplier balances updated');
    }

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
      totalDues: clientId ?
        (await Client.findById(clientId)).totalDues :
        (await Supplier.findById(supplierId)).totalDues
    })
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment: " + error.message,
    })
  }
})

export const deletePayment = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const payment = await Payment.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  })

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    })
  }

  if (payment.clientId) {
    await Client.findByIdAndUpdate(payment.clientId, {
      $inc: {
        totalDues: payment.amount  // Increase dues back when payment is deleted
      }
    })
  }

  if (payment.supplierId) {
    await Supplier.findByIdAndUpdate(payment.supplierId, {
      $inc: {
        totalCredit: -payment.amount  // Decrease credit when payment is deleted
      }
    })
  }

  await Payment.findByIdAndDelete(req.params.id)

  res.status(200).json({
    success: true,
    message: "Payment deleted successfully",
  })
})

export const getPaymentsByClient = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const payments = await Payment.find({
    clientId: req.params.clientId,
    userId: req.admin._id,
  }).sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    payments,
  })
})

export const getAllPayments = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const query = { userId: req.admin._id }

  if (req.query.supplierId) {
    query.supplierId = req.query.supplierId
  }

  if (req.query.clientId) {
    query.clientId = req.query.clientId
  }

  const payments = await Payment.find(query)
    .populate("clientId", "name")
    .populate("supplierId", "name")
    .sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    payments,
  })
})

export const updatePayment = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { id } = req.params
  const { amount, paymentMethod, date } = req.body

  const payment = await Payment.findOne({ _id: id, userId: req.admin._id })

  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found" })
  }

  // If amount changed, update balances
  if (amount !== undefined && amount !== payment.amount) {
    const amountDiff = amount - payment.amount

    if (payment.clientId) {
      await Client.findByIdAndUpdate(payment.clientId, {
        $inc: { totalDues: -amountDiff } // Reduce dues by the increase in payment
      })
    }

    if (payment.supplierId) {
      await Supplier.findByIdAndUpdate(payment.supplierId, {
        $inc: { totalCredit: amountDiff } // Increase credit (paid) by the increase in payment
      })
    }
  }

  // Update payment fields
  if (amount !== undefined) payment.amount = amount
  if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod
  if (date !== undefined) payment.createdAt = date // Allow updating date if needed

  await payment.save()

  res.status(200).json({
    success: true,
    message: "Payment updated successfully",
    payment,
  })
})

export const exportPaymentStatement = async (req, res) => {
  try {
    const { from, to, type } = req.query
    const query = { userId: req.admin._id }

    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(new Date(to).setHours(23, 59, 59))
      }
    }

    if (type === "creditor") {
      query.supplierId = { $exists: true }
    } else if (type === "debtor") {
      query.clientId = { $exists: true }
    }

    const payments = await Payment.find(query)
      .populate("clientId", "name")
      .populate("supplierId", "name")
      .sort({ createdAt: -1 })

    const doc = new PDFDocument({ margin: 40, size: "A4" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=payment-statement-${type || 'all'}.pdf`)

    doc.pipe(res)

    // Fetch settings
    const settings = await Settings.findOne({ userId: req.admin._id })

    // Header
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

    doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("PAYMENT STATEMENT", { align: "center" })

    if (from && to) {
      doc.fontSize(10).font("Helvetica").text(`Period: ${new Date(from).toLocaleDateString("en-GB")} - ${new Date(to).toLocaleDateString("en-GB")}`, { align: "center" })
    }

    doc.moveDown(1)

    // Table Header
    const tableTop = doc.y
    doc.fillColor("#1e3a8a").rect(40, tableTop, 515, 20).fill()
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")

    const dateX = 45
    const nameX = 120
    const methodX = 350
    const amountX = 480

    doc.text("DATE", dateX, tableTop + 7)
    doc.text("NAME", nameX, tableTop + 7)
    doc.text("METHOD", methodX, tableTop + 7)
    doc.text("AMOUNT", amountX, tableTop + 7)

    let y = tableTop + 25
    doc.fillColor("#000000").fontSize(9).font("Helvetica")

    let totalAmount = 0

    payments.forEach((payment, index) => {
      if (y > 750) {
        doc.addPage()
        y = 40
      }

      if (index % 2 === 0) {
        doc.fillColor("#f8fafc").rect(40, y - 3, 515, 16).fill()
        doc.fillColor("#000000")
      }

      const name = payment.clientId ? payment.clientId.name : (payment.supplierId ? payment.supplierId.name : "N/A")

      doc.text(new Date(payment.createdAt).toLocaleDateString("en-GB"), dateX, y)
      doc.text(name, nameX, y, { width: 220, ellipsis: true })
      doc.text(payment.paymentMethod, methodX, y)
      doc.text(`£${payment.amount.toFixed(2)}`, amountX, y)

      totalAmount += payment.amount
      y += 16
    })

    // Total
    y += 10
    doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(350, y).lineTo(555, y).stroke()
    y += 5
    doc.fontSize(10).font("Helvetica-Bold").text("TOTAL:", 400, y, { align: "right", width: 70 })
    doc.text(`£${totalAmount.toFixed(2)}`, amountX, y)

    doc.end()

  } catch (error) {
    console.error("Error exporting payment statement:", error)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Error exporting statement" })
    }
  }
}