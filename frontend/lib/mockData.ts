import { Product, Order, Client, Supplier, LedgerEntry, DashboardStats, CreditorDebitor, Expense } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    sku: 'KF-001',
    name: 'Basmati Rice Premium 25kg',
    category: 'Grains',
    unit: 'bag',
    costPrice: 45.00,
    retailPrice: 65.00,
    stock: 180,
    vat: 20
  },
  {
    id: 'p2',
    sku: 'KF-002',
    name: 'Cooking Oil 5L',
    category: 'Oils',
    unit: 'bottle',
    costPrice: 8.50,
    retailPrice: 12.99,
    stock: 45,
    vat: 20
  },
  {
    id: 'p3',
    sku: 'KF-003',
    name: 'Wheat Flour 10kg',
    category: 'Grains',
    unit: 'bag',
    costPrice: 12.00,
    retailPrice: 18.50,
    stock: 320,
    vat: 20
  },
  {
    id: 'p4',
    sku: 'KF-004',
    name: 'Sugar 50kg',
    category: 'Sweeteners',
    unit: 'bag',
    costPrice: 35.00,
    retailPrice: 52.00,
    stock: 85,
    vat: 20
  },
  {
    id: 'p5',
    sku: 'KF-005',
    name: 'Red Lentils 20kg',
    category: 'Pulses',
    unit: 'bag',
    costPrice: 28.00,
    retailPrice: 42.00,
    stock: 150,
    vat: 20
  },
  {
    id: 'p6',
    sku: 'KF-006',
    name: 'Black Tea Premium 1kg',
    category: 'Beverages',
    unit: 'pack',
    costPrice: 15.00,
    retailPrice: 22.50,
    stock: 240,
    vat: 20
  },
  {
    id: 'p7',
    sku: 'KF-007',
    name: 'Chickpeas 25kg',
    category: 'Pulses',
    unit: 'bag',
    costPrice: 32.00,
    retailPrice: 48.00,
    stock: 12,
    vat: 20
  },
  {
    id: 'p8',
    sku: 'KF-008',
    name: 'Tomato Paste 800g (Case of 12)',
    category: 'Canned Goods',
    unit: 'case',
    costPrice: 18.00,
    retailPrice: 27.00,
    stock: 95,
    vat: 20
  }
];

export const mockClients: Client[] = [
  { id: 'c1', name: 'Metro Cash & Carry - Downtown', phone: '+44 20 7946 0958', email: 'downtown@metro.uk', address: '123 High Street, London', postalCode: 'SW1A 1AA', creditLimit: 50000, balance: 12500 },
  { id: 'c2', name: 'Makro Wholesale - North', phone: '+44 161 234 5678', email: 'north@makro.uk', address: '45 Industrial Park, Manchester', postalCode: 'M1 1AA', creditLimit: 75000, balance: 28400 },
  { id: 'c3', name: 'Costco Business Centre', phone: '+44 121 496 0000', email: 'business@costco.uk', address: '78 Warehouse Way, Birmingham', postalCode: 'B1 1AA', creditLimit: 100000, balance: 0 },
  { id: 'c4', name: 'Booker Wholesale - East', phone: '+44 207 729 1234', email: 'east@booker.uk', address: '92 Commerce Road, Leeds', postalCode: 'LS1 1AA', creditLimit: 40000, balance: 8900 },
  { id: 'c5', name: 'Bestway Cash & Carry', phone: '+44 141 332 4567', email: 'info@bestway.uk', address: '156 Trade Street, Glasgow', postalCode: 'G1 1AA', creditLimit: 60000, balance: 15200 }
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Pakistan Rice Mills Ltd', contact: '+92 300 1234567', address: 'Lahore, Pakistan', postalCode: '54000', balance: 15000 },
  { id: 's2', name: 'Global Oils Trading Co.', contact: '+971 50 123 4567', address: 'Dubai, UAE', postalCode: '00000', balance: 8500 },
  { id: 's3', name: 'Khyber Pulses Import', contact: '+44 20 8765 4321', address: 'London, UK', postalCode: 'E1 6AN', balance: 22000 }
];

export const mockOrders: Order[] = [
  {
    id: 'ord1',
    clientId: 'c1',
    lines: [
      { productId: 'p1', qty: 50, price: 65.00 },
      { productId: 'p3', qty: 100, price: 18.50 }
    ],
    status: 'delivered',
    total: 5100.00,
    createdAt: '2025-05-01'
  },
  {
    id: 'ord2',
    clientId: 'c2',
    lines: [
      { productId: 'p2', qty: 200, price: 12.99 },
      { productId: 'p4', qty: 30, price: 52.00 }
    ],
    status: 'dispatched',
    total: 4158.00,
    createdAt: '2025-04-30'
  },
  {
    id: 'ord3',
    clientId: 'c4',
    lines: [
      { productId: 'p5', qty: 75, price: 42.00 },
      { productId: 'p6', qty: 120, price: 22.50 }
    ],
    status: 'in_progress',
    total: 5850.00,
    createdAt: '2025-04-29'
  },
  {
    id: 'ord4',
    clientId: 'c5',
    lines: [
      { productId: 'p7', qty: 40, price: 48.00 }
    ],
    status: 'pending',
    total: 1920.00,
    createdAt: '2025-04-28'
  },
  {
    id: 'ord5',
    clientId: 'c3',
    lines: [
      { productId: 'p1', qty: 100, price: 65.00 },
      { productId: 'p8', qty: 50, price: 27.00 }
    ],
    status: 'delivered',
    total: 7850.00,
    createdAt: '2025-04-27'
  }
];

export const mockLedgerEntries: LedgerEntry[] = [
  { id: 'l1', date: '2025-04-01', ref: 'INV-1001', description: 'Sale - Rice & Flour', amount: 5100.00, balance: 5100.00, entityId: 'c1', entityType: 'client', paymentMethod: 'Bank Transfer' },
  { id: 'l2', date: '2025-04-10', ref: 'PMT-501', description: 'Payment Received', amount: -2500.00, balance: 2600.00, entityId: 'c1', entityType: 'client', paymentMethod: 'Cash' },
  { id: 'l3', date: '2025-04-15', ref: 'INV-1002', description: 'Sale - Oils & Pulses', amount: 7500.00, balance: 10100.00, entityId: 'c1', entityType: 'client', paymentMethod: 'Credit Card' },
  { id: 'l4', date: '2025-04-25', ref: 'PMT-502', description: 'Payment Received', amount: -5000.00, balance: 5100.00, entityId: 'c1', entityType: 'client', paymentMethod: 'Bank Transfer' },
  
  { id: 'l5', date: '2025-04-05', ref: 'PO-2001', description: 'Purchase - Basmati Rice', amount: 15000.00, balance: 15000.00, entityId: 's1', entityType: 'supplier', paymentMethod: 'Bank Transfer' },
  { id: 'l6', date: '2025-04-12', ref: 'PMT-301', description: 'Payment Made', amount: -5000.00, balance: 10000.00, entityId: 's1', entityType: 'supplier', paymentMethod: 'Cash' },
];

export const mockDashboardStats: DashboardStats = {
  totalStockValue: 124700,
  activeOrders: 2358,
  pendingDeliveries: 839,
  monthlySales: 41
};

export const mockMonthlySales = [
  { month: 'Jan', sales: 35000 },
  { month: 'Feb', sales: 42000 },
  { month: 'Mar', sales: 38000 },
  { month: 'Apr', sales: 45000 },
  { month: 'May', sales: 41000 },
  { month: 'Jun', sales: 48000 },
  { month: 'Jul', sales: 52000 },
  { month: 'Aug', sales: 49000 },
  { month: 'Sep', sales: 55000 },
  { month: 'Oct', sales: 58000 },
  { month: 'Nov', sales: 51000 },
  { month: 'Dec', sales: 62000 }
];

export const mockCreditorDebitor: CreditorDebitor[] = [
  { id: '1', date: '2024-01-15', invoiceNumber: 'INV-001', supplierName: 'Global Foods Ltd', payment: 5000, remainingBalance: 2000, paymentMethod: 'Bank Transfer', type: 'creditor' },
  { id: '2', date: '2024-01-20', invoiceNumber: 'INV-002', supplierName: 'Fresh Supplies Inc', payment: 3500, remainingBalance: 1500, paymentMethod: 'Credit Card', type: 'creditor' },
  { id: '3', date: '2024-02-01', invoiceNumber: 'INV-003', supplierName: 'Quality Goods Co', payment: 4200, remainingBalance: 0, paymentMethod: 'Cash', type: 'creditor' },
  { id: '4', date: '2024-02-10', invoiceNumber: 'INV-004', supplierName: 'Metro Distributors', payment: 2800, remainingBalance: 2800, paymentMethod: 'Bank Transfer', type: 'debitor' },
  { id: '5', date: '2024-02-15', invoiceNumber: 'INV-005', supplierName: 'Premium Foods', payment: 1500, remainingBalance: 500, paymentMethod: 'Cash', type: 'debitor' },
];

export const mockExpenses: Expense[] = [
  { id: '1', date: '2024-01-05', category: 'Premises', description: 'Monthly rent payment', amount: 3500, paymentMethod: 'Bank Transfer' },
  { id: '2', date: '2024-01-10', category: 'Vehicles', description: 'Fuel for delivery van', amount: 250, paymentMethod: 'Credit Card' },
  { id: '3', date: '2024-01-15', category: 'Insurance', description: 'Business insurance premium', amount: 800, paymentMethod: 'Bank Transfer' },
  { id: '4', date: '2024-01-20', category: 'Utilities', description: 'Electricity bill', amount: 450, paymentMethod: 'Bank Transfer' },
  { id: '5', date: '2024-01-25', category: 'Maintenance', description: 'Warehouse repairs', amount: 620, paymentMethod: 'Cash' },
  { id: '6', date: '2024-02-01', category: 'Equipment', description: 'New forklift parts', amount: 1200, paymentMethod: 'Credit Card' },
];
