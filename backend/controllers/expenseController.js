import Expense from "../models/Expense.js"
import { asyncHandler } from "../middleware/errorHandler.js"

// Create Expense
export const createExpense = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { date, category, description, amount, paymentMethod, reference, notes } = req.body

  if (!date || !category || !description || !amount || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: date, category, description, amount, paymentMethod",
    })
  }

  const expense = await Expense.create({
    date: new Date(date),
    category,
    description,
    amount: Number(amount),
    paymentMethod,
    reference: reference || "",
    notes: notes || "",
    userId: req.admin._id,
  })

  res.status(201).json({
    success: true,
    message: "Expense created successfully",
    expense,
  })
})

// Get All Expenses with Filters and Pagination (owner-only)
export const getAllExpenses = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { category, paymentMethod, startDate, endDate, limit = 10000, skip = 0 } = req.query

  const query = { isActive: true, userId: req.admin._id }

  if (category) {
    query.category = category
  }

  if (paymentMethod) {
    query.paymentMethod = paymentMethod
  }

  if (startDate || endDate) {
    query.date = {}
    if (startDate) {
      query.date.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.date.$lte = end
    }
  }

  const total = await Expense.countDocuments(query)
  const expenses = await Expense.find(query)
    .limit(Number(limit))
    .skip(Number(skip))
    .sort({ date: -1, createdAt: -1 })

  res.status(200).json({
    success: true,
    total,
    limit: Number(limit),
    skip: Number(skip),
    expenses,
  })
})

// Get Expense by ID
export const getExpenseById = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const expense = await Expense.findOne({ _id: req.params.id, userId: req.admin._id })

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    })
  }

  res.status(200).json({
    success: true,
    expense,
  })
})

// Update Expense
export const updateExpense = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { date, category, description, amount, paymentMethod, reference, notes } = req.body

  let expense = await Expense.findOne({ _id: req.params.id, userId: req.admin._id })

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    })
  }

  if (date !== undefined) expense.date = new Date(date)
  if (category !== undefined) expense.category = category
  if (description !== undefined) expense.description = description
  if (amount !== undefined) expense.amount = Number(amount)
  if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod
  if (reference !== undefined) expense.reference = reference
  if (notes !== undefined) expense.notes = notes

  await expense.save()

  res.status(200).json({
    success: true,
    message: "Expense updated successfully",
    expense,
  })
})

// Delete Expense (Soft Delete)
export const deleteExpense = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.admin._id },
    { isActive: false },
    { new: true }
  )

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    })
  }

  res.status(200).json({
    success: true,
    message: "Expense deleted successfully",
  })
})

// Get Expense Summary (owner-only)
export const getExpenseSummary = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { category, startDate, endDate } = req.query

  const query = { isActive: true, userId: req.admin._id }

  if (category) {
    query.category = category
  }

  if (startDate || endDate) {
    query.date = {}
    if (startDate) {
      query.date.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.date.$lte = end
    }
  }

  const expenses = await Expense.find(query)

  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const byCategory = {}
  expenses.forEach((expense) => {
    if (!byCategory[expense.category]) {
      byCategory[expense.category] = 0
    }
    byCategory[expense.category] += expense.amount
  })

  res.status(200).json({
    success: true,
    summary: {
      totalExpense,
      expenseCount: expenses.length,
      byCategory,
    },
  })
})
