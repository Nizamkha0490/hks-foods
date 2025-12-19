import Order from "../models/Order.js"
import Ledger from "../models/Ledger.js"
import Expense from "../models/Expense.js"
import Product from "../models/Product.js"
import Client from "../models/Client.js"
import Supplier from "../models/Supplier.js"
import { asyncHandler } from "../middleware/errorHandler.js"

// Get Sales Report
export const getSalesReport = asyncHandler(async (req, res) => {
  console.log('🔧 GET SALES REPORT - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query

  const query = { userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const orders = await Order.find(query).populate("clientId", "name email")

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

  const byStatus = {}
  orders.forEach((order) => {
    if (!byStatus[order.status]) {
      byStatus[order.status] = 0
    }
    byStatus[order.status] += 1
  })

  console.log('✅ GET SALES REPORT - Success:', totalOrders, 'orders analyzed');

  res.status(200).json({
    success: true,
    report: {
      totalSales,
      totalOrders,
      averageOrderValue,
      byStatus,
      orders,
    },
  })
})

// Get Daily Report
export const getDailyReport = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query
  const query = { userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const orders = await Order.find(query)
    .populate("clientId", "name")
    .populate("lines.productId", "name vat")
    .sort({ createdAt: -1 })

  const reportData = []

  orders.forEach((order) => {
    // Calculate totals for the order
    let sellingPrice = 0
    let vatValue = 0

    order.lines.forEach((line) => {
      const qty = Number(line.qty) || 0
      const price = Number(line.price) || 0
      const lineTotal = qty * price
      sellingPrice += lineTotal

      if (order.includeVAT && line.productId) {
        const vatRate = line.productId.vat !== undefined && line.productId.vat !== null ? line.productId.vat : 20
        vatValue += lineTotal * (vatRate / 100)
      }
    })

    // Add delivery cost to selling price
    if (order.deliveryCost) {
      sellingPrice += Number(order.deliveryCost)
    }

    const total = sellingPrice + vatValue

    reportData.push({
      Date: new Date(order.createdAt).toLocaleDateString(),
      "Customer Name": order.clientId?.name || "Unknown",
      "Invoice/Order No": order.orderNo || order._id.toString().slice(-6),
      Type: order.invoiceType || "Sale",
      "Selling Price": sellingPrice.toFixed(2),
      "VAT Value": vatValue.toFixed(2),
      Total: total.toFixed(2),
    })
  })

  res.status(200).json({
    success: true,
    report: reportData,
  })
})

// Get Monthly Report
export const getMonthlyReport = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query
  const query = { userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const orders = await Order.find(query)
    .populate("clientId", "name")
    .populate("lines.productId", "name vat")
    .sort({ createdAt: -1 })

  const reportData = []

  orders.forEach((order) => {
    let sellingPrice = 0
    let vatValue = 0

    order.lines.forEach((line) => {
      const qty = Number(line.qty) || 0
      const price = Number(line.price) || 0
      const lineTotal = qty * price
      sellingPrice += lineTotal

      if (order.includeVAT && line.productId) {
        const vatRate = line.productId.vat !== undefined && line.productId.vat !== null ? line.productId.vat : 20
        vatValue += lineTotal * (vatRate / 100)
      }
    })

    if (order.deliveryCost) {
      sellingPrice += Number(order.deliveryCost)
    }

    const total = sellingPrice + vatValue

    reportData.push({
      Date: new Date(order.createdAt).toLocaleDateString(),
      "Customer Name": order.clientId?.name || "Unknown",
      "Invoice/Order No": order.orderNo || order._id.toString().slice(-6),
      Type: order.invoiceType || "Sale",
      "Selling Price": sellingPrice.toFixed(2),
      "VAT Value": vatValue.toFixed(2),
      Total: total.toFixed(2),
    })
  })

  res.status(200).json({
    success: true,
    report: reportData,
  })
})

// Get Yearly Report
export const getYearlyReport = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query
  const query = { userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const orders = await Order.find(query)
    .populate("clientId", "name")
    .populate("lines.productId", "name vat")
    .sort({ createdAt: -1 })

  const reportData = []

  orders.forEach((order) => {
    let sellingPrice = 0
    let vatValue = 0

    order.lines.forEach((line) => {
      const qty = Number(line.qty) || 0
      const price = Number(line.price) || 0
      const lineTotal = qty * price
      sellingPrice += lineTotal

      if (order.includeVAT && line.productId) {
        const vatRate = line.productId.vat !== undefined && line.productId.vat !== null ? line.productId.vat : 20
        vatValue += lineTotal * (vatRate / 100)
      }
    })

    if (order.deliveryCost) {
      sellingPrice += Number(order.deliveryCost)
    }

    const total = sellingPrice + vatValue

    reportData.push({
      Date: new Date(order.createdAt).toLocaleDateString(),
      "Customer Name": order.clientId?.name || "Unknown",
      "Invoice/Order No": order.orderNo || order._id.toString().slice(-6),
      Type: order.invoiceType || "Sale",
      "Selling Price": sellingPrice.toFixed(2),
      "VAT Value": vatValue.toFixed(2),
      Total: total.toFixed(2),
    })
  })

  res.status(200).json({
    success: true,
    report: reportData,
  })
})

// Get Stock Report
export const getStockReport = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query
  const query = { isActive: true, userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const products = await Product.find(query)
    .populate("supplier", "name")
    .sort({ createdAt: -1 })

  const reportData = products.map((product) => {
    const costPrice = Number(product.costPrice) || 0
    const sellingPrice = Number(product.sellingPrice) || 0
    const vatRate = product.vat !== undefined && product.vat !== null ? Number(product.vat) : 20
    const vatValue = sellingPrice * (vatRate / 100)
    const sellingWVAT = sellingPrice + vatValue
    const profitLoss = sellingPrice - costPrice

    return {
      Date: new Date(product.createdAt).toLocaleDateString(),
      "Cost Price": costPrice.toFixed(2),
      "Selling Price": sellingPrice.toFixed(2),
      SellingWVAT: sellingWVAT.toFixed(2),
      "VAT Value": vatValue.toFixed(2),
      "Profit/Loss": profitLoss.toFixed(2),
    }
  })

  res.status(200).json({
    success: true,
    report: reportData,
  })
})

// Get Product Report
export const getProductReport = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query
  const query = { isActive: true, userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const products = await Product.find(query)
    .populate("supplier", "name")
    .sort({ name: 1 })

  const reportData = products.map((product, index) => ({
    "Sr No.": index + 1,
    "Product Name": product.name || "Unknown",
    Category: product.category || "Uncategorized",
    Unit: product.unit || "N/A",
    "Current Stock": product.stock || 0,
    "VAT%": product.vat !== undefined && product.vat !== null ? product.vat : 20,
  }))

  res.status(200).json({
    success: true,
    report: reportData,
  })
})

// Get Product Sale Report
export const getProductSaleReport = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query
  const query = { userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const orders = await Order.find(query)
    .populate("clientId", "name")
    .populate("lines.productId", "name vat")
    .sort({ createdAt: -1 })

  const reportData = []

  orders.forEach((order) => {
    order.lines.forEach((line) => {
      if (line.productId) {
        const qty = Number(line.qty) || 0
        const price = Number(line.price) || 0
        let lineTotal = qty * price

        // Calculate VAT
        const vatRate = line.productId.vat !== undefined && line.productId.vat !== null ? line.productId.vat : 20
        const vatValue = lineTotal * (vatRate / 100)

        let total = lineTotal
        let finalVat = 0

        if (order.includeVAT) {
          total += vatValue
          finalVat = vatValue
        }

        reportData.push({
          Date: new Date(order.createdAt).toLocaleDateString(),
          "Customer Name": order.clientId?.name || "Unknown",
          "Invoice/Order No": order.orderNo || order._id.toString().slice(-6),
          Type: order.invoiceType || "Sale",
          "Selling Price": lineTotal.toFixed(2),
          "VAT Value": finalVat.toFixed(2),
          Total: total.toFixed(2),
          // Keep raw values for sorting/calcs if needed, but user asked for specific headers
          // We can send both or just the formatted object. 
          // The frontend uses generic keys, so sending formatted keys works well with the new requirement.
        })
      }
    })
  })

  res.status(200).json({
    success: true,
    report: reportData,
  })
})

// Get Inventory Report
export const getInventoryReport = asyncHandler(async (req, res) => {
  console.log('🔧 GET INVENTORY REPORT - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const products = await Product.find({ isActive: true, userId: req.admin._id }).populate("supplier", "name")

  const totalProducts = products.length
  const totalStockValue = products.reduce((sum, product) => sum + product.stock * product.costPrice, 0)
  const lowStockProducts = products.filter((p) => p.stock < p.minStockLevel)

  const byCategory = {}
  products.forEach((product) => {
    if (!byCategory[product.category]) {
      byCategory[product.category] = { count: 0, value: 0 }
    }
    byCategory[product.category].count += 1
    byCategory[product.category].value += product.stock * product.costPrice
  })

  console.log('✅ GET INVENTORY REPORT - Success:', totalProducts, 'products analyzed');

  res.status(200).json({
    success: true,
    report: {
      totalProducts,
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      byCategory,
    },
  })
})

// Get Financial Report
export const getFinancialReport = asyncHandler(async (req, res) => {
  console.log('🔧 GET FINANCIAL REPORT - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const { startDate, endDate } = req.query

  const query = { userId: req.admin._id }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query.createdAt.$lte = end
    }
  }

  const orders = await Order.find(query)
  const expenses = await Expense.find({ ...query, isActive: true })
  const ledgerEntries = await Ledger.find({ ...query, isActive: true })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalDebit = ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
  const totalCredit = ledgerEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0)

  console.log('✅ GET FINANCIAL REPORT - Success: Revenue £' + totalRevenue + ', Expenses £' + totalExpenses);

  res.status(200).json({
    success: true,
    report: {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit,
    },
  })
})

// Get Client Report
export const getClientReport = asyncHandler(async (req, res) => {
  console.log('🔧 GET CLIENT REPORT - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }
  const clients = await Client.find({ isActive: true, userId: req.admin._id })

  const totalClients = clients.length
  const totalCredit = clients.reduce((sum, client) => sum + (client.totalCredit || 0), 0)
  const totalDebit = clients.reduce((sum, client) => sum + (client.totalDebit || 0), 0)

  console.log('✅ GET CLIENT REPORT - Success:', totalClients, 'clients analyzed');

  res.status(200).json({
    success: true,
    report: {
      totalClients,
      totalCredit,
      totalDebit,
      clients,
    },
  })
})

// Get Supplier Report
export const getSupplierReport = asyncHandler(async (req, res) => {
  console.log('🔧 GET SUPPLIER REPORT - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const suppliers = await Supplier.find({ isActive: true, userId: req.admin._id })

  const totalSuppliers = suppliers.length
  const totalCredit = suppliers.reduce((sum, supplier) => sum + (supplier.totalCredit || 0), 0)
  const totalDebit = suppliers.reduce((sum, supplier) => sum + (supplier.totalDebit || 0), 0)

  console.log('✅ GET SUPPLIER REPORT - Success:', totalSuppliers, 'suppliers analyzed');

  res.status(200).json({
    success: true,
    report: {
      totalSuppliers,
      totalCredit,
      totalDebit,
      suppliers,
    },
  })
})

// Get Dashboard Summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
  console.log('🔧 GET DASHBOARD SUMMARY - Request received');

  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const orders = await Order.find({ userId: req.admin._id })
  const products = await Product.find({ isActive: true, userId: req.admin._id })
  const clients = await Client.find({ isActive: true, userId: req.admin._id })
  const suppliers = await Supplier.find({ isActive: true, userId: req.admin._id })
  const expenses = await Expense.find({ isActive: true, userId: req.admin._id })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const lowStockProducts = products.filter((p) => p.stock < p.minStockLevel)

  // Sales by date
  const salesByDay = await Order.aggregate([
    { $match: { userId: req.admin._id } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const salesByMonth = await Order.aggregate([
    { $match: { userId: req.admin._id } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const salesByYear = await Order.aggregate([
    { $match: { userId: req.admin._id } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
        totalSales: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  console.log('✅ GET DASHBOARD SUMMARY - Success');

  res.status(200).json({
    success: true,
    summary: {
      totalOrders: orders.length,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalProducts: products.length,
      lowStockProducts: lowStockProducts.length,
      totalCustomers: clients.length,
      totalSuppliers: suppliers.length,
      salesByDay,
      salesByMonth,
      salesByYear,
    },
  })
});

export const getSalesStats = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const totalSales = await Order.aggregate([
    { $match: { userId: req.admin._id } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const totalSalesThisMonth = await Order.aggregate([
    { $match: { userId: req.admin._id, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const totalSalesThisWeek = await Order.aggregate([
    { $match: { userId: req.admin._id, createdAt: { $gte: startOfWeek } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const totalSalesToday = await Order.aggregate([
    { $match: { userId: req.admin._id, createdAt: { $gte: startOfToday } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  res.status(200).json({
    success: true,
    totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
    totalSalesThisMonth: totalSalesThisMonth.length > 0 ? totalSalesThisMonth[0].total : 0,
    totalSalesThisWeek: totalSalesThisWeek.length > 0 ? totalSalesThisWeek[0].total : 0,
    totalSalesToday: totalSalesToday.length > 0 ? totalSalesToday[0].total : 0,
  });
});

export const getTopProducts = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const orders = await Order.find({ userId: req.admin._id }).populate("lines.productId");

  const productSales = {};
  orders.forEach((order) => {
    order.lines.forEach((line) => {
      if (line.productId) {
        const productId = line.productId._id.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            name: line.productId.name,
            quantity: 0,
            total: 0,
          };
        }
        productSales[productId].quantity += line.qty;
        productSales[productId].total += line.qty * line.price;
      }
    });
  });

  const sortedProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

  res.status(200).json({
    success: true,
    report: sortedProducts,
  });
});

export const getSalesOverview = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const salesByMonth = await Order.aggregate([
    { $match: { userId: req.admin._id } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        sales: { $sum: "$total" },
        deliveryCosts: { $sum: { $ifNull: ["$deliveryCost", 0] } },
        orderCount: { $sum: 1 }
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const report = months.map((month, index) => {
    const monthData = salesByMonth.find(item => item._id === index + 1);
    const sales = monthData ? monthData.sales : 0;
    const deliveryCosts = monthData ? monthData.deliveryCosts : 0;
    const revenue = sales - deliveryCosts; // Revenue = Sales - Delivery Costs

    return {
      name: month,
      sales: sales,
      revenue: revenue,
    };
  });

  res.status(200).json({
    success: true,
    report,
  });
});

// Get Profit Stats (for KPI cards)
export const getProfitStats = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Helper function to calculate profit for orders
  const calculateProfit = async (query) => {
    const orders = await Order.find(query).populate('lines.productId');
    let totalProfit = 0;

    orders.forEach(order => {
      order.lines.forEach(line => {
        if (line.productId) {
          const sellingPrice = line.price;
          const costPrice = line.productId.costPrice || 0;
          const qty = line.qty;
          totalProfit += (sellingPrice - costPrice) * qty;
        }
      });
    });

    return totalProfit;
  };

  // Helper function to calculate expenses for a given period
  const calculateExpenses = async (query) => {
    const expenses = await Expense.find({ ...query, isActive: true });
    return expenses.reduce((sum, expense) => {
      const vatAmount = expense.amount * ((expense.vat || 0) / 100);
      return sum + expense.amount + vatAmount;
    }, 0);
  };

  const totalProfit = await calculateProfit({ userId: req.admin._id });
  const totalExpenses = await calculateExpenses({ userId: req.admin._id });

  const totalProfitThisMonth = await calculateProfit({
    userId: req.admin._id,
    createdAt: { $gte: startOfMonth }
  });
  const totalExpensesThisMonth = await calculateExpenses({
    userId: req.admin._id,
    createdAt: { $gte: startOfMonth }
  });

  const totalProfitThisWeek = await calculateProfit({
    userId: req.admin._id,
    createdAt: { $gte: startOfWeek }
  });
  const totalExpensesThisWeek = await calculateExpenses({
    userId: req.admin._id,
    createdAt: { $gte: startOfWeek }
  });

  const totalProfitToday = await calculateProfit({
    userId: req.admin._id,
    createdAt: { $gte: startOfToday }
  });
  const totalExpensesToday = await calculateExpenses({
    userId: req.admin._id,
    createdAt: { $gte: startOfToday }
  });

  res.status(200).json({
    success: true,
    totalProfit: totalProfit - totalExpenses,
    totalProfitThisMonth: totalProfitThisMonth - totalExpensesThisMonth,
    totalProfitThisWeek: totalProfitThisWeek - totalExpensesThisWeek,
    totalProfitToday: totalProfitToday - totalExpensesToday,
  });
});

// Get Profit Report (for Profit tab with daily/monthly/yearly views)
export const getProfitReport = asyncHandler(async (req, res) => {
  if (!req.admin || !req.admin._id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { view = 'monthly', startDate, endDate } = req.query;

  const query = { userId: req.admin._id };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const orders = await Order.find(query).populate('lines.productId');
  const expenses = await Expense.find({ ...query, isActive: true });

  // Group by period based on view
  const profitData = {};

  orders.forEach(order => {
    let periodKey;
    const orderDate = new Date(order.createdAt);

    if (view === 'daily') {
      periodKey = orderDate.toISOString().split('T')[0];
    } else if (view === 'monthly') {
      periodKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    } else if (view === 'yearly') {
      periodKey = String(orderDate.getFullYear());
    }

    if (!profitData[periodKey]) {
      profitData[periodKey] = {
        totalSales: 0,
        totalCost: 0,
        totalExpenses: 0,
        orderCount: 0
      };
    }

    let orderSales = 0;
    let orderCost = 0;

    order.lines.forEach(line => {
      const qty = line.qty || 0;
      const sellingPrice = line.price || 0;
      const costPrice = line.productId?.costPrice || 0;

      orderSales += qty * sellingPrice;
      orderCost += qty * costPrice;
    });

    profitData[periodKey].totalSales += orderSales;
    profitData[periodKey].totalCost += orderCost;
    profitData[periodKey].orderCount += 1;
  });

  // Add expenses to the corresponding periods
  expenses.forEach(expense => {
    let periodKey;
    const expenseDate = new Date(expense.createdAt);

    if (view === 'daily') {
      periodKey = expenseDate.toISOString().split('T')[0];
    } else if (view === 'monthly') {
      periodKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    } else if (view === 'yearly') {
      periodKey = String(expenseDate.getFullYear());
    }

    if (!profitData[periodKey]) {
      profitData[periodKey] = {
        totalSales: 0,
        totalCost: 0,
        totalExpenses: 0,
        orderCount: 0
      };
    }

    profitData[periodKey].totalExpenses += expense.amount + (expense.amount * ((expense.vat || 0) / 100));
  });

  // Convert to array and format
  const report = Object.entries(profitData)
    .map(([period, data], index) => {
      const grossProfit = data.totalSales - data.totalCost;
      const netProfit = grossProfit - data.totalExpenses;
      const profitMargin = data.totalSales > 0 ? (netProfit / data.totalSales) * 100 : 0;

      let periodLabel;
      if (view === 'daily') {
        periodLabel = new Date(period).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      } else if (view === 'monthly') {
        const [year, month] = period.split('-');
        periodLabel = new Date(year, parseInt(month) - 1).toLocaleDateString('en-GB', {
          month: 'long', year: 'numeric'
        });
      } else {
        periodLabel = period;
      }

      return {
        'Sr. No.': index + 1,
        'Date': period,
        'Period': periodLabel,
        'Total Sales': data.totalSales.toFixed(2),
        'Total Cost': data.totalCost.toFixed(2),
        'Gross Profit': grossProfit.toFixed(2),
        'Total Expenses': data.totalExpenses.toFixed(2),
        'Net Profit': netProfit.toFixed(2),
        'Profit Margin %': profitMargin.toFixed(2),
        'Orders': data.orderCount
      };
    })
    .sort((a, b) => b.Date.localeCompare(a.Date));

  res.status(200).json({
    success: true,
    view,
    report
  });
});