import Client from "../models/Client.js";
import Order from "../models/Order.js";
import PDFDocument from "pdfkit";
import { asyncHandler } from "../middleware/errorHandler.js";
import Payment from "../models/Payment.js";
import Settings from "../models/Settings.js";

export const createClient = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required fields",
    });
  }

  const existingClient = await Client.findOne({
    email,
    userId: req.admin._id,
  });
  if (existingClient) {
    return res.status(400).json({
      success: false,
      message: "Client with this email already exists",
    });
  }

  const client = await Client.create({
    name,
    email,
    phone: phone || "",
    address: address || {},
    userId: req.admin._id,
  });

  res.status(201).json({
    success: true,
    message: "Client created successfully",
    client,
  });
});

export const getAllClients = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { search, limit = 99999, skip = 0 } = req.query;

  const query = { isActive: true, userId: req.admin._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { "address.street": { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
      { "address.postalCode": { $regex: search, $options: "i" } },
    ];
  }

  const total = await Client.countDocuments(query);
  const clients = await Client.find(query)
    .limit(Number.parseInt(limit))
    .skip(Number.parseInt(skip))
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    total,
    limit: Number.parseInt(limit),
    skip: Number.parseInt(skip),
    clients,
  });
});

export const getClientById = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const client = await Client.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Client not found",
    });
  }

  res.status(200).json({
    success: true,
    client,
  });
});

export const updateClient = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { name, email, phone, address } = req.body;

  let client = await Client.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Client not found",
    });
  }

  if (email && email !== client.email) {
    const existingClient = await Client.findOne({
      email,
      userId: req.admin._id,
    });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "Client with this email already exists",
      });
    }
  }

  client = await Client.findOneAndUpdate(
    { _id: req.params.id, userId: req.admin._id },
    {
      name: name || client.name,
      email: email || client.email,
      phone: phone !== undefined ? phone : client.phone,
      address: address || client.address,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Client updated successfully",
    client,
  });
});

export const deleteClient = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, userId: req.admin._id },
    { isActive: false },
    { new: true }
  );

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Client not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Client deleted successfully",
  });
});

// In clientController.js - check the getClientStats function
export const getClientStats = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const totalClients = await Client.countDocuments({
    isActive: true,
    userId: req.admin._id,
  });

  // FIX: This should calculate total dues from clients, not orders
  const clients = await Client.find({
    isActive: true,
    userId: req.admin._id,
  });

  const totalBalance = clients.reduce((sum, client) => {
    return sum + (client.totalDues || 0);
  }, 0);

  res.status(200).json({
    success: true,
    totalClients,
    totalBalance: totalBalance,
  });
});

export const getClientProfile = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const client = await Client.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Client not found",
    });
  }

  // Fetch transactions, payments, and credit notes in parallel
  const [transactions, payments, creditNotes] = await Promise.all([
    Order.find({
      clientId: req.params.id,
      userId: req.admin._id,
    }).sort({ createdAt: -1 }).lean(),
    Payment.find({
      clientId: req.params.id,
      userId: req.admin._id,
    }).lean(),
    (await import("../models/CreditNote.js")).default.find({
      clientId: req.params.id,
      userId: req.admin._id,
      isDeleted: false
    }).lean()
  ]);

  // Calculate dues from scratch - ONLY for "On Account" orders
  const totalInvoices = transactions.reduce((acc, o) => {
    if (o.invoiceType === 'on_account') {
      return acc + o.total;
    }
    return acc;
  }, 0);
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCreditNotes = creditNotes.reduce((acc, cn) => acc + cn.totalAmount, 0);

  // Allow negative dues (credit balance)
  const newDues = totalInvoices - totalPayments - totalCreditNotes;

  // Save corrected dues
  if (client.totalDues !== newDues) {
    client.totalDues = newDues;
    await client.save();
  }

  res.status(200).json({
    success: true,
    client,
    transactions,
    totalDues: newDues,
  });
});


export const exportClientStatement = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const client = await Client.findOne({
    _id: req.params.id,
    userId: req.admin._id,
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Client not found",
    });
  }

  // Get query parameters
  const { type = "all", from, to, invoiceType = "all" } = req.query;

  // Get transactions and payments with date filtering
  let transactionQuery = { clientId: req.params.id, userId: req.admin._id };
  let paymentQuery = { clientId: req.params.id, userId: req.admin._id };

  if (from && to) {
    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    transactionQuery.createdAt = { $gte: startDate, $lte: endDate };
    paymentQuery.createdAt = { $gte: startDate, $lte: endDate };
  }

  // Filter by invoice type if specified
  if (invoiceType && invoiceType !== "all") {
    transactionQuery.invoiceType = invoiceType;
  }

  const transactions = await Order.find(transactionQuery).sort({ createdAt: -1 });
  const payments = await Payment.find(paymentQuery).sort({ createdAt: -1 });
  const creditNotes = await (await import("../models/CreditNote.js")).default.find({
    clientId: req.params.id,
    userId: req.admin._id,
    isDeleted: false,
    ...(from && to ? { createdAt: { $gte: new Date(from), $lte: new Date(to) } } : {})
  }).sort({ createdAt: -1 }).lean();

  // Calculate totals
  // Calculate totals - ONLY for "On Account" orders for invoice total
  const totalInvoices = transactions.reduce((acc, o) => {
    if (o.invoiceType === 'on_account') {
      return acc + o.total;
    }
    return acc;
  }, 0);
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCreditNotes = creditNotes.reduce((acc, cn) => acc + cn.totalAmount, 0);
  const outstandingBalance = totalInvoices - totalPayments - totalCreditNotes;

  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");

  // Generate filename based on type and date range
  let filename = `statement-${client.name}`;
  if (type !== "all") filename += `-${type}`;
  if (from && to) filename += `-${from}-to-${to}`;
  filename += ".pdf";

  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  doc.pipe(res);

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
    .opacity(1);

  // Header Section
  const headerY = 40;

  // Fetch settings
  const settings = await Settings.findOne({ userId: req.admin._id });

  // Company Name and Details - Centered
  doc
    .fillColor("#1e3a8a")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(settings?.warehouseName || "HKS FOODS LTD", { align: "center" });

  doc
    .fillColor("#666666")
    .fontSize(9)
    .font("Helvetica")
    .text(settings?.address || "104 ANTHONY ROAD", { align: "center" })
    .text(settings?.postalCode || "BIRMINGHAM B83AA", { align: "center" })
    .text(
      `${settings?.contactNumber || "Tel:+44 7477 956299"} | VAT NUMBER: ${settings?.vatNumber || "495814839"} | Company No: ${settings?.companyNumber || "16372393"}`,
      { align: "center" }
    );

  // Statement Title based on type
  let statementTitle = "CLIENT STATEMENT";
  let statementSubtitle = "All Transactions";

  if (type === "invoices") {
    statementTitle = "INVOICE LIST";
    statementSubtitle = "Invoice Transactions Only";
  } else if (type === "payments") {
    statementTitle = "PAYMENT LIST";
    statementSubtitle = "Payment Transactions Only";
  } else if (type === "credit_notes") {
    statementTitle = "CREDIT NOTE LIST";
    statementSubtitle = "Credit Note Transactions Only";
  }

  // Add invoice type to subtitle if filtered
  if (invoiceType && invoiceType !== "all") {
    const invoiceTypeMap = {
      'on_account': 'On Account',
      'cash': 'Cash',
      'invoice': 'Invoice',
      'picking_list': 'Picking List',
      'proforma': 'Proforma'
    };
    const invoiceTypeLabel = invoiceTypeMap[invoiceType] || invoiceType;
    statementSubtitle += ` (${invoiceTypeLabel} Only)`;
  }

  doc.moveDown(0.5);
  doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text(statementTitle, { align: "center" });

  doc.moveDown(0.3);
  let dateRangeText = "All Transactions";
  if (from && to) {
    dateRangeText = `From ${new Date(from).toLocaleDateString("en-GB")} to ${new Date(to).toLocaleDateString("en-GB")}`;
  }
  doc
    .fontSize(10)
    .text(
      `${statementSubtitle} | ${dateRangeText} | Generated: ${new Date().toLocaleDateString("en-GB")}`,
      { align: "center" }
    );

  // Client Information Section
  const detailsY = doc.y + 15;

  // Client Details
  doc.fillColor("#1e3a8a").fontSize(10).font("Helvetica-Bold").text("CLIENT INFORMATION:", 40, detailsY);

  doc.fillColor("#000000").font("Helvetica").fontSize(9);
  let clientY = detailsY + 15;

  doc.text(`Name: ${client.name}`, 40, clientY);
  clientY += 12;
  doc.text(`Email: ${client.email}`, 40, clientY);
  clientY += 12;
  if (client.phone) {
    doc.text(`Phone: ${client.phone}`, 40, clientY);
    clientY += 12;
  }
  if (client.address) {
    let addressY = clientY;
    if (client.address.street) {
      doc.text(`Address: ${client.address.street}`, 40, addressY);
      addressY += 12;
    }
    const cityInfo = [client.address.city, client.address.postalCode].filter(Boolean).join(", ");
    if (cityInfo) {
      doc.text(cityInfo, 40, addressY);
    }
  }

  // Summary Section - Right Column
  const summaryX = 300;
  doc.fillColor("#1e3a8a").font("Helvetica-Bold").text("ACCOUNT SUMMARY:", summaryX, detailsY);

  doc
    .fillColor("#000000")
    .font("Helvetica")
    .fontSize(9);

  let summaryY = detailsY + 15;

  if (type === "all" || type === "invoices") {
    doc.text(`Total Invoices: ${transactions.length}`, summaryX, summaryY);
    summaryY += 12;
    doc.text(`Invoice Amount: £${totalInvoices.toFixed(2)}`, summaryX, summaryY);
    summaryY += 12;
  }

  if (type === "all" || type === "payments") {
    doc.text(`Total Payments: ${payments.length}`, summaryX, summaryY);
    summaryY += 12;
    doc.text(`Amount Paid: £${totalPayments.toFixed(2)}`, summaryX, summaryY);
    summaryY += 12;
  }

  if (type === "all" || type === "credit_notes") {
    doc.text(`Total Credit Notes: ${creditNotes.length}`, summaryX, summaryY);
    summaryY += 12;
    doc.text(`Credit Amount: £${totalCreditNotes.toFixed(2)}`, summaryX, summaryY);
    summaryY += 12;
  }

  if (type === "all") {
    doc.font("Helvetica-Bold").fillColor("#1e3a8a");
    doc.text(`Outstanding Balance: £${outstandingBalance.toFixed(2)}`, summaryX, summaryY);
  }

  let y = Math.max(clientY, summaryY + 25) + 15;

  // INVOICES SECTION (only for "all" or "invoices")
  if ((type === "all" || type === "invoices") && transactions.length > 0) {
    if (type === "all") {
      // Section header for invoices
      doc.fillColor("#1e3a8a").fontSize(12).font("Helvetica-Bold").text("INVOICES", 40, y);
      y += 20;
    }

    // Invoices Table Header
    doc.fillColor("#1e3a8a").rect(40, y, 515, 20).fill();
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");

    const invDateX = 45, invNoX = 100, invDescX = 180, invAmountX = 450;
    doc.text("DATE", invDateX, y + 7);
    doc.text("INVOICE NO", invNoX, y + 7);
    doc.text("DESCRIPTION", invDescX, y + 7);
    doc.text("AMOUNT", invAmountX, y + 7);

    // Invoices Table Rows
    doc.fillColor("#000000").fontSize(8).font("Helvetica");
    y += 25;

    transactions.forEach((transaction, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.fillColor("#f8fafc").rect(40, y - 3, 515, 16).fill();
        doc.fillColor("#000000");
      }

      doc.text(new Date(transaction.createdAt).toLocaleDateString("en-GB"), invDateX, y);
      doc.text(transaction.orderNo || "N/A", invNoX, y);
      doc.text(`Invoice ${transaction.orderNo}`, invDescX, y, { width: 250, align: "left" });
      doc.text(`£${transaction.total.toFixed(2)}`, invAmountX, y, { width: 50, align: "right" });

      y += 16;

      // Add page break if needed
      if (y > 650) {
        doc.addPage();
        y = 40;
      }
    });

    y += 10;
  }

  // PAYMENTS SECTION (only for "all" or "payments")
  if ((type === "all" || type === "payments") && payments.length > 0) {
    if (type === "all") {
      // Add separation line and section header for payments
      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(40, y).lineTo(555, y).stroke();
      y += 15;
      doc.fillColor("#1e3a8a").fontSize(12).font("Helvetica-Bold").text("PAYMENTS", 40, y);
      y += 20;
    }

    // Payments Table Header
    doc.fillColor("#1e3a8a").rect(40, y, 515, 20).fill();
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");

    const payDateX = 45, payNoX = 100, payDescX = 180, payMethodX = 350, payAmountX = 450;
    doc.text("DATE", payDateX, y + 7);
    doc.text("PAYMENT NO", payNoX, y + 7);
    doc.text("DESCRIPTION", payDescX, y + 7);
    doc.text("METHOD", payMethodX, y + 7);
    doc.text("AMOUNT", payAmountX, y + 7);

    // Payments Table Rows
    doc.fillColor("#000000").fontSize(8).font("Helvetica");
    y += 25;

    payments.forEach((payment, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.fillColor("#f8fafc").rect(40, y - 3, 515, 16).fill();
        doc.fillColor("#000000");
      }

      doc.text(new Date(payment.createdAt).toLocaleDateString("en-GB"), payDateX, y);
      doc.text(payment._id.toString().slice(-6), payNoX, y);
      doc.text(`Payment - ${payment.paymentMethod}`, payDescX, y, { width: 150, align: "left" });
      doc.text(payment.paymentMethod, payMethodX, y, { width: 80, align: "left" });
      doc.fillColor("#059669"); // Green for payments
      doc.text(`£${payment.amount.toFixed(2)}`, payAmountX, y, { width: 50, align: "right" });
      doc.fillColor("#000000");

      y += 16;

      // Add page break if needed
      if (y > 650) {
        doc.addPage();
        y = 40;
      }
    });

    y += 10;
  }

  // CREDIT NOTES SECTION (only for "all" or "credit_notes")
  if ((type === "all" || type === "credit_notes") && creditNotes.length > 0) {
    if (type === "all") {
      // Add separation line and section header for credit notes
      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(40, y).lineTo(555, y).stroke();
      y += 15;
      doc.fillColor("#1e3a8a").fontSize(12).font("Helvetica-Bold").text("CREDIT NOTES", 40, y);
      y += 20;
    }

    // Credit Notes Table Header
    doc.fillColor("#1e3a8a").rect(40, y, 515, 20).fill();
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");

    const cnDateX = 45, cnNoX = 100, cnOrderNoX = 200, cnTypeX = 350, cnAmountX = 450;
    doc.text("DATE", cnDateX, y + 7);
    doc.text("CREDIT NOTE NO", cnNoX, y + 7, { width: 90 });
    doc.text("REF ORDER", cnOrderNoX, y + 7, { width: 90 });
    doc.text("TYPE", cnTypeX, y + 7);
    doc.text("AMOUNT", cnAmountX, y + 7);

    // Credit Notes Table Rows
    doc.fillColor("#000000").fontSize(8).font("Helvetica");
    y += 25;

    creditNotes.forEach((cn, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.fillColor("#f8fafc").rect(40, y - 3, 515, 16).fill();
        doc.fillColor("#000000");
      }

      doc.text(new Date(cn.createdAt).toLocaleDateString("en-GB"), cnDateX, y);
      doc.text(cn.creditNoteNo || "N/A", cnNoX, y);
      doc.text(cn.orderNo || "-", cnOrderNoX, y);
      doc.text(cn.type.charAt(0).toUpperCase() + cn.type.slice(1), cnTypeX, y);

      doc.fillColor("#dc2626"); // Red for credit notes
      doc.text(`£${cn.totalAmount.toFixed(2)}`, cnAmountX, y, { width: 50, align: "right" });
      doc.fillColor("#000000");

      y += 16;

      // Add page break if needed
      if (y > 650) {
        doc.addPage();
        y = 40;
      }
    });

    y += 10;
  }

  // Show message if no data
  if ((type === "invoices" && transactions.length === 0) ||
    (type === "payments" && payments.length === 0) ||
    (type === "credit_notes" && creditNotes.length === 0) ||
    (type === "all" && transactions.length === 0 && payments.length === 0 && creditNotes.length === 0)) {
    doc.fillColor("#666666").fontSize(10).font("Helvetica")
      .text("No transactions found for the selected criteria.", 40, y, { align: "center" });
    y += 20;
  }

  // Final Summary Section (only for "all")
  if (type === "all") {
    y += 10;
    const summaryTop = y;

    doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(350, summaryTop).lineTo(555, summaryTop).stroke();
    y += 12;

    doc.fontSize(9).fillColor("#000000");
    doc.text("Total Invoiced:", 420, y, { width: 80, align: "right" });
    doc.text(`£${totalInvoices.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 12;

    doc.text("Total Paid:", 420, y, { width: 80, align: "right" });
    doc.text(`£${totalPayments.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 12;

    doc.text("Total Credit Notes:", 420, y, { width: 80, align: "right" });
    doc.text(`£${totalCreditNotes.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 12;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.strokeColor("#1e3a8a").lineWidth(1).moveTo(350, y).lineTo(555, y).stroke();
    y += 8;

    doc.text("Outstanding Balance:", 420, y, { width: 80, align: "right" });
    doc.text(`£${outstandingBalance.toFixed(2)}`, 500, y, { width: 50, align: "right" });
  }

  // Footer Section
  const footerY = Math.max(y + 30, 700);

  // Thank you message
  doc.fontSize(9).font("Helvetica").fillColor("#1e3a8a");
  doc.text("Thank you for your business with HKS Foods Ltd", { align: "center" });
  doc.moveDown(0.3);

  // Terms and conditions
  doc.fontSize(7).fillColor("#666666");
  doc.text("payment within 3 days term", { align: "center" });
  doc.moveDown(0.5);

  // Bottom separator line
  doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(40, footerY).lineTo(555, footerY).stroke();

  // Footer content
  const footerContentY = footerY + 8;

  // Left - Generation info
  doc
    .fontSize(7)
    .text(
      `Generated: ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}`,
      40,
      footerContentY,
    );

  // Center - Company info
  doc.text("HKS Foods Ltd | Registered in England | Company No: 16372393", { align: "center" });

  // Right - Page info
  doc.text("Page 1 of 1", 515, footerContentY, { align: "right" });

  // VAT info on second line
  doc.text("VAT Registration No: 495814839", { align: "center" });

  doc.end();
});