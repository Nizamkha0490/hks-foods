import Supplier from "../models/Supplier.js";
import Client from "../models/Client.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createCreditorDebtor = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { name, type, balance } = req.body;

  if (!name || !type || balance === undefined) {
    return res.status(400).json({
      success: false,
      message: "Name, type, and balance are required",
    });
  }

  let entity;
  if (type === "Creditor") {
    entity = await Supplier.create({
      name,
      userId: req.admin._id,
      totalDebit: balance,
    });
  } else {
    entity = await Client.create({
      name,
      userId: req.admin._id,
      totalDebit: balance,
    });
  }

  res.status(201).json({
    success: true,
    message: "Entry created successfully",
    entity,
  });
});

// Get All Entries (only for current admin)
export const getAllCreditorDebtors = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const suppliers = await Supplier.find({ userId: req.admin._id }).lean();
  const clients = await Client.find({ userId: req.admin._id }).lean();

  const creditors = suppliers.map((s) => ({
    _id: s._id,
    name: s.name,
    type: "Creditor",
    balance: (s.totalDebit || 0) - (s.totalCredit || 0),
  }));

  const debtors = clients.map((c) => ({
    _id: c._id,
    name: c.name,
    type: "Debtor",
    balance: (c.totalDebit || 0) - (c.totalCredit || 0),
  }));

  const creditorDebtors = [...creditors, ...debtors];

  res.status(200).json({
    success: true,
    creditorDebtors,
  });
});

// Generate Creditor/Debtor Statement
export const getCreditorDebtorStatement = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { from, to } = req.query;
  let query = { userId: req.admin._id };

  if (from && to) {
    query.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  const suppliers = await Supplier.find(query).lean();
  const clients = await Client.find(query).lean();

  const creditors = suppliers.map((s) => ({
    _id: s._id,
    name: s.name,
    type: "Creditor",
    balance: (s.totalDebit || 0) - (s.totalCredit || 0),
  }));

  const debtors = clients.map((c) => ({
    _id: c._id,
    name: c.name,
    type: "Debtor",
    balance: (c.totalDebit || 0) - (c.totalCredit || 0),
  }));

  const entries = [...creditors, ...debtors];

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=creditor-debtor-statement.pdf`);
  doc.pipe(res);

  // PDF content...
  doc.fontSize(20).text("Creditor/Debtor Statement", { align: "center" });
  doc.fontSize(12).text(`Date Range: ${from ? new Date(from).toLocaleDateString() : 'N/A'} - ${to ? new Date(to).toLocaleDateString() : 'N/A'}`);
  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  doc.font("Helvetica-Bold");
  doc.text("Name", 40, tableTop);
  doc.text("Type", 280, tableTop);
  doc.text("Balance", 500, tableTop, { align: "right" });
  doc.font("Helvetica");
  doc.y += 20;

  // Table rows
  entries.forEach(entry => {
    const y = doc.y;
    doc.text(entry.name, 40, y);
    doc.text(entry.type, 280, y);
    doc.text(`£${entry.balance.toFixed(2)}`, 500, y, { align: "right" });
    doc.y += 20;
  });

  doc.end();
});

// Update Entry (ensures ownership)
export const updateCreditorDebtor = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { id } = req.params;
  const {
    amount,
    paidAmount,
    description,
    dueDate,
    reference,
    notes,
    remainingBalance,
    paymentMethod,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid entry ID" });
    }

    const creditorDebtor = await CreditorDebtor.findOne({ _id: id, userId: req.admin._id });
    if (!creditorDebtor) {
      return res.status(404).json({ success: false, message: "Creditor/Debtor entry not found" });
    }

    // Ensure entity/entityModel present
    if (!creditorDebtor.entity || creditorDebtor.entity === null) {
      creditorDebtor.entity = new mongoose.Types.ObjectId();
    }
    if (!creditorDebtor.entityModel) {
      creditorDebtor.entityModel = creditorDebtor.type === "creditor" ? "Supplier" : "Client";
    }

    // Store original values (for logging/debug)
    const originalValues = {
      amount: creditorDebtor.amount,
      paidAmount: creditorDebtor.paidAmount,
      remainingBalance: creditorDebtor.remainingBalance,
    };

    // Update fields
    if (amount !== undefined) creditorDebtor.amount = Number(amount);
    if (description !== undefined) creditorDebtor.description = description;
    if (dueDate !== undefined) creditorDebtor.dueDate = dueDate;
    if (reference !== undefined) creditorDebtor.reference = reference;
    if (notes !== undefined) creditorDebtor.notes = notes;
    if (paidAmount !== undefined) creditorDebtor.paidAmount = Number(paidAmount);
    if (remainingBalance !== undefined && remainingBalance !== "") {
      creditorDebtor.remainingBalance = Number(remainingBalance);
    }
     if (paymentMethod !== undefined) creditorDebtor.paymentMethod = paymentMethod; // ADD THIS


    // Recalculate relationships
    if (remainingBalance !== undefined && remainingBalance !== "" && paidAmount !== undefined) {
      creditorDebtor.paidAmount = Math.max(0, creditorDebtor.amount - creditorDebtor.remainingBalance);
    } else if (remainingBalance !== undefined && remainingBalance !== "") {
      creditorDebtor.paidAmount = Math.max(0, creditorDebtor.amount - creditorDebtor.remainingBalance);
    } else if (paidAmount !== undefined) {
      creditorDebtor.remainingBalance = Math.max(0, creditorDebtor.amount - creditorDebtor.paidAmount);
    } else {
      creditorDebtor.remainingBalance = Math.max(0, creditorDebtor.amount - creditorDebtor.paidAmount);
    }

    if (creditorDebtor.remainingBalance <= 0) {
      creditorDebtor.status = "paid";
      creditorDebtor.remainingBalance = 0;
      creditorDebtor.paidAmount = creditorDebtor.amount;
    } else if (creditorDebtor.paidAmount > 0) {
      creditorDebtor.status = "partial";
    } else {
      creditorDebtor.status = "pending";
    }

    if (creditorDebtor.paidAmount > creditorDebtor.amount) {
      creditorDebtor.paidAmount = creditorDebtor.amount;
      creditorDebtor.remainingBalance = 0;
      creditorDebtor.status = "paid";
    }
    if (creditorDebtor.remainingBalance < 0) {
      creditorDebtor.remainingBalance = 0;
    }

    const updatedEntry = await creditorDebtor.save();

    res.status(200).json({
      success: true,
      message: "Creditor/Debtor entry updated successfully",
      creditorDebtor: updatedEntry,
    });
  } catch (error) {
    console.error("UPDATE - Error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation failed for creditor/debtor entry",
        error: error.message,
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while updating entry",
      error: error.message,
    });
  }
});

// Delete Entry (owner-only)
export const deleteCreditorDebtor = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid entry ID" });
    }

    const creditorDebtor = await CreditorDebtor.findOneAndDelete({ _id: id, userId: req.admin._id });

    if (!creditorDebtor) {
      return res.status(404).json({ success: false, message: "Creditor/Debtor entry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Creditor/Debtor entry deleted successfully",
    });
  } catch (error) {
    console.error("DELETE - Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting entry",
      error: error.message,
    });
  }
});

// Get by ID (owner-only)
export const getCreditorDebtorById = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid entry ID" });
    }

    const creditorDebtor = await CreditorDebtor.findOne({ _id: id, userId: req.admin._id }).populate(
      "entity",
      "name email phone"
    );

    if (!creditorDebtor) {
      return res.status(404).json({
        success: false,
        message: "Creditor/Debtor entry not found",
      });
    }

    res.status(200).json({
      success: true,
      creditorDebtor,
    });
  } catch (error) {
    console.error("GET BY ID - Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching entry",
      error: error.message,
    });
  }
});

// Summary Route (owner-only)
export const getCreditorDebtorSummary = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { type } = req.query;

  try {
    const query = { userId: req.admin._id };
    if (type) query.type = type;

    const entries = await CreditorDebtor.find(query);

    const totalAmount = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPaid = entries.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
    const totalRemaining = entries.reduce((sum, e) => sum + (e.remainingBalance || 0), 0);

    const pending = entries.filter((e) => e.status === "pending").length;
    const partial = entries.filter((e) => e.status === "partial").length;
    const paid = entries.filter((e) => e.status === "paid").length;

    res.status(200).json({
      success: true,
      summary: {
        totalAmount,
        totalPaid,
        totalRemaining,
        totalPending: totalAmount - totalPaid,
        statusCount: { pending, partial, paid },
        totalEntries: entries.length,
      },
    });
  } catch (error) {
    console.error("SUMMARY - Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating summary",
      error: error.message,
    });
  }
});

// Optional: fixExistingRecords - requires owner (or super admin may call)
export const fixExistingRecords = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const brokenRecords = await CreditorDebtor.find({
      userId: req.admin._id,
      $or: [
        { entity: null },
        { entityModel: { $exists: false } },
        { entityModel: null }
      ]
    });

    let fixedCount = 0;

    for (const record of brokenRecords) {
      if (!record.entity || record.entity === null) {
        record.entity = new mongoose.Types.ObjectId();
      }
      if (!record.entityModel) {
        record.entityModel = record.type === "creditor" ? "Supplier" : "Client";
      }
      await record.save();
      fixedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Successfully fixed ${fixedCount} records`,
      fixedCount
    });
  } catch (error) {
    console.error("FIX - Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fixing existing records",
      error: error.message
    });
  }
});
