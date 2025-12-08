"use client"

import { PoundSterling, ShoppingCart, Truck, TrendingUp, Plus, Package, AlertCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import api from "../utils/api";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"

interface BackendProduct {
  _id: string;
  serialNo: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockLevel: number;
  vat?: number;
  isActive: boolean;
}

interface BackendClient {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
}

interface BackendOrder {
  _id: string;
  orderNo: string;
  clientId: string;
  clientName?: string;
  lines: Array<{
    productId: string;
    productName?: string;
    qty: number;
    price: number;
  }>;
  status: 'pending' | 'in_progress' | 'dispatched' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  paymentMethod?: string;
  deliveryCost?: number;
  includeVAT?: boolean;
}

interface SalesData {
  period: string;
  sales: number;
  orders: number;
}

interface DashboardStats {
  totalStockValue: number;
  activeOrders: number;
  pendingDeliveries: number;
  monthlySales: number;
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalStockValue: 0,
    activeOrders: 0,
    pendingDeliveries: 0,
    monthlySales: 0
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [timeRange, setTimeRange] = useState<"daily" | "monthly">("monthly")
  const [lowStockProducts, setLowStockProducts] = useState<BackendProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<BackendOrder[]>([])
  const [clients, setClients] = useState<BackendClient[]>([])
  const [loading, setLoading] = useState(true)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Memoize getClientName to prevent recreation on every render
  const getClientName = useCallback((clientId: string) => {
    if (!clientId) return "Unknown Client";
    const found = clients.find((c) => c._id === clientId);
    if (found) return found.name;

    const cachedOrder = recentOrders.find((o) => o.clientId === clientId && o.clientName);
    if (cachedOrder) return cachedOrder.clientName || "Deleted Client";

    return "Deleted Client";
  }, [clients, recentOrders]);

  const generateSalesData = (orders: BackendOrder[], range: "daily" | "monthly") => {
    const currentYear = new Date().getFullYear();
    const currentYearOrders = orders.filter((order: BackendOrder) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === currentYear && order.status === 'delivered';
    });

    let salesData: SalesData[] = [];

    if (range === "monthly") {
      const monthlySales: { [key: string]: { sales: number, orders: number } } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      months.forEach(month => {
        monthlySales[month] = { sales: 0, orders: 0 };
      });

      currentYearOrders.forEach((order: BackendOrder) => {
        const orderDate = new Date(order.createdAt);
        const month = months[orderDate.getMonth()];
        monthlySales[month].sales += order.total;
        monthlySales[month].orders += 1;
      });

      salesData = months.map(month => ({
        period: month,
        sales: monthlySales[month].sales,
        orders: monthlySales[month].orders
      }));
    }
    else if (range === "daily") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      const currentWeekOrders = currentYearOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfWeek && orderDate <= endOfToday;
      });

      const dailySales: { [key: string]: { sales: number, orders: number } } = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      days.forEach(day => {
        dailySales[day] = { sales: 0, orders: 0 };
      });

      currentWeekOrders.forEach((order: BackendOrder) => {
        const orderDate = new Date(order.createdAt);
        const dayOfWeek = days[orderDate.getDay()];
        dailySales[dayOfWeek].sales += order.total;
        dailySales[dayOfWeek].orders += 1;
      });

      salesData = days.map(day => ({
        period: day,
        sales: dailySales[day].sales,
        orders: dailySales[day].orders
      }));
    }

    return salesData;
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsResponse, ordersResponse, clientsResponse] =
        await Promise.all([
          api.get("/products"),
          api.get("/orders"),
          api.get("/clients"),
        ]);

      setClients(clientsResponse.data.clients || clientsResponse.data || []);

      const products = productsResponse.data.products || productsResponse.data;
      const totalStockValue = products.reduce(
        (sum: number, product: BackendProduct) => {
          const vatRate = product.vat || 20;
          const priceWithVAT = product.costPrice * (1 + vatRate / 100);
          return sum + product.stock * priceWithVAT;
        },
        0
      );
      const lowStock = products.filter(
        (product: BackendProduct) => product.stock < 50
      );
      setLowStockProducts(lowStock);

      const orders = ordersResponse.data.orders || ordersResponse.data;
      const activeOrders = orders.filter(
        (order: BackendOrder) => order.status !== "cancelled"
      ).length;
      const pendingDeliveries = orders.filter(
        (order: BackendOrder) =>
          order.status === "pending" || order.status === "in_progress"
      ).length;
      const recent = orders
        .sort(
          (a: BackendOrder, b: BackendOrder) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      setRecentOrders(recent);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlySales = orders
        .filter((order: BackendOrder) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear &&
            order.status === "delivered"
          );
        })
        .reduce((sum: number, order: BackendOrder) => sum + order.total, 0);

      const generatedSalesData = generateSalesData(orders, timeRange);
      setSalesData(generatedSalesData);

      setDashboardStats({
        totalStockValue,
        activeOrders,
        pendingDeliveries,
        monthlySales,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getChartTitle = () => {
    switch (timeRange) {
      case "daily":
        return "This Week Sales";
      case "monthly":
        return "This Year Sales";
      default:
        return "Sales Overview";
    }
  }

  const getXAxisConfig = (): any => {
    const baseConfig = {
      stroke: "#AAABAB",
      style: { fontSize: 12 }
    };

    switch (timeRange) {
      case "daily":
        return {
          ...baseConfig,
          interval: 0,
          tick: { angle: 0, textAnchor: "middle" },
          height: 30
        };
      case "monthly":
        return {
          ...baseConfig,
          interval: 0,
          tick: { angle: -45, textAnchor: "end" },
          height: 60
        };
      default:
        return baseConfig;
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">HKS Foods Dashboard</h1>
            <p className="text-muted-foreground">Warehouse operations at a glance</p>
          </div>
          <Button disabled className="bg-kf-green hover:bg-kf-green-dark text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 bg-card border-kf-border card-shadow animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-kf-border rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-kf-border rounded"></div>
                  <div className="h-6 w-16 bg-kf-border rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-card border-kf-border card-shadow animate-pulse">
            <div className="h-6 w-48 bg-kf-border rounded mb-6"></div>
            <div className="h-80 bg-kf-border rounded"></div>
          </Card>
          <Card className="p-6 bg-card border-kf-border card-shadow animate-pulse">
            <div className="h-6 w-32 bg-kf-border rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-kf-border rounded"></div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border-kf-border card-shadow animate-pulse">
          <div className="h-6 w-32 bg-kf-border rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-kf-border rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-kf-text-light mb-1">HKS Foods Dashboard</h1>
          <p className="text-muted-foreground">Warehouse operations at a glance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/products")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Value"
          value={`${dashboardStats.totalStockValue.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}`}
          icon={PoundSterling}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Orders"
          value={dashboardStats.activeOrders.toString()}
          icon={ShoppingCart}
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Pending Deliveries"
          value={dashboardStats.pendingDeliveries.toString()}
          icon={Truck}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Monthly Sales"
          value={`${dashboardStats.monthlySales.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}`}
          icon={TrendingUp}
          iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-card border-kf-border card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">{getChartTitle()}</h2>
              <p className="text-sm text-muted-foreground">
                {timeRange === "daily" ? "Daily sales for current week" : "Monthly sales for current year"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-kf-text-mid" />
              <Select value={timeRange} onValueChange={(value: "daily" | "monthly") => setTimeRange(value)}>
                <SelectTrigger className="w-32 bg-kf-background border-kf-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => navigate("/reports")} variant="outline" size="sm" className="border-kf-border">
                View Reports
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {timeRange === "daily" ? (
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="period" {...getXAxisConfig()} />
                <YAxis stroke="#999999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    color: "#333333",
                  }}
                  formatter={(value) => [`${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value))}`, 'Sales']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar dataKey="sales" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="period" {...getXAxisConfig()} />
                <YAxis stroke="#999999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    color: "#333333",
                  }}
                  formatter={(value) => [`${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value))}`, 'Sales']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line type="monotone" dataKey="sales" stroke="#4CAF50" strokeWidth={3} dot={{ fill: "#4CAF50", r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-card border-kf-border card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-foreground">Low Stock Alert</h2>
          </div>
          {lowStockProducts.length > 0 ? (
            <div
              className="space-y-3 max-h-[300px] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(120, 120, 120, 0.3) transparent'
              }}
            >
              {lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-kf-background border border-red-500 hover:bg-kf-sidebar-hover transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Package className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.serialNo}</p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs bg-kf-red flex-shrink-0 ml-2 text-red-500">
                    {product.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">All products have sufficient stock</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 bg-card border-kf-border card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
          <Button onClick={() => navigate("/orders")} variant="outline" size="sm" className="border-kf-border">
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kf-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Client</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground font-medium">{order.orderNo}</td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {order.clientName || getClientName(order.clientId)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4 text-sm text-foreground font-semibold">{new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(order.total)}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "dispatched"
                            ? "secondary"
                            : order.status === "cancelled"
                              ? "destructive"
                              : "outline"
                      }
                      className="capitalize"
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-muted-foreground">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}