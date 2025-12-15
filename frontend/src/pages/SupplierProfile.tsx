"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import api from "../utils/api"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Supplier {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

interface Transaction {
  _id: string
  purchaseOrderNo: string
  createdAt: string
  status: string
  totalAmount: number
  paymentMethod: string
  items: {
    productId: string
    productName: string
    qty: number
    unitPrice: number
    total: number
  }[]
}

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalDues, setTotalDues] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isRecordGoodsOpen, setIsRecordGoodsOpen] = useState(false)
  const [isModifyOpen, setIsModifyOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
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
  const [recordGoodsFormData, setRecordGoodsFormData] = useState({
    vatRate: 0,
    notes: "",
    items: [{ productId: "", productName: "", qty: 1, unitPrice: 0 }],
  })
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "Bank Transfer",
    otherPaymentMethod: "", // New field for custom payment method
  })
  const [isPrintStatementOpen, setIsPrintStatementOpen] = useState(false)
  const [statementType, setStatementType] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [printingStatement, setPrintingStatement] = useState(false)
  const [isModifyTransactionOpen, setIsModifyTransactionOpen] = useState(false)
  const [isDeleteTransactionOpen, setIsDeleteTransactionOpen] = useState(false)
  const [deletingPurchase, setDeletingPurchase] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [modifyFormData, setModifyFormData] = useState({
    dateReceived: "",
    notes: "",
    items: [{ productId: "", productName: "", qty: 1, unitPrice: 0 }],
  })
  const [isPaymentListOpen, setIsPaymentListOpen] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<'goods' | 'invoices'>('goods')

  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false)
  const [invoiceFormData, setInvoiceFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    invoiceNo: "",
    netAmount: "",
    vatAmount: "",
    description: "",
    paymentMethod: "", // Default empty or "Bank"? User said optional.
    otherPaymentMethod: "",
  })

  const handleAddItem = () => {
    setRecordGoodsFormData({
      ...recordGoodsFormData,
      items: [...recordGoodsFormData.items, { productId: "", productName: "", qty: 1, unitPrice: 0 }],
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...recordGoodsFormData.items]
    newItems.splice(index, 1)
    setRecordGoodsFormData({ ...recordGoodsFormData, items: newItems })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...recordGoodsFormData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setRecordGoodsFormData({ ...recordGoodsFormData, items: newItems })
  }

  const handleRecordGoods = async () => {
    if (!id) return

    try {
      setSubmitting(true)
      await api.post(`/suppliers/${id}/record`, recordGoodsFormData)
      setIsRecordGoodsOpen(false)
      // Reset form data to initial state
      setRecordGoodsFormData({
        vatRate: 0,
        notes: "",
        items: [{ productId: "", productName: "", qty: 1, unitPrice: 0 }],
      })
      fetchSupplierProfile()
      toast.success("Goods recorded successfully")
    } catch (error) {
      console.error("Error recording goods:", error)
      toast.error("Error recording goods")
    } finally {
      setSubmitting(false)
    }
  }

  // State for Modify Invoice
  const [isModifyInvoiceOpen, setIsModifyInvoiceOpen] = useState(false)
  const [modifyInvoiceFormData, setModifyInvoiceFormData] = useState({
    date: "",
    invoiceNo: "",
    netAmount: "",
    vatAmount: "",
    description: "",
    paymentMethod: "",
    otherPaymentMethod: "",
  })

  // Open appropriate dialog based on transaction type
  const openModifyTransactionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)

    // Check if it's likely an invoice (has paymentMethod or single item with potential Invoice name)
    // Strongest signal: paymentMethod field is present in the record (if we fetch it)
    // For now, let's assume if it has paymentMethod, use Modify Invoice. 
    // If not, fall back to Modify Goods. 
    // Note: Transaction interface might need update to include paymentMethod if not already there.
    // The previous view of code showed Transaction interface having paymentMethod: string.

    if (transaction.paymentMethod) {
      // It's an invoice
      setModifyInvoiceFormData({
        date: new Date(transaction.createdAt).toISOString().split('T')[0],
        invoiceNo: "", // Can't easily recover invoiceNo from purchaseOrderNo if it wasn't saved separately unless looking at transaction.invoiceNo? 
        // Wait, transaction interface might need invoiceNo? 
        // Let's assume transaction is the Purchase object which has invoiceNo.
        // Check if transaction has invoiceNo currently in interface? 
        // In SupplierProfile.tsx interface Transaction:
        // _id, purchaseOrderNo, createdAt,status, totalAmount, paymentMethod, items
        // It missed invoiceNo. I should check if API returns it. 
        // The API returns 'purchases' from getPurchasesForSupplier. 
        // Purchase model has invoiceNo. So it should be there.
        // Let's cast or update interface. 
        invoiceNo: (transaction as any).invoiceNo || "",
        netAmount: (transaction.items && transaction.items.length > 0) ? transaction.items[0].unitPrice.toString() : "",
        vatAmount: (transaction as any).vatAmount ? (transaction as any).vatAmount.toString() : "0",
        description: (transaction as any).notes || "",
        paymentMethod: ["Bank", "Cash"].includes(transaction.paymentMethod) ? transaction.paymentMethod : "Other",
        otherPaymentMethod: ["Bank", "Cash"].includes(transaction.paymentMethod) ? "" : transaction.paymentMethod
      })
      setIsModifyInvoiceOpen(true)
    } else {
      // It's traditional Record Goods
      setModifyFormData({
        dateReceived: new Date(transaction.createdAt).toISOString().split('T')[0],
        notes: "",
        items: transaction.items?.map(item => ({
          productId: item.productId,
          productName: item.productName,
          qty: item.qty,
          unitPrice: item.unitPrice
        })) || []
      })
      setIsModifyTransactionOpen(true)
    }
  }

  const handleUpdateInvoice = async () => {
    if (!selectedTransaction || !id) return
    if (!modifyInvoiceFormData.netAmount) {
      toast.error("Net Value is required")
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        dateReceived: modifyInvoiceFormData.date,
        invoiceNo: modifyInvoiceFormData.invoiceNo,
        netAmount: parseFloat(modifyInvoiceFormData.netAmount),
        vatAmount: parseFloat(modifyInvoiceFormData.vatAmount) || 0,
        notes: modifyInvoiceFormData.description,
        paymentMethod: modifyInvoiceFormData.paymentMethod === "Other"
          ? modifyInvoiceFormData.otherPaymentMethod
          : modifyInvoiceFormData.paymentMethod
      }

      await api.put(`/suppliers/${id}/invoice/${selectedTransaction._id}`, payload)
      setIsModifyInvoiceOpen(false)
      fetchSupplierProfile()
      toast.success("Invoice updated successfully")
    } catch (error: any) {
      console.error("Error updating invoice:", error)
      toast.error(error.response?.data?.message || "Error updating invoice")
    } finally {
      setSubmitting(false)
    }
  }

  const handleModifyItemChange = (index: number, field: string, value: any) => {
    const newItems = [...modifyFormData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setModifyFormData({ ...modifyFormData, items: newItems })
  }

  const handleAddModifyItem = () => {
    setModifyFormData({
      ...modifyFormData,
      items: [...modifyFormData.items, { productId: "", productName: "", qty: 1, unitPrice: 0 }],
    })
  }

  const handleRemoveModifyItem = (index: number) => {
    const newItems = [...modifyFormData.items]
    newItems.splice(index, 1)
    setModifyFormData({ ...modifyFormData, items: newItems })
  }

  const handleUpdatePurchase = async () => {
    if (!selectedTransaction || !id) return

    try {
      setSubmitting(true)
      await api.put(`/suppliers/${id}/purchases/${selectedTransaction._id}`, modifyFormData)
      setIsModifyTransactionOpen(false)
      fetchSupplierProfile()
      toast.success("Purchase updated successfully")
    } catch (error) {
      console.error("Error updating purchase:", error)
      toast.error("Error updating purchase")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePurchase = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteTransactionOpen(true)
  }

  const confirmDeletePurchase = async () => {
    if (!selectedTransaction || !id) return

    try {
      setDeletingPurchase(true)
      await api.delete(`/suppliers/${id}/purchases/${selectedTransaction._id}`)
      setIsDeleteTransactionOpen(false)
      fetchSupplierProfile()
      toast.success("Purchase deleted successfully")
    } catch (error) {
      console.error("Error deleting purchase:", error)
      toast.error("Error deleting purchase")
    } finally {
      setDeletingPurchase(false)
    }
  }

  const handleAddPayment = async () => {
    console.log('Payment submission started', { id, paymentData });
    if (!id || !paymentData.amount) {
      console.error('Missing required fields for payment');
      toast.error("Please enter an amount");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(`/payments`, {
        supplierId: id,
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod === "Other"
          ? paymentData.otherPaymentMethod
          : paymentData.paymentMethod,
      });

      console.log('Payment API response:', response.data);

      if (response.data.success) {
        console.log('Payment successful, fetching updated profile');
        await fetchSupplierProfile();

        setIsPaymentOpen(false);
        setPaymentData({
          amount: "",
          paymentMethod: "Bank Transfer",
          otherPaymentMethod: ""
        });

        toast.success("Payment recorded successfully");
      } else {
        console.error('Payment failed:', response.data.message);
        toast.error(response.data.message || "Error recording payment");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearInvoiceFields = () => {
    setInvoiceFormData({
      date: new Date().toISOString().split('T')[0],
      invoiceNo: "",
      netAmount: "",
      vatAmount: "",
      description: "",
      paymentMethod: "",
      otherPaymentMethod: "",
    })
  }

  const handleAddInvoice = async () => {
    if (!id) return
    if (!invoiceFormData.netAmount) {
      toast.error("Net Value is required")
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        dateReceived: invoiceFormData.date,
        invoiceNo: invoiceFormData.invoiceNo,
        netAmount: parseFloat(invoiceFormData.netAmount),
        vatAmount: parseFloat(invoiceFormData.vatAmount) || 0,
        notes: invoiceFormData.description,
        paymentMethod: invoiceFormData.paymentMethod === "Other"
          ? invoiceFormData.otherPaymentMethod
          : invoiceFormData.paymentMethod
      }

      await api.post(`/suppliers/${id}/invoice`, payload)
      setIsAddInvoiceOpen(false)
      handleClearInvoiceFields()
      fetchSupplierProfile()
      toast.success("Invoice recorded successfully")
    } catch (error: any) {
      console.error("Error recording invoice:", error)
      toast.error(error.response?.data?.message || "Error recording invoice")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchSupplierProfile = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/suppliers/${id}/profile`)
        setSupplier(response.data.supplier)
        setTransactions(response.data.transactions)
        setTotalDues(response.data.totalDues)
      } catch (error) {
        console.error("Error fetching supplier profile:", error)
        toast.error("Error loading supplier profile")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSupplierProfile()
    }
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Loading supplier profile...</div>
        </div>
      </div>
    )
  }

  const openEditSupplierDialog = () => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone || "",
        address: {
          street: supplier.address || "",
          city: supplier.city || "",
          postalCode: supplier.zipCode || "",
        },
      })
      setIsModifyOpen(true)
    }
  }

  const fetchSupplierProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/suppliers/${id}/profile`)
      setSupplier(response.data.supplier)
      setTransactions(response.data.transactions)
      setTotalDues(response.data.totalDues)
    } catch (error) {
      console.error("Error fetching supplier profile:", error)
      toast.error("Error loading supplier profile")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSupplier = async () => {
    if (!id) return

    try {
      setSubmitting(true)
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address.street,
        city: formData.address.city,
        zipCode: formData.address.postalCode,
      }
      const response = await api.put(`/suppliers/${id}`, payload)

      if (response.data.success) {
        setIsModifyOpen(false)
        fetchSupplierProfile()
        toast.success("Supplier updated successfully")
      } else {
        toast.error(response.data.message || "Error updating supplier")
      }
    } catch (error: any) {
      console.error("Error updating supplier:", error)
      toast.error(error.response?.data?.message || "Error updating supplier")
    } finally {
      setSubmitting(false)
    }
  }

  const fetchPayments = async () => {
    if (!id) return
    try {
      const response = await api.get(`/payments?supplierId=${id}`)
      setPayments(response.data.payments || [])
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Error loading payments")
    }
  }



  const handlePrintStatement = async () => {
    try {
      setPrintingStatement(true)
      const response = await api.get(
        `/suppliers/${id}/statement?from=${dateRange.from}&to=${dateRange.to}&type=${statementType}`,
        {
          responseType: "blob",
        },
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = `statement-${supplier?.name}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setIsPrintStatementOpen(false)
    } catch (error) {
      console.error("Error printing statement:", error)
      toast.error("Error printing statement")
    } finally {
      setPrintingStatement(false)
    }
  }

  if (!supplier) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Supplier not found.</div>
        </div>
      </div>
    )
  }

  const filteredTransactions = transactions.filter(t => {
    // Filter by view mode first
    const isInvoice = !!t.paymentMethod
    if (viewMode === 'goods' && isInvoice) return false
    if (viewMode === 'invoices' && !isInvoice) return false

    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()

    // Check PO-ID
    if (t.purchaseOrderNo && t.purchaseOrderNo.toLowerCase().includes(searchLower)) return true

    // Check Invoice No
    if ((t as any).invoiceNo && (t as any).invoiceNo.toLowerCase().includes(searchLower)) return true

    // Check Product Names in items
    if (t.items?.some(item => item.productName.toLowerCase().includes(searchLower))) return true

    return false
  })

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-kf-text-dark mb-1">{supplier.name}</h1>
          <p className="text-kf-text-mid">{supplier.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={openEditSupplierDialog}>
            Modify
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrintStatementOpen(true)}
            className="text-kf-green hover:text-kf-green-dark"
          >
            Print Statement
          </Button>
          <div className="text-right">
            <p className="text-kf-text-mid text-sm">Total Dues</p>
            <p className="text-2xl font-bold text-kf-text-dark">
              {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(totalDues)}
            </p>
          </div>
        </div>
      </div>
      <Card className="p-6 bg-kf-white border-kf-border card-shadow">
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions by PO-ID or Product..."
              className="pl-9 bg-kf-background border-kf-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRecordGoodsOpen(true)}
            >
              Record Goods
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddInvoiceOpen(true)}
            >
              Add New Invoice
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsPaymentOpen(true)}
            >
              Add Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                fetchPayments()
                setIsPaymentListOpen(true)
              }}
            >
              View Payments
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'goods' ? 'default' : 'outline'}
            onClick={() => setViewMode('goods')}
            className={viewMode === 'goods' ? "bg-kf-purple text-white" : ""}
          >
            Record Goods
          </Button>
          <Button
            variant={viewMode === 'invoices' ? 'default' : 'outline'}
            onClick={() => setViewMode('invoices')}
            className={viewMode === 'invoices' ? "bg-kf-purple text-white" : ""}
          >
            Invoices
          </Button>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kf-border">
                {viewMode === 'goods' ? (
                  <>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">PO-ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Unit Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Total</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Invoice No</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Net Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">VAT Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment Method</th>
                  </>
                )}
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors"
                >
                  {viewMode === 'goods' ? (
                    <>
                      <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">{transaction.purchaseOrderNo}</td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        <div className="space-y-1">
                          {transaction.items?.map((item, idx) => (
                            <div key={idx}>{item.productName}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        <div className="space-y-1">
                          {transaction.items?.map((item, idx) => (
                            <div key={idx}>{item.qty}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        <div className="space-y-1">
                          {transaction.items?.map((item, idx) => (
                            <div key={idx}>
                              {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(item.unitPrice)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-mid">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(transaction.totalAmount || 0)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        {new Date((transaction as any).dateReceived || transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">{(transaction as any).invoiceNo || "-"}</td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark max-w-[200px] truncate">
                        {(transaction as any).notes || transaction.items?.[0]?.productName || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                          (transaction.items?.[0]?.unitPrice) || 0
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
                          (transaction as any).vatAmount || 0
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-mid font-semibold">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(transaction.totalAmount || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-dark">
                        {transaction.paymentMethod}
                      </td>
                    </>
                  )}

                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModifyTransactionDialog(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeletePurchase(transaction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-kf-text-mid">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md bg-sidebar border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-kf-background p-3 rounded-lg border border-kf-border">
              <p className="text-sm text-kf-text-mid">Supplier</p>
              <p className="font-semibold text-kf-text-dark">{supplier?.name}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Amount (£)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="bg-kf-background border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Payment Method</Label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full bg-kf-background border border-kf-border rounded-md px-3 py-2 text-kf-text-dark"
              >
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Cheque</option>
                <option>Other</option>
              </select>
            </div>
            {paymentData.paymentMethod === "Other" && (
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Other Payment Method</Label>
                <Input
                  type="text"
                  placeholder="Enter payment method"
                  value={paymentData.otherPaymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, otherPaymentMethod: e.target.value })}
                  className="bg-kf-background border-kf-border"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleAddPayment}
              disabled={submitting}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {submitting ? "Processing..." : "Add Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRecordGoodsOpen} onOpenChange={setIsRecordGoodsOpen}>
        <DialogContent className="max-w-4xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Record Goods Received</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-kf-background p-4 rounded-lg border border-kf-border">
              <p className="text-sm text-kf-text-mid">Supplier</p>
              <p className="text-lg font-semibold text-kf-text-dark">{supplier?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">VAT %</Label>
                <select
                  value={recordGoodsFormData.vatRate}
                  onChange={(e) => setRecordGoodsFormData({ ...recordGoodsFormData, vatRate: Number(e.target.value) })}
                  className="w-full bg-kf-background border border-kf-border rounded-md px-3 py-2 text-kf-text-dark"
                >
                  <option value={0}>0%</option>
                  <option value={20}>20%</option>
                  <option value={25}>25%</option>
                </select>
              </div>

            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-kf-text-mid font-semibold">Items</Label>
                <Button onClick={handleAddItem} variant="outline" size="sm">
                  Add Item
                </Button>
              </div>

              {recordGoodsFormData.items.map((item, index) => (
                <div key={index} className="border border-kf-border rounded-lg p-4 space-y-3">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-kf-text-mid">Product Name</Label>
                    <Input
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                      placeholder="Enter product name"
                      className="bg-kf-background border-kf-border text-kf-text-dark"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-kf-text-mid">Quantity</Label>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-kf-background border-kf-border text-kf-text-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-kf-text-mid">Unit Price (£)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-kf-background border-kf-border text-kf-text-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-kf-text-mid">Total (£)</Label>
                      <Input
                        type="number"
                        value={(item.qty * item.unitPrice).toFixed(2)}
                        disabled
                        className="bg-kf-background border-kf-border text-kf-text-dark"
                      />
                    </div>
                  </div>

                  {recordGoodsFormData.items.length > 1 && (
                    <Button onClick={() => handleRemoveItem(index)} variant="destructive" size="sm">
                      Remove Item
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Notes</Label>
              <Input
                value={recordGoodsFormData.notes}
                onChange={(e) => setRecordGoodsFormData({ ...recordGoodsFormData, notes: e.target.value })}
                placeholder="Additional notes (optional)"
                className="bg-kf-background border-kf-border text-kf-text-dark"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecordGoodsOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleRecordGoods}
              disabled={submitting}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {submitting ? "Recording..." : "Record Goods"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Add New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-kf-background p-3 rounded-lg border border-kf-border">
              <p className="text-sm text-kf-text-mid">Supplier</p>
              <p className="font-semibold text-kf-text-dark">{supplier?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Date</Label>
                <Input
                  type="date"
                  value={invoiceFormData.date}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, date: e.target.value })}
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Invoice Number</Label>
                <Input
                  value={invoiceFormData.invoiceNo}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceNo: e.target.value })}
                  placeholder="Invoice #"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Net Value (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceFormData.netAmount}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, netAmount: e.target.value })}
                  placeholder="0.00"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">VAT Value (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceFormData.vatAmount}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, vatAmount: e.target.value })}
                  placeholder="0.00"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Total Payment (Auto Count) (£)</Label>
              <Input
                type="number"
                value={((parseFloat(invoiceFormData.netAmount) || 0) + (parseFloat(invoiceFormData.vatAmount) || 0)).toFixed(2)}
                readOnly
                className="bg-kf-background border-kf-border text-kf-text-dark font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Description (Optional)</Label>
              <Input
                value={invoiceFormData.description}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })}
                placeholder="Description"
                className="bg-kf-background border-kf-border text-kf-text-dark"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Payment Method (Optional)</Label>
              <select
                value={invoiceFormData.paymentMethod}
                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, paymentMethod: e.target.value })}
                className="w-full bg-kf-background border border-kf-border rounded-md px-3 py-2 text-kf-text-dark"
              >
                <option value="">Select Method</option>
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {invoiceFormData.paymentMethod === "Other" && (
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Other Payment Method</Label>
                <Input
                  value={invoiceFormData.otherPaymentMethod}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, otherPaymentMethod: e.target.value })}
                  placeholder="Enter payment method"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={handleClearInvoiceFields} className="text-sm text-kf-text-mid hover:text-kf-text-dark">
                Clear fields
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddInvoiceOpen(false)} className="border-kf-border">
                Cancel
              </Button>
              <Button
                onClick={handleAddInvoice}
                disabled={submitting}
                className="bg-kf-green hover:bg-kf-green-dark text-white"
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModifyInvoiceOpen} onOpenChange={setIsModifyInvoiceOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Modify Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-kf-background p-3 rounded-lg border border-kf-border">
              <p className="text-sm text-kf-text-mid">Supplier</p>
              <p className="font-semibold text-kf-text-dark">{supplier?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Date</Label>
                <Input
                  type="date"
                  value={modifyInvoiceFormData.date}
                  onChange={(e) => setModifyInvoiceFormData({ ...modifyInvoiceFormData, date: e.target.value })}
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Invoice Number</Label>
                <Input
                  value={modifyInvoiceFormData.invoiceNo}
                  onChange={(e) => setModifyInvoiceFormData({ ...modifyInvoiceFormData, invoiceNo: e.target.value })}
                  placeholder="Invoice #"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Net Value (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={modifyInvoiceFormData.netAmount}
                  onChange={(e) => setModifyInvoiceFormData({ ...modifyInvoiceFormData, netAmount: e.target.value })}
                  placeholder="0.00"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">VAT Value (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={modifyInvoiceFormData.vatAmount}
                  onChange={(e) => setModifyInvoiceFormData({ ...modifyInvoiceFormData, vatAmount: e.target.value })}
                  placeholder="0.00"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Total Payment (Auto Count) (£)</Label>
              <Input
                type="number"
                value={((parseFloat(modifyInvoiceFormData.netAmount) || 0) + (parseFloat(modifyInvoiceFormData.vatAmount) || 0)).toFixed(2)}
                readOnly
                className="bg-kf-background border-kf-border text-kf-text-dark font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Description (Optional)</Label>
              <Input
                value={modifyInvoiceFormData.description}
                onChange={(e) => setModifyInvoiceFormData({ ...modifyInvoiceFormData, description: e.target.value })}
                placeholder="Description"
                className="bg-kf-background border-kf-border text-kf-text-dark"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Payment Method (Optional)</Label>
              <select
                value={modifyInvoiceFormData.paymentMethod}
                onChange={(e) => setModifyInvoiceFormData({ ...modifyInvoiceFormData, paymentMethod: e.target.value })}
                className="w-full bg-kf-background border border-kf-border rounded-md px-3 py-2 text-kf-text-dark"
              >
                <option value="">Select Method</option>
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {modifyInvoiceFormData.paymentMethod === "Other" && (
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Other Payment Method</Label>
                <Input
                  value={modifyInvoiceFormData.otherPaymentMethod}
                  onChange={(e) => setModifyInvoiceFormData({ ...modifyInvoiceFormData, otherPaymentMethod: e.target.value })}
                  placeholder="Enter payment method"
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModifyInvoiceOpen(false)} className="border-kf-border">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateInvoice}
                disabled={submitting}
                className="bg-kf-green hover:bg-kf-green-dark text-white"
              >
                {submitting ? "Updating..." : "Update Invoice"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModifyOpen} onOpenChange={setIsModifyOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Modify Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                  placeholder="Supplier name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                  placeholder="supplier@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-kf-background border-kf-border text-kf-text-dark"
                placeholder="Phone number"
              />
            </div>

            <div className="border-t border-kf-border pt-4">
              <Label className="text-kf-text-mid font-semibold">Address (Optional)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
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
                    className="bg-kf-background border-kf-border text-kf-text-dark"
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
                    className="bg-kf-background border-kf-border text-kf-text-dark"
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
                    className="bg-kf-background border-kf-border text-kf-text-dark"
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
              onClick={handleUpdateSupplier}
              disabled={submitting}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {submitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Purchase Modal */}
      <Dialog open={isModifyTransactionOpen} onOpenChange={setIsModifyTransactionOpen}>
        <DialogContent className="max-w-4xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Modify Purchase Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Date Received</Label>
                <Input
                  type="date"
                  value={modifyFormData.dateReceived}
                  onChange={(e) => setModifyFormData({ ...modifyFormData, dateReceived: e.target.value })}
                  className="bg-kf-background border-kf-border text-kf-text-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Items</Label>
              <div className="border border-kf-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-kf-background">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-medium text-kf-text-mid">Product</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-kf-text-mid w-24">Qty</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-kf-text-mid w-32">Unit Price</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-kf-text-mid w-32">Total</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {modifyFormData.items.map((item, index) => (
                      <tr key={index} className="border-t border-kf-border">
                        <td className="p-2">
                          <Input
                            value={item.productName}
                            onChange={(e) => handleModifyItemChange(index, "productName", e.target.value)}
                            className="h-8 bg-kf-background border-kf-border"
                            placeholder="Product Name"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleModifyItemChange(index, "qty", Number(e.target.value))}
                            className="h-8 bg-kf-background border-kf-border"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleModifyItemChange(index, "unitPrice", Number(e.target.value))}
                            className="h-8 bg-kf-background border-kf-border"
                          />
                        </td>
                        <td className="p-2 text-sm text-kf-text-light">
                          {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(item.qty * item.unitPrice)}
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveModifyItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddModifyItem}
                className="mt-2 border-kf-border text-kf-text-mid hover:text-kf-text-light"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModifyTransactionOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePurchase}
              disabled={submitting}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {submitting ? "Updating..." : "Update Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Purchase Confirmation Modal */}
      <Dialog open={isDeleteTransactionOpen} onOpenChange={setIsDeleteTransactionOpen}>
        <DialogContent className="bg-sidebar border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Delete Purchase Record</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-kf-text-mid">
            Are you sure you want to delete purchase <strong>{selectedTransaction?.purchaseOrderNo}</strong>?
            <br />
            This action cannot be undone and will restore the stock quantities.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTransactionOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={confirmDeletePurchase}
              disabled={deletingPurchase}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deletingPurchase ? "Deleting..." : "Delete"}
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
                <option value="invoices">Purchase List</option>
                <option value="payments">Payment List</option>
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

      {/* Payment List Dialog */}
      <Dialog open={isPaymentListOpen} onOpenChange={setIsPaymentListOpen}>
        <DialogContent className="max-w-4xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Payment History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {payments.length > 0 ? (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kf-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment Method</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors">
                        <td className="py-3 px-4 text-sm text-kf-text-dark">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">
                          {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(payment.amount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-kf-text-mid">
                          {payment.paymentMethod || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-kf-text-mid hover:text-kf-green"
                            onClick={() => {
                              window.location.href = `/creditor-debitor?editPayment=${payment._id}`
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-kf-text-mid">
                No payments found for this supplier.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentListOpen(false)} className="border-kf-border">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}