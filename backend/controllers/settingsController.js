import Admin from "../models/Admin.js"
import Settings from "../models/Settings.js"
import Product from "../models/Product.js"
import Order from "../models/Order.js"
import Client from "../models/Client.js"
import Supplier from "../models/Supplier.js"
import Ledger from "../models/Ledger.js"
import CreditorDebtor from "../models/CreditorDebtor.js"
import Expense from "../models/Expense.js"

export const getSettings = async (req, res) => {
  console.log('🔧 GET SETTINGS - Request received');
  
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    let settings = await Settings.findOne({ userId: req.admin._id })
    if (!settings) {
      settings = await Settings.create({ userId: req.admin._id })
    }
    
    console.log('✅ GET SETTINGS - Success');
    res.json(settings)
  } catch (error) {
    console.error('❌ GET SETTINGS - Error:', error);
    res.status(500).json({ message: error.message })
  }
}

export const updateSettings = async (req, res) => {
  console.log('🔧 UPDATE SETTINGS - Request received');
  
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { warehouseName, address, city, postalCode, contactNumber, email, currency, taxRate, businessRegistration, vatNumber, companyNumber } =
      req.body

    let settings = await Settings.findOne({ userId: req.admin._id })
    if (!settings) {
      settings = await Settings.create({ userId: req.admin._id })
    }

    if (warehouseName) settings.warehouseName = warehouseName
    if (address) settings.address = address
    if (city) settings.city = city
    if (postalCode) settings.postalCode = postalCode
    if (contactNumber) settings.contactNumber = contactNumber
    if (email) settings.email = email
    if (currency) settings.currency = currency
    if (taxRate) settings.taxRate = taxRate
    if (businessRegistration) settings.businessRegistration = businessRegistration
    if (vatNumber) settings.vatNumber = vatNumber
    if (companyNumber) settings.companyNumber = companyNumber

    await settings.save()

    console.log('✅ UPDATE SETTINGS - Success');

    res.json({
      message: "Settings updated successfully",
      settings,
    })
  } catch (error) {
    console.error('❌ UPDATE SETTINGS - Error:', error);
    res.status(500).json({ message: error.message })
  }
}

// Change password
export const changePassword = async (req, res) => {
  console.log('🔧 CHANGE PASSWORD - Request received');
  
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" })
    }

    const admin = await Admin.findById(req.admin._id).select("+password")
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    // Check current password
    const isPasswordValid = await admin.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Update password
    admin.password = newPassword
    await admin.save()

    console.log('✅ CHANGE PASSWORD - Success');

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error('❌ CHANGE PASSWORD - Error:', error);
    res.status(500).json({ message: error.message })
  }
}

// Create backup
export const createBackup = async (req, res) => {
  console.log('🔧 CREATE BACKUP - Request received');
  
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const [products, orders, clients, suppliers, ledgers, creditorDebtors, expenses] = await Promise.all([
      Product.find({ userId: req.admin._id }),
      Order.find({ userId: req.admin._id }),
      Client.find({ userId: req.admin._id }),
      Supplier.find({ userId: req.admin._id }),
      Ledger.find({ userId: req.admin._id }),
      CreditorDebtor.find({ userId: req.admin._id }),
      Expense.find({ userId: req.admin._id }),
    ])

    const backupData = {
      products,
      orders,
      clients,
      suppliers,
      ledgers,
      creditorDebtors,
      expenses,
      exportDate: new Date().toISOString(),
    }

    console.log('✅ CREATE BACKUP - Success:', {
      products: products.length,
      orders: orders.length,
      clients: clients.length,
      suppliers: suppliers.length
    });

    res.json(backupData)
  } catch (error) {
    console.error('❌ CREATE BACKUP - Error:', error);
    res.status(500).json({ message: error.message })
  }
}
