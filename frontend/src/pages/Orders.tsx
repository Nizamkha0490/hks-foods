"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Pencil, Trash2, ArrowUpDown, Search, X, Download } from "lucide-react"
import api from "../utils/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderLine {
  productId: string
  productName?: string
  qty: number
  price: number
  total?: number
}

interface BackendOrder {
  _id: string
  orderNo: string
  invoiceNo: string
  invoiceType: string
  clientId: string
  clientName?: string
  lines: OrderLine[]
  status: "pending" | "in_progress" | "dispatched" | "delivered" | "cancelled"
  total: number
  createdAt: string
  paymentMethod?: string
  deliveryCost?: number
  includeVAT?: boolean
}

interface BackendClient {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
  }
}
interface BackendProduct {
  _id: string
  serialNo: string
  name: string
  sellingPrice: number
  stock: number
  unit: string
  vat?: number
}

export default function Orders() {
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isModifyOpen, setIsModifyOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null)
  const [orders, setOrders] = useState<BackendOrder[]>([])
  const [clients, setClients] = useState<BackendClient[]>([])
  const [products, setProducts] = useState<BackendProduct[]>([])
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [modifyingDelivered, setModifyingDelivered] = useState(false)
  const [deletingDelivered, setDeletingDelivered] = useState<string | null>(null)
  const [exportingReceipt, setExportingReceipt] = useState(false)

  const [productSearch, setProductSearch] = useState("")
  const [clientSearch, setClientSearch] = useState("")
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [isDeliveredPopupOpen, setIsDeliveredPopupOpen] = useState(false)
  const [isModifyDeliveredOpen, setIsModifyDeliveredOpen] = useState(false)
  const [newDeliveredStatus, setNewDeliveredStatus] = useState<BackendOrder["status"]>("pending")
  const [orderType, setOrderType] = useState<"On Account" | "Cash" | "Picking List" | "Proforma" | "By Invoice" | null>(null)
  const [orderSearch, setOrderSearch] = useState("")
  const [deliveredOrderSearch, setDeliveredOrderSearch] = useState("")

  const [formData, setFormData] = useState({
    clientId: "",
    deliveryCost: 0,
    includeDeliveryCost: true,
    includeVAT: true,
    status: "pending" as BackendOrder["status"],
    lines: [] as OrderLine[],
  })

  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedProductQty, setSelectedProductQty] = useState("1")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [clientsResponse, productsResponse, ordersResponse] = await Promise.all([
        api.get("/clients"),
        api.get("/products"),
        api.get("/orders"),
      ])
      setClients(clientsResponse.data.clients || clientsResponse.data || [])
      setProducts(productsResponse.data.products || productsResponse.data || [])
      setOrders(ordersResponse.data.orders || ordersResponse.data || [])
    } catch (error: any) {
      console.error("Error in fetchData:", error)
      toast.error("Error loading data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Utility functions
  const getClientName = (clientId: string) => {
    if (!clientId) return "Unknown Client"
    const found = clients.find((c) => c._id === clientId)
    if (found) return found.name
    const cachedOrder = orders.find((o) => o.clientId === clientId && o.clientName)
    if (cachedOrder) return cachedOrder.clientName || "Deleted Client"
    return "Deleted Client"
  }

  const getProductName = (line: any) => {
    // First try to use the snapshot name stored in the order line
    if (line.productName) return line.productName

    // Then try to find the product in the current products list
    const found = products.find((p) => p._id === line.productId)
    if (found) return found.name

    // Fallback
    return "Deleted Product"
  }

  const getProductVAT = (productId: string | any) => {
    const id = typeof productId === "object" && productId ? productId._id : productId
    const found = products.find((p) => p._id === id)
    // Explicitly check for undefined to allow 0 as a valid VAT rate
    return found && found.vat !== undefined && found.vat !== null ? found.vat : 20
  }

  const getProductPrice = (productId: string) => {
    const found = products.find((p) => p._id === productId)
    return found ? found.sellingPrice : 0
  }

  const filteredProducts = productSearch
    ? products.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.serialNo.toLowerCase().includes(productSearch.toLowerCase()),
    )
    : products

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === "latest" ? dateB - dateA : dateA - dateB
  })

  // Filter orders based on search term
  const filteredOrders = orderSearch
    ? sortedOrders.filter((order) =>
      order.orderNo?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.invoiceNo?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      getClientName(order.clientId).toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.invoiceType?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.status.toLowerCase().includes(orderSearch.toLowerCase())
    )
    : sortedOrders

  const deliveredOrders = filteredOrders.filter((o) => o.status === "delivered")
  const activeOrders = filteredOrders.filter((o) => o.status !== "delivered")

  // Order actions
  const handleViewOrder = (order: BackendOrder) => {
    setSelectedOrder(order)
    setIsViewOpen(true)
  }

  const handleModifyOrder = (order: BackendOrder) => {
    setSelectedOrder(order)
    setProductSearch("")
    setClientSearch("")
    setShowProductDropdown(false)
    setSelectedProductId("")
    setSelectedProductQty("1")

    // Map backend type to frontend type
    const typeMap: Record<string, "On Account" | "Cash" | "Picking List" | "Proforma" | "By Invoice"> = {
      'on_account': 'On Account',
      'cash': 'Cash',
      'picking_list': 'Picking List',
      'proforma': 'Proforma',
      'invoice': 'By Invoice'
    }
    setOrderType(typeMap[order.invoiceType] || 'By Invoice')

    setFormData({
      clientId: order.clientId,
      deliveryCost: order.deliveryCost || 0,
      includeDeliveryCost: !!(order.deliveryCost && order.deliveryCost > 0),
      includeVAT: order.includeVAT !== false,
      status: order.status,
      lines: order.lines.map((line) => ({
        ...line,
        productId: typeof line.productId === "object" ? (line.productId as any)._id : line.productId,
        productName: line.productName || getProductName(line),
      })),
    })

    setIsModifyOpen(true)
  }

  const handleCancelOrder = (order: BackendOrder) => {
    setSelectedOrder(order)
    setIsCancelOpen(true)
  }

  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return
    try {
      setDeletingOrder(true)
      await api.delete(`/orders/${selectedOrder._id}`)
      setOrders((prev) => prev.filter((o) => o._id !== selectedOrder._id))
      setIsCancelOpen(false)
      setSelectedOrder(null)
      toast.success("Order deleted successfully")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error("Error deleting order")
    } finally {
      setDeletingOrder(false)
    }
  }

  const addProductLine = () => {
    if (!selectedProductId) {
      toast.error("Please select a product")
      return
    }

    const qty = Number.parseInt(selectedProductQty) || 1

    if (qty <= 0) {
      toast.error("Quantity must be at least 1")
      return
    }

    // Check stock availability
    const product = products.find((p) => p._id === selectedProductId)
    if (!product) {
      toast.error("Product not found")
      return
    }

    // Check if we have enough stock
    const existingLine = formData.lines.find((l) => l.productId === selectedProductId)
    const currentQtyInCart = existingLine ? existingLine.qty : 0
    const totalRequestedQty = currentQtyInCart + qty

    if (totalRequestedQty > product.stock) {
      toast.error(`Insufficient stock! Available: ${product.stock} ${product.unit}s, Requested: ${totalRequestedQty}`)
      return
    }

    const price = getProductPrice(selectedProductId)

    if (existingLine) {
      setFormData({
        ...formData,
        lines: formData.lines.map((l) => (l.productId === selectedProductId ? { ...l, qty: l.qty + qty } : l)),
      })
    } else {
      setFormData({
        ...formData,
        lines: [...formData.lines, { productId: selectedProductId, qty, price, productName: product.name }],
      })
    }

    setSelectedProductId("")
    setSelectedProductQty("1")
    setProductSearch("")
    setShowProductDropdown(false)

    toast.success(`Added ${qty} ${product.unit}(s) of ${product.name} to order`)
  }

  const removeProductLine = (productId: string) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((l) => l.productId !== productId),
    })
  }

  const calculateTotal = () => {
    let subtotal = formData.lines.reduce((sum, line) => {
      let lineTotal = line.qty * line.price
      if (formData.includeVAT) {
        const vatRate = getProductVAT(line.productId)
        lineTotal = lineTotal * (1 + vatRate / 100)
      }
      return sum + lineTotal
    }, 0)

    if (formData.includeDeliveryCost) {
      subtotal += formData.deliveryCost
    }

    return subtotal
  }

  const handleCreateOrder = async () => {
    if (isSubmitting) return

    if (!formData.clientId || formData.lines.length === 0) {
      toast.error("Please select a client and add products")
      return
    }

    try {
      setIsSubmitting(true)

      const requestBody = {
        clientId: formData.clientId,
        lines: formData.lines,
        status: formData.status,
        deliveryCost: formData.includeDeliveryCost ? formData.deliveryCost : 0,
        includeVAT: formData.includeVAT,
        type: orderType,
      }

      console.log("[v0] Creating order with payload:", requestBody)

      const response = await api.post("/orders", requestBody)

      if (response.data.success) {
        setOrders((prev) => [...prev, response.data.order])
        setIsCreateOpen(false)
        resetForm()
        toast.success("Order created successfully")
      } else {
        toast.error(response.data.message || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Something went wrong while creating order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateOrder = async () => {
    if (isUpdating) return
    if (!selectedOrder || !formData.clientId || formData.lines.length === 0) {
      toast.error("Please select a client and add products")
      return
    }

    try {
      setIsUpdating(true)

      const requestBody = {
        clientId: formData.clientId,
        lines: formData.lines,
        status: formData.status,
        deliveryCost: formData.includeDeliveryCost ? formData.deliveryCost : 0,
        includeVAT: formData.includeVAT,
        type: orderType,
      }

      const response = await api.put(`/orders/${selectedOrder._id}`, requestBody)

      if (response.data.success) {
        setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? response.data.order : o)))
        toast.success("Order updated successfully")
        setIsModifyOpen(false)
        setSelectedOrder(null)
        resetForm()
      } else {
        toast.error(response.data.message || "Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("Error updating order")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus: BackendOrder["status"]) => {
    if (!selectedOrder) return

    try {
      setUpdatingStatus(true)
      await api.patch(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
      })
      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order._id === selectedOrder._id) {
            return { ...order, status: newStatus }
          }
          return order
        })
      })

      if (newStatus === "delivered") {
        setIsDeliveredPopupOpen(true)
        toast.success("Order moved to Delivered Orders")
      }

      if (selectedOrder.status === "delivered" && newStatus !== "delivered") {
        toast.success("Order moved back to Active Orders")
      }

      setIsStatusOpen(false)
      setSelectedOrder(null)
      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error updating order status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleModifyDeliveredConfirm = async () => {
    if (!selectedOrder) return

    try {
      setModifyingDelivered(true)
      await api.patch(`/orders/${selectedOrder._id}/status`, {
        status: newDeliveredStatus,
      })
      setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, status: newDeliveredStatus } : o)))
      setIsModifyDeliveredOpen(false)
      toast.success(`Order moved to ${newDeliveredStatus}`)
    } catch (error) {
      console.error(error)
      toast.error("Error updating delivered order")
    } finally {
      setModifyingDelivered(false)
    }
  }

  const handleDeleteDelivered = async (orderId: string) => {
    try {
      setDeletingDelivered(orderId)
      await api.delete(`/orders/${orderId}`)
      setOrders((prev) => prev.filter((o) => o._id !== orderId))
      toast.success("Delivered order deleted successfully")
    } catch (error) {
      console.error(error)
      toast.error("Error deleting delivered order")
    } finally {
      setDeletingDelivered(null)
    }
  }

  const resetForm = () => {
    setFormData({
      clientId: "",
      deliveryCost: 0,
      includeDeliveryCost: true,
      includeVAT: true,
      status: "pending",
      lines: [],
    })
    setProductSearch("")
    setClientSearch("")
    setShowProductDropdown(false)
    setSelectedProductId("")
    setSelectedProductQty("1")
  }

  const exportOrderReceipt = async (order: BackendOrder) => {
    try {
      setExportingReceipt(true)
      const response = await api.get(`/orders/${order._id}/export`, {
        responseType: "blob",
      })

      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `receipt-${order.orderNo}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Receipt exported successfully")
    } catch (error) {
      console.error("Error exporting receipt:", error)
      toast.error("Error exporting receipt")
    } finally {
      setExportingReceipt(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Loading orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-metallic mb-1">Supply Orders</h1>
          <p className="text-kf-text-mid">Manage orders to Cash & Carry stores</p>
        </div>
        <div className="flex gap-2">
          <Select
            onValueChange={(value) => {
              setOrderType(value as any)
              resetForm()
              setIsCreateOpen(true)
            }}
          >
            <SelectTrigger className="w-40 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Create Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="On Account">On Account</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="By Invoice">By Invoice</SelectItem>
              <SelectItem value="Picking List">Picking List</SelectItem>
              <SelectItem value="Proforma">Proforma</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="ml-2 border-kf-border text-primary hover:text-primary/80 bg-transparent"
            onClick={() => setIsDeliveredPopupOpen(true)}
          >
            Delivered Orders
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-card border-kf-border">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="border-kf-border"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === "latest" ? "Latest First" : "Oldest First"}
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by invoice, client, or type..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="pl-9 bg-background border-kf-border h-9"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-kf-border card-shadow">
        <div className="overflow-auto">
          <table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.invoiceNo || order.orderNo}</TableCell>
                  <TableCell>{order.invoiceType}</TableCell>
                  <TableCell>{getClientName(order.clientId)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.lines.length}</TableCell>
                  <TableCell>£{order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === 'delivered' ? 'default' :
                          order.status === 'cancelled' ? 'destructive' :
                            order.status === 'in_progress' ? 'secondary' :
                              order.status === 'dispatched' ? 'outline' : 'secondary'
                      }
                      className="capitalize"
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewOrder(order)}
                        title={`${order.invoiceType} Order`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleModifyOrder(order)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {order.invoiceType !== 'picking_list' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleCancelOrder(order)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {sortedOrders.length === 0 && ( // ✅ FIXED: Use sortedOrders here too
                <TableRow>
                  <TableCell colSpan={8} className="py-8 px-4 text-center text-kf-text-mid">
                    No orders found. Click "Create Order" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </Card>


      {/* Create Order Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-6xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 mb-2">
              <DialogTitle>Create New Order</DialogTitle>
              <div className="flex gap-2">
                <Select
                  value={orderType}
                  onValueChange={(v) => setOrderType(v)}
                  className="w-32"
                >
                  <SelectTrigger className="bg-muted border-kf-border">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-kf-border">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="On Account">On Account</SelectItem>
                    <SelectItem value="By Invoice">By Invoice</SelectItem>
                    <SelectItem value="Picking List">Picking List</SelectItem>
                    <SelectItem value="Proforma">Proforma</SelectItem>
                  </SelectContent>
                </Select>
                {orderType && (
                  <Badge className="bg-primary text-primary-foreground text-base px-3 py-1">{orderType}</Badge>
                )}
              </div>
            </div>
            <DialogDescription>Add order details and line items</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Client</Label>
              <div className="relative">
                <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                  <SelectTrigger className="bg-muted border-kf-border">
                    <SelectValue placeholder="Select or search client" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-kf-border p-0 max-h-60">
                    <div className="p-2 border-b border-kf-border sticky top-0 bg-popover z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kf-text-mid" />
                        <Input
                          placeholder="Search clients by name, email, or phone..."
                          value={clientSearch}
                          className="pl-8 h-9 text-sm bg-background border-kf-border"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          onChange={(e) => setClientSearch(e.target.value)}
                        />
                        {clientSearch && (
                          <button
                            onClick={() => setClientSearch("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="h-4 w-4 text-kf-text-mid hover:text-kf-text-light" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {clients
                        .filter(
                          (client) =>
                            client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                            (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
                            (client.phone && client.phone.includes(clientSearch)),
                        )
                        .map((client) => (
                          <SelectItem key={client._id} value={client._id} className="py-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{client.name}</span>
                              {(client.email || client.phone) && (
                                <span className="text-xs text-kf-text-mid mt-1">
                                  {client.email && <span>{client.email}</span>}
                                  {client.email && client.phone && <span> • </span>}
                                  {client.phone && <span>{client.phone}</span>}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      {clients.filter(
                        (client) =>
                          client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                          (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
                          (client.phone && client.phone.includes(clientSearch)),
                      ).length === 0 && (
                          <div className="px-3 py-4 text-sm text-kf-text-mid text-center">No clients found</div>
                        )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>



            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeDelivery"
                  checked={formData.includeDeliveryCost}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeDeliveryCost: checked as boolean })}
                />
                <Label htmlFor="includeDelivery" className="text-kf-text-mid cursor-pointer">
                  Include Delivery Cost
                </Label>
              </div>
              {formData.includeDeliveryCost && (
                <Input
                  type="number"
                  placeholder="Delivery cost (£)"
                  value={formData.deliveryCost}
                  onChange={(e) => setFormData({ ...formData, deliveryCost: Number.parseFloat(e.target.value) || 0 })}
                  className="bg-muted border-kf-border"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="includeVAT"
                checked={formData.includeVAT}
                onCheckedChange={(checked) => setFormData({ ...formData, includeVAT: checked as boolean })}
              />
              <Label htmlFor="includeVAT" className="text-kf-text-mid cursor-pointer">
                Include VAT in Product Cost
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid font-semibold">
                {isCreateOpen ? "Add Products" : "Add More Products"}
              </Label>
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kf-text-mid" />
                    <Input
                      placeholder="Search products by name or Serial No..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value)
                        setShowProductDropdown(true)
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="bg-muted border-kf-border pl-10"
                    />
                    {productSearch && (
                      <button
                        onClick={() => {
                          setProductSearch("")
                          setShowProductDropdown(false)
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-kf-text-mid hover:text-kf-text-light" />
                      </button>
                    )}
                  </div>
                  {showProductDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-kf-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => {
                              setSelectedProductId(product._id)
                              setProductSearch(product.name)
                              setShowProductDropdown(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm text-kf-text-light border-b border-kf-border last:border-b-0"
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-kf-text-mid">
                              Serial No: {product.serialNo} - £{product.sellingPrice.toFixed(2)} - Stock:{" "}
                              {product.stock} {product.unit}s
                            </div>
                            {product.stock < product.minStockLevel && (
                              <div className="text-xs text-red-500 mt-1">⚠️ Low stock</div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-kf-text-mid">No products found</div>
                      )}
                    </div>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={selectedProductQty}
                  onChange={(e) => setSelectedProductQty(e.target.value)}
                  className="w-20 bg-muted border-kf-border"
                  min="1"
                />
                <Button
                  onClick={addProductLine}
                  className="bg-primary hover:bg-primary/90"
                  disabled={!selectedProductId}
                >
                  Add
                </Button>
              </div>
              {selectedProductId && (
                <div className="text-sm text-kf-text-mid">
                  Selected: {getProductName({ productId: selectedProductId })} - £{getProductPrice(selectedProductId).toFixed(2)}
                </div>
              )}
            </div>

            {formData.lines.length > 0 && (
              <div className="space-y-2 border-t border-kf-border pt-4">
                <Label className="text-kf-text-mid font-semibold">Order Items</Label>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-kf-border">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-center py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lines.map((line, index) => {
                      const product = products.find((p) => p._id === line.productId)
                      const vatRate = getProductVAT(line.productId)
                      let lineTotal = line.qty * line.price
                      if (formData.includeVAT) {
                        lineTotal = lineTotal * (1 + vatRate / 100)
                      }
                      return (
                        <tr key={`${line.productId}-${index}`} className="border-b border-kf-border">
                          <td className="py-2">
                            <div>
                              <div>{getProductName(line)}</div>
                              {product && (
                                <div className="text-xs text-kf-text-mid">
                                  Stock: {product.stock} {product.unit}s
                                  {line.qty > product.stock && (
                                    <span className="text-red-500 ml-2">⚠️ Exceeds available stock!</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-right">{line.qty}</td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-sm">£</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={line.price}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0
                                  setFormData({
                                    ...formData,
                                    lines: formData.lines.map((l, i) =>
                                      i === index ? { ...l, price: newPrice } : l
                                    )
                                  })
                                }}
                                className="w-20 text-right bg-muted border-kf-border h-8 px-2"
                              />
                            </div>
                          </td>
                          <td className="text-right">£{lineTotal.toFixed(2)}</td>
                          <td className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeProductLine(line.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td colSpan={3} className="text-right py-2">
                        Total:
                      </td>
                      <td className="text-right py-2">£{calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-kf-border">
              <Button
                variant="outline"
                className="flex-1 border-kf-border bg-transparent"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleCreateOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modify Order Dialog - FIXED: Client cannot be changed, only add products */}
      <Dialog open={isModifyOpen} onOpenChange={setIsModifyOpen}>
        <DialogContent className="max-w-6xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 mb-2">
              <DialogTitle>Modify Order</DialogTitle>
              <div className="flex gap-2">
                <Select
                  value={orderType || "By Invoice"}
                  onValueChange={(v) => setOrderType(v as any)}
                >
                  <SelectTrigger className="w-32 bg-muted border-kf-border">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-kf-border">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="On Account">On Account</SelectItem>
                    <SelectItem value="By Invoice">By Invoice</SelectItem>
                    <SelectItem value="Picking List">Picking List</SelectItem>
                    <SelectItem value="Proforma">Proforma</SelectItem>
                  </SelectContent>
                </Select>
                {orderType && (
                  <Badge className="bg-primary text-primary-foreground text-base px-3 py-1">{orderType}</Badge>
                )}
              </div>
            </div>
            <DialogDescription>Update order details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* FIXED: Client display only - cannot be changed */}
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Client</Label>
              <div className="p-3 bg-muted border border-kf-border rounded-md">
                <div className="font-medium text-kf-text-light">
                  {formData.clientId ? getClientName(formData.clientId) : "No client selected"}
                </div>
                <div className="text-sm text-kf-text-mid mt-1">Client cannot be changed for existing orders</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                <SelectTrigger className="bg-muted border-kf-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-kf-border">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>



            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeDeliveryModify"
                  checked={formData.includeDeliveryCost}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeDeliveryCost: checked as boolean })}
                />
                <Label htmlFor="includeDeliveryModify" className="text-kf-text-mid cursor-pointer">
                  Include Delivery Cost
                </Label>
              </div>
              {formData.includeDeliveryCost && (
                <Input
                  type="number"
                  placeholder="Delivery cost (£)"
                  value={formData.deliveryCost}
                  onChange={(e) => setFormData({ ...formData, deliveryCost: Number.parseFloat(e.target.value) || 0 })}
                  className="bg-muted border-kf-border"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="includeVATModify"
                checked={formData.includeVAT}
                onCheckedChange={(checked) => setFormData({ ...formData, includeVAT: checked as boolean })}
              />
              <Label htmlFor="includeVATModify" className="text-kf-text-mid cursor-pointer">
                Include VAT in Product Cost
              </Label>
            </div>

            {/* FIXED: Product section - can add more products */}
            <div className="space-y-2">
              <Label className="text-kf-text-mid font-semibold">
                {isCreateOpen ? "Add Products" : "Add More Products"}
              </Label>
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kf-text-mid" />
                    <Input
                      placeholder="Search products by name or Serial No..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value)
                        setShowProductDropdown(true)
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="bg-muted border-kf-border pl-10"
                    />
                    {productSearch && (
                      <button
                        onClick={() => {
                          setProductSearch("")
                          setShowProductDropdown(false)
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-kf-text-mid hover:text-kf-text-light" />
                      </button>
                    )}
                  </div>
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-kf-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => {
                            setSelectedProductId(product._id)
                            setProductSearch(product.name) // Show selected product name
                            setShowProductDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm text-kf-text-light border-b border-kf-border last:border-b-0"
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-kf-text-mid">
                            Serial No: {product.serialNo} - £{product.sellingPrice.toFixed(2)}
                            {isModifyOpen && ` - Stock: ${product.stock}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={selectedProductQty}
                  onChange={(e) => setSelectedProductQty(e.target.value)}
                  className="w-20 bg-muted border-kf-border"
                  min="1"
                />
                <Button
                  onClick={addProductLine}
                  className="bg-primary hover:bg-primary/90"
                  disabled={!selectedProductId}
                >
                  Add
                </Button>
              </div>
              {selectedProductId && (
                <div className="text-sm text-kf-text-mid">
                  Selected: {getProductName({ productId: selectedProductId })} - £{getProductPrice(selectedProductId).toFixed(2)}
                </div>
              )}
            </div>

            {formData.lines.length > 0 && (
              <div className="space-y-2 border-t border-kf-border pt-4">
                <Label className="text-kf-text-mid font-semibold">Order Items ({formData.lines.length} items)</Label>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-kf-border">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-center py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lines.map((line, index) => {
                      const product = products.find((p) => p._id === line.productId)
                      const vatRate = getProductVAT(line.productId)
                      let lineTotal = line.qty * line.price
                      if (formData.includeVAT) {
                        lineTotal = lineTotal * (1 + vatRate / 100)
                      }
                      return (
                        <tr key={`${line.productId}-${index}`} className="border-b border-kf-border">
                          <td className="py-2">
                            <div>
                              <div>{getProductName(line)}</div>
                              {product && (
                                <div className="text-xs text-kf-text-mid">
                                  Stock: {product.stock} {product.unit}s
                                  {line.qty > product.stock && (
                                    <span className="text-red-500 ml-2">⚠️ Exceeds available stock!</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-right">{line.qty}</td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-sm">£</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={line.price}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0
                                  setFormData({
                                    ...formData,
                                    lines: formData.lines.map((l, i) =>
                                      i === index ? { ...l, price: newPrice } : l
                                    )
                                  })
                                }}
                                className="w-20 text-right bg-muted border-kf-border h-8 px-2"
                              />
                            </div>
                          </td>
                          <td className="text-right">£{lineTotal.toFixed(2)}</td>
                          <td className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeProductLine(line.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td colSpan={3} className="text-right py-2">
                        Total:
                      </td>
                      <td className="text-right py-2">£{calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-kf-border">
              <Button
                variant="outline"
                className="flex-1 border-kf-border bg-transparent"
                onClick={() => setIsModifyOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleUpdateOrder}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Order Details Modal - HTML Table Version */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl bg-sidebar border-kf-border max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-kf-text-light">Order Details</DialogTitle>
            <DialogDescription>View detailed information about order {selectedOrder?.orderNo}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Order Information - Fixed */}
              <div className="space-y-4 pb-4 flex-shrink-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order No</p>
                    <p className="font-semibold">{selectedOrder.orderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-semibold">{getClientName(selectedOrder.clientId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{selectedOrder.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="capitalize">{selectedOrder.status.replace("_", " ")}</Badge>
                  </div>

                  {selectedOrder.deliveryCost && (
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Cost</p>
                      <p className="font-semibold">£{selectedOrder.deliveryCost.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Section */}
              <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="font-semibold mb-3 text-kf-text-light flex-shrink-0">Order Items</h3>
                <div className="border border-kf-border rounded-lg flex-1 min-h-0 flex flex-col overflow-hidden">
                  {/* Table Container */}
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-card z-10">
                          <tr className="border-b border-kf-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Qty</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Price</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.lines.map((line, index) => {
                            const vatRate = getProductVAT(line.productId)
                            let lineTotal = line.qty * line.price
                            if (selectedOrder.includeVAT) {
                              lineTotal = lineTotal * (1 + vatRate / 100)
                            }
                            return (
                              <tr key={`${line.productId}-${index}`} className="border-b border-kf-border">
                                <td className="py-3 px-4 text-sm text-kf-text-light">
                                  {getProductName(line)}
                                </td>
                                <td className="py-3 px-4 text-sm text-kf-text-light">{line.qty}</td>
                                <td className="py-3 px-4 text-sm text-kf-text-light">
                                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(line.price)}
                                </td>
                                <td className="py-3 px-4 text-sm text-kf-text-light">
                                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                                    lineTotal,
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table Footer - Fixed */}
                  <table className="w-full border-collapse flex-shrink-0">
                    <tfoot>
                      <tr className="bg-muted border-t border-kf-border">
                        <td colSpan={3} className="text-right py-3 px-4 text-sm font-bold text-kf-text-light">
                          Grand Total
                        </td>
                        <td className="text-right py-3 px-4 text-sm font-bold text-kf-text-light">
                          £{selectedOrder.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Always visible */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-kf-border flex-shrink-0">
            <Button
              variant="outline"
              className="flex-1 border-kf-border hover:bg-muted transition-colors bg-transparent"
              onClick={() => setIsViewOpen(false)}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 transition-colors"
              onClick={() => exportOrderReceipt(selectedOrder)}
              disabled={exportingReceipt}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportingReceipt ? "Exporting..." : "Export Receipt"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Alert */}
      < AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen} >
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-light">Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              Are you sure you want to cancel order {selectedOrder?.orderNo}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrder}
              disabled={deletingOrder}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deletingOrder ? "Deleting..." : "Yes, Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >

      {/* Status Change Dialog */}
      < AlertDialog open={isStatusOpen} onOpenChange={setIsStatusOpen} >
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-light">Change Order Status</AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              Select a new status for order {selectedOrder?.orderNo}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            {(["pending", "in_progress", "dispatched", "delivered", "cancelled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updatingStatus}
                className="w-full text-left px-4 py-2 rounded-md hover:bg-muted transition-colors text-kf-text-light capitalize disabled:opacity-50"
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >

      {/* Delivered Orders Popup */}
      < Dialog open={isDeliveredPopupOpen} onOpenChange={setIsDeliveredPopupOpen} >
        <DialogContent className="max-w-4xl bg-sidebar border-kf-border max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-kf-text-light text-2xl font-bold">Delivered Orders</DialogTitle>
            <DialogDescription>View and manage orders that have been delivered</DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mt-4 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number, client, or invoice..."
              value={deliveredOrderSearch}
              onChange={(e) => setDeliveredOrderSearch(e.target.value)}
              className="pl-9 bg-background border-kf-border h-9"
            />
          </div>

          <div className="mt-4 overflow-y-auto flex-1 pr-2">
            {orders.filter((o) => o.status === "delivered").length === 0 ? (
              <p className="text-center text-kf-text-mid py-6">No delivered orders yet.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-kf-border">
                    <th className="text-left py-2 px-3">Order No</th>
                    <th className="text-left py-2 px-3">Client</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Total</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter((o) => o.status === "delivered")
                    .filter((order) => {
                      if (!deliveredOrderSearch) return true
                      const searchLower = deliveredOrderSearch.toLowerCase()
                      return (
                        order.orderNo?.toLowerCase().includes(searchLower) ||
                        order.invoiceNo?.toLowerCase().includes(searchLower) ||
                        getClientName(order.clientId).toLowerCase().includes(searchLower) ||
                        order.invoiceType?.toLowerCase().includes(searchLower)
                      )
                    })
                    .map((order) => (
                      <tr key={order._id} className="border-b border-kf-border hover:bg-muted">
                        <td className="py-2 px-3">{order.orderNo}</td>
                        <td className="py-2 px-3">{getClientName(order.clientId)}</td>
                        <td className="py-2 px-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-3 font-semibold">£{order.total.toFixed(2)}</td>
                        <td className="py-2 px-3">
                          <Badge variant="default" className="capitalize">
                            Delivered
                          </Badge>
                        </td>
                        <td className="py-2 px-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 border-kf-border bg-transparent"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsModifyDeliveredOpen(true)
                            }}
                          >
                            Modify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive/90 border-kf-border bg-transparent"
                            onClick={() => handleDeleteDelivered(order._id)}
                            disabled={deletingDelivered === order._id}
                          >
                            {deletingDelivered === order._id ? "Deleting..." : "Delete"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-kf-border flex-shrink-0">
            <Button
              variant="outline"
              className="border-kf-border bg-transparent"
              onClick={() => setIsDeliveredPopupOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* Modify Delivered Order Confirmation */}
      < AlertDialog open={isModifyDeliveredOpen} onOpenChange={setIsModifyDeliveredOpen} >
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-light">Modify Delivered Order</AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              Do you want to change the status of order <strong>{selectedOrder?.orderNo}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Label className="text-kf-text-mid">New Status</Label>
            <Select onValueChange={(v) => setNewDeliveredStatus(v as BackendOrder["status"])} defaultValue="pending">
              <SelectTrigger className="bg-muted border-kf-border">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-kf-border">
                <SelectItem value="On Account">On Account</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Picking List">Picking List</SelectItem>
                <SelectItem value="Proforma">Proforma</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
              </SelectContent>

            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleModifyDeliveredConfirm}
              disabled={modifyingDelivered}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {modifyingDelivered ? "Confirming..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}