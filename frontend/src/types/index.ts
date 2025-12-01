export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  retailPrice: number;
  stock: number;
  vat: number;
}

export interface OrderLine {
  productId: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  clientId: string;
  lines: OrderLine[];
  status: 'pending' | 'in_progress' | 'dispatched' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  paymentMethod?: PaymentMethod | string;
  deliveryCost?: number;
  includeVAT?: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  creditLimit?: number;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  postalCode?: string;
  balance: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  ref: string;
  description: string;
  amount: number;
  balance: number;
  entityId: string;
  entityType: 'client' | 'supplier';
  paymentMethod?: PaymentMethod | string;
  // New fields
  phoneNo?: string;
  note?: string;
  postalCode?: string;
}

export interface DashboardStats {
  totalStockValue: number;
  activeOrders: number;
  pendingDeliveries: number;
  monthlySales: number;
}

export type PaymentMethod = 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Other';

export interface CreditorDebitor {
  id: string;
  date: string;
  invoiceNumber: string;
  supplierName: string;
  payment: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  type: 'creditor' | 'debitor';
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
}
