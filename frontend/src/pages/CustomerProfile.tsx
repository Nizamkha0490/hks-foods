"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import api from "../utils/api"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trash2, X, Eye, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { refreshStats } from "../utils/stats";

interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
  }
}

interface Transaction {
  _id: string
  orderNo: string
  createdAt: string
  status: string
  total: number
  paymentMethod: string
}

interface CreditNote {
  _id: string
  creditNoteNo: string
  orderNo?: string
  createdAt: string
  status: string
  totalAmount: number
  type: "cancellation" | "return"
  items: any[]
  orderId?: string
  isDeleted?: boolean
}

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalDues, setTotalDues] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoiceType, setSelectedInvoiceType] = useState("All")
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentMethod: "Bank",
    otherPaymentMethod: "",
  })
  const [isInvoiceListOpen, setIsInvoiceListOpen] = useState(false)
  const [invoices, setInvoices] = useState<Transaction[]>([])
  const [isPaymentListOpen, setIsPaymentListOpen] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [isCreditNoteListOpen, setIsCreditNoteListOpen] = useState(false)
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([])
  const [creditNoteTab, setCreditNoteTab] = useState<"cancelled" | "returned">("returned")
  const [isAddCreditNoteOpen, setIsAddCreditNoteOpen] = useState(false)
  const [creditNoteFormData, setCreditNoteFormData] = useState({
    items: [] as any[],
    totalAmount: 0,
    reason: "",
  })
  const [products, setProducts] = useState<any[]>([])
  const [isPrintStatementOpen, setIsPrintStatementOpen] = useState(false)
  const [statementType, setStatementType] = useState("all")
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [isModifyOpen, setIsModifyOpen] = useState(false)
  const [addingPayment, setAddingPayment] = useState(false)
  const [printingStatement, setPrintingStatement] = useState(false)
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [updatingCustomer, setUpdatingCustomer] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [deletingPayment, setDeletingPayment] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
    },
  })
  // Add these state variables
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string, amount: number } | null>(null)

  // New state for Credit Note Overhaul
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // State for editing credit notes
  const [isEditCreditNoteOpen, setIsEditCreditNoteOpen] = useState(false)
  const [editingCreditNote, setEditingCreditNote] = useState<CreditNote | null>(null)
  const [updatingCreditNote, setUpdatingCreditNote] = useState(false)
  const [addingCreditNote, setAddingCreditNote] = useState(false)

  const openModifyDialog = () => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: {
          street: customer.address?.street || "",
          city: customer.address?.city || "",
          postalCode: customer.address?.postalCode || "",
        },
      })
      setIsModifyOpen(true)
    }
  }

  const fetchCustomerProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/clients/${id}/profile`)
      setCustomer(response.data.client)
      setTransactions(response.data.transactions || [])
      setTotalDues(response.data.totalDues)
      return response.data; // Add this return statement
    } catch (error) {
      console.error("Error fetching customer profile:", error)
      toast.error("Error loading customer profile")
    } finally {
      setLoading(false)
    }
  }

  // Add this delete function
  const handleDeletePayment = async (paymentId: string, amount: number) => {
    setPaymentToDelete({ id: paymentId, amount })
  }

  const confirmDeletePayment = async () => {
    if (!paymentToDelete || !id) return

    try {
      setDeletingPayment(true);

      await api.delete(`/payments/${paymentToDelete.id}`)

      // Refresh the customer profile to update total dues
      await fetchCustomerProfile()

      // Refresh payments list
      const response = await api.get(`/payments/client/${id}`)
      setPayments(response.data.payments)

      toast.success("Payment deleted successfully")
      setPaymentToDelete(null)
    } catch (error: any) {
      console.error("Error deleting payment:", error)
      toast.error(error.response?.data?.message || "Error deleting payment")
    } finally {
      setDeletingPayment(false);

    }
  }
  const handleUpdateCustomer = async () => {
    if (!id) return

    try {
      setUpdatingCustomer(true);

      await api.put(`/clients/${id}`, formData)
      setIsModifyOpen(false)
      // Call the fetch function that's defined in the component
      const response = await api.get(`/clients/${id}/profile`);
      console.log('Profile API response:', response.data); // Check what's returned

      setCustomer(response.data.client);
      setTransactions(response.data.transactions);
      setTotalDues(response.data.totalDues);
      console.log('Updated totalDues state:', response.data.totalDues); // Verify state update
      toast.success("Customer updated successfully")
    } catch (error) {
      console.error("Error updating customer:", error)
      toast.error("Error updating customer")
    } finally {
      setUpdatingCustomer(false);

    }
  }

  useEffect(() => {
    if (id) {
      fetchCustomerProfile()
    }
  }, [id])

  useEffect(() => {
    if (isAddCreditNoteOpen && id) {
      fetchEligibleOrders()
      fetchCreditNotes(false) // Fetch without opening list modal
    }
  }, [isAddCreditNoteOpen, id])

  const handleAddPayment = async () => {
    try {
      setAddingPayment(true);

      // Change this line to match the backend route
      await api.post(`/payments`, {
        ...paymentFormData,
        clientId: id
      });
      await fetchCustomerProfile();
      await refreshStats();
      window.dispatchEvent(new Event("stats-updated"));

      toast.success("Payment added successfully");
      setIsAddPaymentOpen(false);
      setPaymentFormData({
        amount: "",
        paymentMethod: "Bank",
        otherPaymentMethod: ""
      });
    } catch (error: any) {
      console.error("Error adding payment:", error);
      toast.error(error.response?.data?.message || "Error adding payment");
    } finally {
      setAddingPayment(false);

    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.orderNo.toLowerCase().includes(searchTerm.toLowerCase())

    let typeToMatch = selectedInvoiceType.toLowerCase().replace(/ /g, "_")

    const matchesType = selectedInvoiceType === "All" || (transaction as any).invoiceType === typeToMatch
    return matchesSearch && matchesType
  })

  const fetchInvoices = async () => {
    try {
      const response = await api.get(`/orders/client/${id}`)
      setInvoices(response.data.invoices || [])
      setIsInvoiceListOpen(true)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast.error("Error loading invoices")
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await api.get(`/payments/client/${id}`)
      setPayments(response.data.payments || [])
      setIsPaymentListOpen(true)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Error loading payments")
    }
  }

  const fetchCreditNotes = async (openModal = true) => {
    try {
      const response = await api.get(`/credit-notes/client/${id}`)
      setCreditNotes(response.data.creditNotes || [])
      if (openModal) {
        setIsCreditNoteListOpen(true)
      }
    } catch (error) {
      console.error("Error fetching credit notes:", error)
      toast.error("Error loading credit notes")
    }
  }

  const fetchEligibleOrders = async () => {
    if (!id) return
    try {
      setLoadingOrders(true)
      const response = await api.get(`/orders/client/${id}`)
      setEligibleOrders(response.data.orders || [])
    } catch (error) {
      console.error("Error fetching eligible orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleOrderSelect = (orderId: string) => {
    const order = eligibleOrders.find((o) => o._id === orderId)
    setSelectedOrder(order)
    if (order) {
      // Calculate previously returned quantities
      console.log("Selected Order:", order);
      console.log("All Credit Notes:", creditNotes);

      const relevantCreditNotes = creditNotes.filter(cn =>
        (cn.orderId === orderId || cn.orderNo === order.orderNo) &&
        cn.type === 'return' &&
        !cn.isDeleted
      );

      console.log("Relevant Credit Notes:", relevantCreditNotes);

      const returnedQuantities: Record<string, number> = {};
      relevantCreditNotes.forEach(cn => {
        if (cn.items) {
          cn.items.forEach(item => {
            if (item.productId) {
              // item.productId might be an object or string depending on population
              const pId = typeof item.productId === 'object' ? item.productId._id : item.productId;
              returnedQuantities[pId] = (returnedQuantities[pId] || 0) + item.qty;
            }
          });
        }
      });

      console.log("Returned Quantities:", returnedQuantities);

      setReturnItems(
        order.lines.map((line: any) => {
          const pId = line.productId._id;
          const previouslyReturned = returnedQuantities[pId] || 0;
          const remainingQty = Math.max(0, line.qty - previouslyReturned);

          return {
            productId: pId,
            name: line.productId.name,
            price: line.price,
            maxQty: remainingQty, // Set maxQty to remaining
            originalQty: line.qty,
            returnQty: 0,
            vat: line.productId.vat !== undefined ? line.productId.vat : 20,
          }
        }),
      )
      setCreditNoteFormData((prev) => ({ ...prev, totalAmount: 0 }))
    } else {
      setReturnItems([])
      setCreditNoteFormData((prev) => ({ ...prev, totalAmount: 0 }))
    }
  }

  const handleReturnItemChange = (index: number, qty: number) => {
    const newItems = [...returnItems]
    newItems[index].returnQty = Math.min(Math.max(0, qty), newItems[index].maxQty)
    setReturnItems(newItems)

    const total = newItems.reduce((sum, item) => {
      let itemTotal = item.returnQty * item.price
      if (selectedOrder?.includeVAT !== false) {
        const vatRate = item.vat !== undefined ? item.vat : 20
        itemTotal = itemTotal * (1 + vatRate / 100)
      }
      return sum + itemTotal
    }, 0)
    setCreditNoteFormData((prev) => ({ ...prev, totalAmount: total }))
  }

  const handleAddCreditNote = async () => {
    if (!id) return

    // If manual amount is entered without order selection (legacy support or override)
    // But user requested "fetch whenever i tries to enter credit note"
    // So we prioritize the selected items if an order is selected

    let itemsToReturn = []
    let amount = creditNoteFormData.totalAmount

    if (selectedOrder) {
      itemsToReturn = returnItems
        .filter(item => item.returnQty > 0)
        .map(item => ({
          productId: item.productId,
          qty: item.returnQty,
          price: item.price
        }))

      if (itemsToReturn.length === 0 && amount === 0) {
        toast.error("Please select items to return or enter an amount")
        return
      }
    } else if (amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      setAddingCreditNote(true)
      const response = await api.post("/credit-notes", {
        clientId: id,
        items: itemsToReturn,
        totalAmount: amount,
        type: "return",
        orderId: selectedOrder?._id
      })

      if (response.data.success) {
        toast.success("Credit note created successfully")
        setIsAddCreditNoteOpen(false)
        setCreditNoteFormData({ items: [], totalAmount: 0, reason: "" })
        setSelectedOrder(null)
        setReturnItems([])
        fetchCreditNotes()
        // Refresh customer profile to show updated dues if needed
        fetchCustomerProfile()
      }
    } catch (error) {
      console.error("Error creating credit note:", error)
      toast.error("Error creating credit note")
    } finally {
      setAddingCreditNote(false)
    }
  }

  const handleUpdateCreditNoteStatus = async (id: string, status: string) => {
    try {
      await api.put(`/credit-notes/${id}/status`, { status })
      toast.success("Status updated successfully")
      fetchCreditNotes()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error updating status")
    }
  }

  const handleEditCreditNote = async (note: CreditNote) => {
    setIsEditCreditNoteOpen(true)
    setEditingCreditNote(note)
    setLoadingOrders(true)

    try {
      let order = null;

      // 1. Try to find in existing eligibleOrders
      if (note.orderNo) {
        order = eligibleOrders.find(o => o.orderNo === note.orderNo)
      }

      // 2. If not found, and we have an orderId or orderNo, fetch it specifically
      if (!order && (note.orderId || note.orderNo)) {
        try {
          // If we have ID, use it. If not, we might need to search by orderNo (but API usually needs ID)
          // The note.orderId should be available if it was linked correctly.
          // If only orderNo is available, we might need a search endpoint, but let's try to rely on orderId if possible.
          // Fallback: If we only have orderNo, we might need to fetch all client orders or use a search API.
          // For now, let's assume orderId is best, or we fetch client orders if list is empty.

          if (note.orderId) {
            const response = await api.get(`/orders/${note.orderId}`)
            if (response.data.success) {
              order = response.data.order
              // Add to eligibleOrders so it's available in the list
              setEligibleOrders(prev => {
                if (!prev.find(o => o._id === order._id)) {
                  return [...prev, order]
                }
                return prev
              })
            }
          } else if (note.orderNo && eligibleOrders.length === 0) {
            // If we don't have orderId but have orderNo and list is empty, 
            // we might need to fetch client orders to find it.
            // This is the slow path we want to avoid, but it's a fallback.
            const response = await api.get(`/orders/client/${id}`)
            const orders = response.data.orders || []
            setEligibleOrders(orders)
            order = orders.find((o: any) => o.orderNo === note.orderNo)
          }

        } catch (err) {
          console.error("Error fetching specific order for credit note:", err)
        }
      }

      if (order) {
        setSelectedOrder(order)
        // Pre-fill return items with current credit note items
        const items = note.items.map((item: any) => {
          // Find the original line in the order to get the correct VAT
          const originalLine = order.lines.find((l: any) => {
            const linePId = typeof l.productId === 'object' ? l.productId._id : l.productId;
            const itemPId = item.productId._id || item.productId;
            return linePId === itemPId;
          });

          // Get VAT from original line, or item, or default to 20
          // Check for undefined/null explicitly to allow 0% VAT
          let vat = 20;
          if (originalLine && originalLine.productId && originalLine.productId.vat !== undefined) {
            vat = originalLine.productId.vat;
          } else if (item.vat !== undefined) {
            vat = item.vat;
          }

          return {
            productId: item.productId._id || item.productId,
            name: item.productName || item.productId.name || "Unknown",
            price: item.price,
            maxQty: item.qty, // In edit mode, we allow changing quantities
            returnQty: 0, // Initialize to 0 as requested
            vat: vat,
          }
        })
        setReturnItems(items)
      } else {
        // If no order found, just clear selection
        setSelectedOrder(null)
        setReturnItems([])
      }

      setCreditNoteFormData({
        items: note.items,
        totalAmount: 0, // Initialize to 0 as requested
        reason: "",
      })

    } catch (error) {
      console.error("Error preparing edit credit note:", error)
      toast.error("Error loading credit note details")
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleUpdateCreditNote = async () => {
    if (!editingCreditNote) return

    let itemsToReturn: any[] = []
    let amount = creditNoteFormData.totalAmount

    if (selectedOrder) {
      itemsToReturn = returnItems
        .filter(item => item.returnQty > 0)
        .map(item => ({
          productId: item.productId,
          qty: item.returnQty,
          price: item.price
        }))

      if (itemsToReturn.length === 0 && amount === 0) {
        toast.error("Please select items to return or enter an amount")
        return
      }
    } else if (amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      setUpdatingCreditNote(true)
      await api.put(`/credit-notes/${editingCreditNote._id}`, {
        items: itemsToReturn,
        totalAmount: amount,
      })

      toast.success("Credit note updated successfully")
      setIsEditCreditNoteOpen(false)
      setEditingCreditNote(null)
      setCreditNoteFormData({ items: [], totalAmount: 0, reason: "" })
      setSelectedOrder(null)
      setReturnItems([])
      fetchCreditNotes()
      fetchCustomerProfile()
    } catch (error) {
      console.error("Error updating credit note:", error)
      toast.error("Error updating credit note")
    } finally {
      setUpdatingCreditNote(false)
    }
  }

  const handleDeleteCreditNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credit note?")) return
    try {
      await api.delete(`/credit-notes/${id}`)
      toast.success("Credit Note deleted successfully")
      fetchCreditNotes()
      fetchCustomerProfile() // Refresh to update totalDues
    } catch (error) {
      console.error("Error deleting credit note:", error)
      toast.error("Error deleting credit note")
    }
  }

  const handlePrintStatement = async () => {
    try {
      setPrintingStatement(true)
      const response = await api.get(
        `/clients/${id}/statement?from=${dateRange.from}&to=${dateRange.to}&type=${statementType}&invoiceType=${invoiceTypeFilter}`,
        {
          responseType: "blob",
        },
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = `statement-${customer?.name}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error("Error printing statement:", error)
      toast.error("Error printing statement")
    } finally {
      setPrintingStatement(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Loading customer profile...</div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Customer not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-kf-text-dark mb-1">{customer.name}</h1>
            <p className="text-sm md:text-base text-kf-text-mid">{customer.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openModifyDialog} className="min-h-[44px]">
              Modify
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsViewDetailsOpen(true)} className="min-h-[44px] min-w-[44px]">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-kf-text-mid text-sm">Total Dues</p>
          <p className="text-xl md:text-2xl font-bold text-kf-text-dark">
            {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(totalDues)}
          </p>
        </div>
      </div>

      <Dialog open={isModifyOpen} onOpenChange={setIsModifyOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Modify Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white text-gray-900 border-kf-border"
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white text-gray-900 border-kf-border"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white text-gray-900 border-kf-border"
                placeholder="Phone number"
              />
            </div>

            <div className="border-t border-kf-border pt-4">
              <Label className="text-kf-text-mid font-semibold">Address (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-kf-text-mid">Street</Label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    className="bg-white text-gray-900 border-kf-border"
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-kf-text-mid">City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    className="bg-white text-gray-900 border-kf-border"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-kf-text-mid">Postal Code</Label>
                  <Input
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, postalCode: e.target.value },
                      })
                    }
                    className="bg-white text-gray-900 border-kf-border"
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModifyOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCustomer}
              disabled={updatingCustomer}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {updatingCustomer ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-3 md:p-6 bg-card border-kf-border card-shadow">
        <div className="mb-4 flex flex-col gap-3 md:gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-kf-background border-kf-border text-sm md:text-base min-h-[44px]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsAddPaymentOpen(true)} className="flex-1 sm:flex-none text-sm min-h-[44px]">
              Add Payment
            </Button>

            <Button variant="outline" onClick={fetchPayments} className="flex-1 sm:flex-none text-sm min-h-[44px]">
              Payment List
            </Button>
            <Button variant="outline" onClick={() => fetchCreditNotes(true)} className="flex-1 sm:flex-none text-sm min-h-[44px]">
              Credit Note List
            </Button>
            <Button variant="outline" onClick={() => setIsAddCreditNoteOpen(true)} className="flex-1 sm:flex-none text-sm min-h-[44px]">
              Add Credit Note
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPrintStatementOpen(true)}
              className="flex-1 sm:flex-none text-sm min-h-[44px]"
            >
              Print Statement
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {["All", "Invoice", "Cash", "On Account", "Picking List", "Proforma"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedInvoiceType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedInvoiceType === type
                ? "bg-kf-green text-white"
                : "bg-muted text-kf-text-mid hover:bg-muted/80"
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kf-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Transaction Number</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date/Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Total Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Paid Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">{transaction.orderNo}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-dark">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">
                    <span className="capitalize">{(transaction as any).invoiceType?.replace("_", " ") || transaction.status}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(transaction.total)}
                  </td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">{transaction.paymentMethod}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(transaction.total)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-kf-text-mid">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Payment Modal */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="max-w-md bg-sidebar border-kf-border" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Amount *</Label>
              <Input
                type="number"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                className="bg-white text-gray-900 border-kf-border"
                placeholder="Payment amount"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Payment Method *</Label>
              <select
                value={paymentFormData.paymentMethod}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                className="w-full p-2 bg-white text-gray-900 border border-kf-border rounded-md"
              >
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="Credit">Credit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {paymentFormData.paymentMethod === "Other" && (
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Other Payment Method *</Label>
                <Input
                  value={paymentFormData.otherPaymentMethod}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, otherPaymentMethod: e.target.value })}
                  className="bg-white text-gray-900 border-kf-border"
                  placeholder="Specify payment method"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleAddPayment}
              disabled={addingPayment || !paymentFormData.amount}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {addingPayment ? "Adding..." : "Add Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice List Modal */}
      <Dialog open={isInvoiceListOpen} onOpenChange={setIsInvoiceListOpen}>
        <DialogContent className="max-w-4xl bg-sidebar border-kf-border max-h-[80vh] flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Invoice List</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-kf-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Invoice No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Selling Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Total VAT</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">{invoice.orderNo}</td>
                    <td className="py-3 px-4 text-sm text-kf-text-dark">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-kf-text-mid">{invoice.paymentMethod}</td>
                    <td className="py-3 px-4 text-sm text-kf-text-mid">
                      {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(invoice.total)}
                    </td>
                    <td className="py-3 px-4 text-sm text-kf-text-mid">
                      {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                        invoice.total * 0.2,
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white bg-kf-red hover:bg-kf-red-dark">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-kf-text-mid">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment List Modal */}
      <Dialog open={isPaymentListOpen} onOpenChange={setIsPaymentListOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[80vh] flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Payment List</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-kf-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Pay No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Amount Paid</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">{payment.paymentNo}</td>
                    <td className="py-3 px-4 text-sm text-kf-text-dark">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-kf-text-mid">{payment.paymentMethod}</td>
                    <td className="py-3 px-4 text-sm text-kf-text-mid">
                      {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(payment.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white bg-kf-red hover:bg-kf-red-dark"
                        onClick={() => handleDeletePayment(payment._id, payment.amount)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-kf-text-mid">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Note List Modal */}
      <Dialog open={isCreditNoteListOpen} onOpenChange={setIsCreditNoteListOpen}>
        <DialogContent className="max-w-4xl bg-sidebar border-kf-border max-h-[80vh] flex flex-col" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Credit Note List</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search credit notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-kf-background border-kf-border"
              />
            </div>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-kf-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Ref No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
                </tr>
              </thead>
              <tbody>
                {creditNotes
                  .filter(note => {
                    // Only show returned items
                    const typeMatch = note.type === "return";

                    // Filter by search term
                    const searchMatch = !searchTerm ||
                      (note.creditNoteNo && note.creditNoteNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (note.orderNo && note.orderNo.toLowerCase().includes(searchTerm.toLowerCase()));

                    return typeMatch && searchMatch;
                  })
                  .map((note) => (
                    <tr key={note._id} className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors">
                      <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">{note.creditNoteNo || note.orderNo}</td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-mid">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(note.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white bg-kf-green hover:bg-kf-green-dark"
                            onClick={() => handleEditCreditNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white bg-kf-red hover:bg-kf-red-dark"
                            onClick={() => handleDeleteCreditNote(note._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {creditNotes.filter(note => {
                  const typeMatch = creditNoteTab === "cancelled"
                    ? note.type === "cancellation"
                    : note.type === "return";
                  const searchMatch = !searchTerm ||
                    (note.creditNoteNo && note.creditNoteNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (note.orderNo && note.orderNo.toLowerCase().includes(searchTerm.toLowerCase()));
                  return typeMatch && searchMatch;
                }).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-kf-text-mid">
                        No credit notes found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Credit Note Modal (Overhauled) */}
      <Dialog open={isAddCreditNoteOpen} onOpenChange={setIsAddCreditNoteOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Add Credit Note (Return)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-auto flex-1 p-1">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Select Order (Optional)</Label>
              <div className="relative">
                <Select
                  value={selectedOrder?._id || ""}
                  onValueChange={(v) => handleOrderSelect(v)}
                  disabled={loadingOrders}
                >
                  <SelectTrigger className="bg-kf-background border-kf-border">
                    <SelectValue placeholder={loadingOrders ? "Loading orders..." : "Select or search order"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-kf-border p-0 max-h-60">
                    <div className="p-2 border-b border-kf-border sticky top-0 bg-popover z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kf-text-mid" />
                        <Input
                          placeholder="Search by order number..."
                          value={orderSearchTerm}
                          className="pl-8 h-9 text-sm bg-background border-kf-border"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          onChange={(e) => setOrderSearchTerm(e.target.value)}
                        />
                        {orderSearchTerm && (
                          <button
                            onClick={() => setOrderSearchTerm("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="h-4 w-4 text-kf-text-mid hover:text-kf-text-light" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {eligibleOrders
                        .filter(order => {
                          if (!orderSearchTerm) return true
                          const searchLower = orderSearchTerm.toLowerCase()
                          return (
                            (order.orderNo && order.orderNo.toLowerCase().includes(searchLower)) ||
                            (order._id && order._id.toLowerCase().includes(searchLower))
                          )
                        })
                        .map((order) => (
                          <SelectItem key={order._id} value={order._id} className="py-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{order.orderNo || order._id}</span>
                              <span className="text-xs text-kf-text-mid mt-1">
                                {new Date(order.createdAt).toLocaleDateString()} • {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(order.total)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      {eligibleOrders.filter(order => {
                        if (!orderSearchTerm) return true
                        const searchLower = orderSearchTerm.toLowerCase()
                        return (
                          (order.orderNo && order.orderNo.toLowerCase().includes(searchLower)) ||
                          (order._id && order._id.toLowerCase().includes(searchLower))
                        )
                      }).length === 0 && (
                          <div className="px-3 py-4 text-sm text-kf-text-mid text-center">No orders found</div>
                        )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedOrder && (
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Select Items to Return</Label>
                <div className="border border-kf-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-kf-background">
                      <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-center">Remaining Value</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-center">Deduct Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnItems.map((item, index) => (
                        <tr key={item.productId} className="border-t border-kf-border">
                          <td className="p-2">{item.name}</td>
                          <td className="p-2 text-center">
                            {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(item.maxQty * item.price)}
                          </td>
                          <td className="p-2 text-center">{item.maxQty}</td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              min="0"
                              max={item.maxQty}
                              value={item.returnQty}
                              onChange={(e) => handleReturnItemChange(index, parseInt(e.target.value) || 0)}
                              className="w-20 mx-auto h-8"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Total Refund Amount</Label>
              <Input
                type="number"
                value={creditNoteFormData.totalAmount}
                onChange={(e) => setCreditNoteFormData({ ...creditNoteFormData, totalAmount: Number(e.target.value) })}
                className="bg-kf-background border-kf-border font-bold"
                placeholder="Total Amount"
                readOnly={!!selectedOrder} // Read-only if calculated from items
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCreditNoteOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleAddCreditNote}
              disabled={addingCreditNote}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {addingCreditNote ? "Creating..." : "Create Credit Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Credit Note Modal */}
      <Dialog open={isEditCreditNoteOpen} onOpenChange={setIsEditCreditNoteOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Edit Credit Note (Return)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-auto flex-1 p-1">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Select Order (Optional)</Label>
              <div className="relative">
                <Select
                  value={selectedOrder?._id || ""}
                  onValueChange={(v) => handleOrderSelect(v)}
                  disabled={loadingOrders}
                >
                  <SelectTrigger className="bg-kf-background border-kf-border">
                    <SelectValue placeholder={loadingOrders ? "Loading orders..." : "Select or search order"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-kf-border p-0 max-h-60">
                    <div className="p-2 border-b border-kf-border sticky top-0 bg-popover z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kf-text-mid" />
                        <Input
                          placeholder="Search by order number..."
                          value={orderSearchTerm}
                          className="pl-8 h-9 text-sm bg-background border-kf-border"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          onChange={(e) => setOrderSearchTerm(e.target.value)}
                        />
                        {orderSearchTerm && (
                          <button
                            onClick={() => setOrderSearchTerm("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          >
                            <X className="h-4 w-4 text-kf-text-mid hover:text-kf-text-light" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {eligibleOrders
                        .filter(order => {
                          if (!orderSearchTerm) return true
                          const searchLower = orderSearchTerm.toLowerCase()
                          return (
                            (order.orderNo && order.orderNo.toLowerCase().includes(searchLower)) ||
                            (order._id && order._id.toLowerCase().includes(searchLower))
                          )
                        })
                        .map((order) => (
                          <SelectItem key={order._id} value={order._id} className="py-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{order.orderNo || order._id}</span>
                              <span className="text-xs text-kf-text-mid mt-1">
                                {new Date(order.createdAt).toLocaleDateString()} • {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(order.total)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      {eligibleOrders.filter(order => {
                        if (!orderSearchTerm) return true
                        const searchLower = orderSearchTerm.toLowerCase()
                        return (
                          (order.orderNo && order.orderNo.toLowerCase().includes(searchLower)) ||
                          (order._id && order._id.toLowerCase().includes(searchLower))
                        )
                      }).length === 0 && (
                          <div className="px-3 py-4 text-sm text-kf-text-mid text-center">No orders found</div>
                        )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedOrder && (
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Select Items to Return</Label>
                <div className="border border-kf-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-kf-background">
                      <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-center">Price</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-center">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnItems.map((item, index) => (
                        <tr key={item.productId} className="border-t border-kf-border">
                          <td className="p-2">{item.name}</td>
                          <td className="p-2 text-center">£{item.price}</td>
                          <td className="p-2 text-center">{item.maxQty}</td>
                          <td className="p-2 text-center">
                            <Input
                              type="number"
                              min="0"
                              max={item.maxQty}
                              value={item.returnQty}
                              onChange={(e) => handleReturnItemChange(index, parseInt(e.target.value) || 0)}
                              className="w-20 mx-auto h-8"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Total Refund Amount</Label>
              <Input
                type="number"
                value={creditNoteFormData.totalAmount}
                onChange={(e) => setCreditNoteFormData({ ...creditNoteFormData, totalAmount: Number(e.target.value) })}
                className="bg-kf-background border-kf-border font-bold"
                placeholder="Total Amount"
                readOnly={!!selectedOrder} // Read-only if calculated from items
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCreditNoteOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCreditNote}
              disabled={updatingCreditNote}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {updatingCreditNote ? "Updating..." : "Update Credit Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Statement Modal */}
      <Dialog open={isPrintStatementOpen} onOpenChange={setIsPrintStatementOpen}>
        <DialogContent className="max-w-md bg-sidebar border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Print Statement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Statement Type</Label>
              <select
                value={statementType}
                onChange={(e) => setStatementType(e.target.value)}
                className="w-full p-2 bg-kf-background border border-kf-border rounded-md"
              >
                <option value="all">All Transactions</option>
                <option value="invoices">Invoice List</option>
                <option value="payments">Payment List</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Account Type</Label>
              <select
                value={invoiceTypeFilter}
                onChange={(e) => setInvoiceTypeFilter(e.target.value)}
                disabled={statementType === "payments"}
                className="w-full p-2 bg-kf-background border border-kf-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">All Types</option>
                <option value="on_account">On Account</option>
                <option value="cash">Cash</option>
                <option value="invoice">Invoice</option>
                <option value="picking_list">Picking List</option>
                <option value="proforma">Proforma</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">From</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="bg-kf-background border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">To</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="bg-kf-background border-kf-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintStatementOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handlePrintStatement}
              disabled={printingStatement}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {printingStatement ? "Printing..." : "Print"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <DialogContent className="max-w-md bg-sidebar border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-kf-text-mid">
              Are you sure you want to delete this payment of{" "}
              {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(paymentToDelete?.amount || 0)}?
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentToDelete(null)}
              className="border-kf-border"
              disabled={deletingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeletePayment}
              className="bg-kf-red hover:bg-kf-red-dark text-white"
              disabled={deletingPayment}
            >
              {deletingPayment ? "Deleting..." : "Delete Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-md bg-sidebar border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Customer Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-kf-text-mid text-xs">Name</Label>
                <p className="text-kf-text-dark font-medium">{customer.name}</p>
              </div>
              <div>
                <Label className="text-kf-text-mid text-xs">Email</Label>
                <p className="text-kf-text-dark font-medium">{customer.email}</p>
              </div>
              <div>
                <Label className="text-kf-text-mid text-xs">Phone</Label>
                <p className="text-kf-text-dark font-medium">{customer.phone || "-"}</p>
              </div>
              <div>
                <Label className="text-kf-text-mid text-xs">Total Dues</Label>
                <p className="text-kf-text-dark font-medium">
                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(totalDues)}
                </p>
              </div>
            </div>
            <div className="border-t border-kf-border pt-4">
              <Label className="text-kf-text-mid text-xs">Address</Label>
              <div className="text-kf-text-dark font-medium mt-1">
                {customer.address ? (
                  <>
                    {customer.address.street && <div>{customer.address.street}</div>}
                    {customer.address.city && <div>{customer.address.city}</div>}
                    {customer.address.postalCode && <div>{customer.address.postalCode}</div>}
                  </>
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDetailsOpen(false)}
              className="border-kf-border"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}