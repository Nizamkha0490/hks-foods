import Product from "../models/Product.js"
import { asyncHandler } from "../middleware/errorHandler.js"

// Create Product
export const createProduct = asyncHandler(async (req, res) => {
  console.log('🔧 CREATE PRODUCT - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { name, description, category, unit, costPrice, sellingPrice, stock, minStockLevel, supplier, vat, imageUrl, isPublic } = req.body

  if (!name || !category || !unit || !costPrice || !sellingPrice) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    })
  }

  try {
    // Generate automatic serial number for this user
    const lastProduct = await Product.findOne({ userId: req.admin._id })
      .sort({ createdAt: -1 })
      .select('serialNo')

    let nextSerialNo = 1
    if (lastProduct && lastProduct.serialNo) {
      // Extract number from existing serialNo and increment
      const lastNumber = parseInt(lastProduct.serialNo) || 0
      nextSerialNo = lastNumber + 1
    }

    let product;
    let attempts = 0;
    const maxAttempts = 10;

    // Try to create product with automatic serial number
    while (attempts < maxAttempts) {
      try {
        product = await Product.create({
          serialNo: nextSerialNo.toString(),
          name,
          description,
          category,
          unit,
          costPrice,
          sellingPrice,
          stock: stock || 0,
          minStockLevel: minStockLevel || 50,
          supplier,
          supplier,
          vat: vat,
          imageUrl: imageUrl || "",
          isPublic: isPublic !== undefined ? isPublic : true,
          userId: req.admin._id,
        });
        break; // Success, exit loop
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - try next serial number
          console.log(`🔄 Duplicate serialNo ${nextSerialNo}, trying next number`);
          nextSerialNo++;
          attempts++;
          if (attempts >= maxAttempts) {
            return res.status(500).json({
              success: false,
              message: 'Failed to generate unique serial number after multiple attempts. Please try again.'
            });
          }
        } else {
          // Other errors - rethrow
          throw error;
        }
      }
    }

    console.log('✅ CREATE PRODUCT - Success:', product._id, 'Serial No:', product.serialNo, 'VAT:', product.vat);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    })
  } catch (error) {
    console.error('❌ CREATE PRODUCT - Error:', error);
    res.status(500).json({
      success: false,
      message: "Error creating product: " + error.message
    });
  }
})

// Get All Products with Search, Filter, and Pagination
export const getAllProducts = asyncHandler(async (req, res) => {
  console.log('🔧 GET ALL PRODUCTS - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { search, category, limit = 999999, skip = 0 } = req.query

  const query = { userId: req.admin._id }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { serialNo: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ]
  }

  if (category) {
    query.category = category
  }

  const total = await Product.countDocuments(query)
  const products = await Product.find(query)
    .populate("supplier", "name email phone")
    .limit(Number.parseInt(limit))
    .skip(Number.parseInt(skip))
    .sort({ createdAt: -1 })
    .lean()

  console.log('✅ GET ALL PRODUCTS - Success:', products.length, 'products found');

  res.status(200).json({
    success: true,
    total,
    limit: Number.parseInt(limit),
    skip: Number.parseInt(skip),
    products,
  })
})

// Get Product by ID
export const getProductById = asyncHandler(async (req, res) => {
  console.log('🔧 GET PRODUCT BY ID - Request received:', req.params.id);

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const product = await Product.findOne({ _id: req.params.id, userId: req.admin._id }).populate("supplier", "name email phone")

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }

  console.log('✅ GET PRODUCT BY ID - Success:', product._id);

  res.status(200).json({
    success: true,
    product,
  })
})

// Update Product
export const updateProduct = asyncHandler(async (req, res) => {
  console.log('🔧 UPDATE PRODUCT - Request received:', req.params.id);

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { name, description, category, unit, costPrice, sellingPrice, stock, minStockLevel, supplier, vat, imageUrl, isPublic } = req.body

  let product = await Product.findOne({ _id: req.params.id, userId: req.admin._id })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }

  // Update product with VAT field
  product = await Product.findOneAndUpdate(
    { _id: req.params.id, userId: req.admin._id },
    {
      name: name || product.name,
      description: description || product.description,
      category: category || product.category,
      unit: unit || product.unit,
      costPrice: costPrice || product.costPrice,
      sellingPrice: sellingPrice || product.sellingPrice,
      stock: stock !== undefined ? stock : product.stock,
      minStockLevel: minStockLevel || product.minStockLevel,
      supplier: supplier || product.supplier,
      supplier: supplier || product.supplier,
      vat: vat,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
      isPublic: isPublic !== undefined ? isPublic : product.isPublic,
    },
    { new: true },
  )

  console.log('✅ UPDATE PRODUCT - Success:', product._id, 'VAT:', product.vat);

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  })
})

// Delete Product (Soft Delete)
export const deleteProduct = asyncHandler(async (req, res) => {
  console.log('🔧 DELETE PRODUCT - Request received:', req.params.id);

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.admin._id })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }

  console.log('✅ DELETE PRODUCT - Success:', req.params.id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  })
})

// Get Low Stock Products
export const getLowStockProducts = asyncHandler(async (req, res) => {
  console.log('🔧 GET LOW STOCK PRODUCTS - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const products = await Product.find({
    userId: req.admin._id,
    $expr: { $lt: ["$stock", "$minStockLevel"] },
  }).sort({ stock: 1 })

  console.log('✅ GET LOW STOCK PRODUCTS - Success:', products.length, 'low stock products');

  res.status(200).json({
    success: true,
    total: products.length,
    products,
  })
})

// Update Stock
export const updateStock = asyncHandler(async (req, res) => {
  console.log('🔧 UPDATE STOCK - Request received:', req.params.id);

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { quantity, operation } = req.body

  if (!quantity || !operation) {
    return res.status(400).json({
      success: false,
      message: "Please provide quantity and operation (add/subtract)",
    })
  }

  const product = await Product.findOne({ _id: req.params.id, userId: req.admin._id })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }

  if (operation === "add") {
    product.stock += quantity
  } else if (operation === "subtract") {
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      })
    }
    product.stock -= quantity
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid operation. Use 'add' or 'subtract'",
    })
  }

  await product.save()

  console.log('✅ UPDATE STOCK - Success:', product._id, 'New stock:', product.stock);

  res.status(200).json({
    success: true,
    message: "Stock updated successfully",
    product,
  })
})
