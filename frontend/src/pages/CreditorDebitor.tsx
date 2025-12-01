import { useState, useEffect } from "react"
import { Search, Trash2, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import api from "../utils/api"

interface Supplier {
  _id: string
  name: string
  email?: string
  totalDebit?: number
  totalCredit?: number
  balance?: number
}

interface Client {
  _id: string
  name: string
  email?: string
  totalDues?: number
}

interface Payment {
  _id: string
  clientId?: { _id: string; name: string }
  supplierId?: { _id: string; name: string }
  amount: number
  paymentMethod: string
  createdAt: string
  paymentNo?: string
}

export default function CreditorDebitor() {
  const [activeTab, setActiveTab] = useState<"creditor" | "debtor">("creditor")
  const [payments, setPayments] = useState<Payment[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })

  // Add Entry State
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [selectedClient, setSelectedClient] = useState("")
  const [entryAmount, setEntryAmount] = useState("")
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Bank")
  const [customPaymentMethod, setCustomPaymentMethod] = useState("")

  // Modify Entry State
  const [isModifyEntryOpen, setIsModifyEntryOpen] = useState(false)
  const [paymentToModify, setPaymentToModify] = useState<Payment | null>(null)
  const [modifyAmount, setModifyAmount] = useState("")
  const [modifyPaymentMethod, setModifyPaymentMethod] = useState("Bank")
  const [modifyCustomPaymentMethod, setModifyCustomPaymentMethod] = useState("")

  // Delete Entry State
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [suppliersWithBalance, setSuppliersWithBalance] = useState<Supplier[]>([])
  const [isPaymentListOpen, setIsPaymentListOpen] = useState(false)
  const [selectedSupplierForPayments, setSelectedSupplierForPayments] = useState<Supplier | null>(null)
  const [supplierPayments, setSupplierPayments] = useState<Payment[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [paymentsRes, suppliersRes, balancesRes, clientsRes] = await Promise.all([
        api.get("/payments"),
        api.get("/suppliers"),
        api.get("/suppliers/with-balances"),
        api.get("/clients")
      ])

      setPayments(paymentsRes.data.payments || [])
      setSuppliers(suppliersRes.data.suppliers || [])
      setSuppliersWithBalance(balancesRes.data.suppliers || [])
      setClients(clientsRes.data.clients || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const fetchSupplierPayments = async (supplierId: string) => {
    try {
      const response = await api.get(`/payments?supplierId=${supplierId}`)
      setSupplierPayments(response.data.payments || [])
    } catch (error) {
      console.error("Error fetching supplier payments:", error)
      toast.error("Error loading payments")
    }
  }

  const handleAddEntry = async () => {
    if (activeTab === "creditor" && !selectedSupplier) {
      toast.error("Please select a supplier")
      return
    }

    if (activeTab === "debtor" && !selectedClient) {
      toast.error("Please select a client")
      return
    }

    if (!entryAmount) {
      toast.error("Please enter an amount")
      return
    }

    if (paymentMethod === "Other" && !customPaymentMethod) {
      toast.error("Please enter a custom payment method")
      return
    }

    try {
      setSubmitting(true)
      const payload: any = {
        amount: Number(entryAmount),
        paymentMethod: paymentMethod === "Other" ? customPaymentMethod : paymentMethod,
      }

      if (activeTab === "creditor") {
        payload.supplierId = selectedSupplier
      } else {
        payload.clientId = selectedClient
      }

      await api.post("/payments", payload)

      toast.success("Entry added successfully")
      setIsAddEntryOpen(false)
      resetAddForm()
      fetchData()
    } catch (error) {
      console.error("Error adding entry:", error)
      toast.error("Error adding entry")
    } finally {
      setSubmitting(false)
    }
  }

  const handleModifyEntry = async () => {
    if (!paymentToModify || !modifyAmount) return

    if (modifyPaymentMethod === "Other" && !modifyCustomPaymentMethod) {
      toast.error("Please enter a custom payment method")
      return
    }

    try {
      setSubmitting(true)
      await api.put(`/payments/${paymentToModify._id}`, {
        amount: Number(modifyAmount),
        paymentMethod: modifyPaymentMethod === "Other" ? modifyCustomPaymentMethod : modifyPaymentMethod,
      })

      toast.success("Entry updated successfully")
      setIsModifyEntryOpen(false)
      setPaymentToModify(null)
      fetchData()
    } catch (error) {
      console.error("Error updating entry:", error)
      toast.error("Error updating entry")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEntry = async () => {
    if (!paymentToDelete) return

    try {
      setSubmitting(true)
      await api.delete(`/payments/${paymentToDelete._id}`)
      toast.success("Entry deleted successfully")
      setPaymentToDelete(null)
      fetchData()
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast.error("Error deleting entry")
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportStatement = async () => {
    try {
      const response = await api.get(`/payments/export?type=${activeTab}&from=${dateRange.from}&to=${dateRange.to}`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `payment-statement-${activeTab}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Error exporting statement:", error)
      toast.error("Error exporting statement")
    }
  }

  const openModifyDialog = (payment: Payment) => {
    setPaymentToModify(payment)
    setModifyAmount(payment.amount.toString())

    const isStandardMethod = ["Bank", "Credit", "Cash"].includes(payment.paymentMethod)
    if (isStandardMethod) {
      setModifyPaymentMethod(payment.paymentMethod)
      setModifyCustomPaymentMethod("")
    } else {
      setModifyPaymentMethod("Other")
      setModifyCustomPaymentMethod(payment.paymentMethod)
    }

    setIsModifyEntryOpen(true)
  }

  const resetAddForm = () => {
    setSelectedSupplier("")
    setSelectedClient("")
    setEntryAmount("")
    setPaymentMethod("Bank")
    setCustomPaymentMethod("")
    setSupplierSearchTerm("")
    setClientSearchTerm("")
  }

  const filteredPayments = payments.filter(p => {
    // Filter by tab (Creditor = Supplier payments, Debtor = Client payments)
    const isCreditor = activeTab === "creditor" ? !!p.supplierId : !!p.clientId
    if (activeTab === "creditor" && !isCreditor) return false
    if (activeTab === "debtor" && isCreditor) return false

    // Filter by search term
    const name = activeTab === "creditor" ? p.supplierId?.name : p.clientId?.name
    const searchMatch = !searchTerm ||
      (name && name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.paymentMethod && p.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()))

    return searchMatch
  })

  const filteredSuppliers = suppliersWithBalance.filter(s => {
    if (!searchTerm) return true
    return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const filteredClients = clients.filter(c => {
    if (!searchTerm) return true
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const totalBalance = activeTab === "creditor"
    ? filteredSuppliers.reduce((sum, s) => sum + (s.balance || 0), 0)
    : filteredClients.reduce((sum, c) => sum + (c.totalDues || 0), 0)

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-metallic mb-1">Creditor/Debtor</h1>
          <p className="text-kf-text-mid">Manage payments and transactions</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="bg-kf-background border-kf-border w-36"
            />
            <span className="text-kf-text-mid">-</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="bg-kf-background border-kf-border w-36"
            />
            <Button
              onClick={handleExportStatement}
              variant="outline"
              className="border-kf-border hover:bg-muted"
            >
              Export PDF
            </Button>
          </div>
          <Button onClick={() => setIsAddEntryOpen(true)} variant="outline" className="border-kf-border">
            Add Entry
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-kf-border">
        <button
          className={`pb-2 px-4 ${activeTab === "creditor" ? "border-b-2 border-kf-green font-bold text-kf-green" : "text-kf-text-mid"}`}
          onClick={() => setActiveTab("creditor")}
        >
          Creditor (Suppliers)
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === "debtor" ? "border-b-2 border-kf-green font-bold text-kf-green" : "text-kf-text-mid"}`}
          onClick={() => setActiveTab("debtor")}
        >
          Debtor (Clients)
        </button>
      </div>

      {/* Total Balance Display */}
      <Card className="p-4 bg-card border-kf-border">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total Payments ({activeTab === "creditor" ? "Out" : "In"}):</span>
          <span className="text-2xl font-bold text-kf-green">
            {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(totalBalance)}
          </span>
        </div>
      </Card>

      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or payment method..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-9 bg-kf-background border-kf-border"
        />
      </div>

      {/* Table */}
      <Card className="p-6 bg-card border-kf-border card-shadow">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kf-border">
                {activeTab === "creditor" ? (
                  <>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Supplier Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Email</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-kf-text-mid">Balance</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Client Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Email</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-kf-text-mid">Total Dues</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === "creditor" ? (
                <>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="border-b border-kf-border hover:bg-muted transition-colors">
                      <td
                        className="py-3 px-4 text-sm text-kf-text-light font-medium cursor-pointer hover:text-kf-green"
                        onClick={() => window.location.href = `/suppliers/${supplier._id}`}
                      >
                        {supplier.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-mid">
                        {supplier.email || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-light text-right font-medium">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(supplier.balance || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-kf-text-mid hover:text-kf-green"
                            onClick={() => {
                              setSelectedSupplierForPayments(supplier)
                              fetchSupplierPayments(supplier._id)
                              setIsPaymentListOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-kf-text-mid">
                        No suppliers with outstanding balance found.
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <>
                  {filteredClients.map((client) => (
                    <tr key={client._id} className="border-b border-kf-border hover:bg-muted transition-colors">
                      <td
                        className="py-3 px-4 text-sm text-kf-text-light font-medium cursor-pointer hover:text-kf-green"
                        onClick={() => window.location.href = `/customers/${client._id}`}
                      >
                        {client.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-mid">
                        {client.email || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-kf-text-light text-right font-medium">
                        {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(client.totalDues || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-kf-text-mid hover:text-kf-green"
                            onClick={() => window.location.href = `/customers/${client._id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-kf-text-mid">
                        No clients with outstanding dues found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Entry Modal */}
      <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md bg-sidebar border-kf-border" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Add Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">
                {activeTab === "creditor" ? "Select Supplier *" : "Select Client *"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                {activeTab === "creditor" ? (
                  <>
                    <Input
                      list="suppliers-list"
                      placeholder="Search or select supplier..."
                      value={supplierSearchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSupplierSearchTerm(e.target.value)
                        const matchedSupplier = suppliers.find(s => s.name === e.target.value)
                        if (matchedSupplier) {
                          setSelectedSupplier(matchedSupplier._id)
                        } else {
                          setSelectedSupplier("")
                        }
                      }}
                      className="pl-9 bg-kf-background border-kf-border"
                    />
                    <datalist id="suppliers-list">
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier.name} />
                      ))}
                    </datalist>
                  </>
                ) : (
                  <>
                    <Input
                      list="clients-list"
                      placeholder="Search or select client..."
                      value={clientSearchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setClientSearchTerm(e.target.value)
                        const matchedClient = clients.find(c => c.name === e.target.value)
                        if (matchedClient) {
                          setSelectedClient(matchedClient._id)
                        } else {
                          setSelectedClient("")
                        }
                      }}
                      className="pl-9 bg-kf-background border-kf-border"
                    />
                    <datalist id="clients-list">
                      {clients.map((client) => (
                        <option key={client._id} value={client.name} />
                      ))}
                    </datalist>
                  </>
                )}
              </div>
            </div>
            {(selectedSupplier || selectedClient) && (
              <>
                <div className="space-y-2">
                  <Label className="text-kf-text-mid">Payment Made *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entryAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntryAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-kf-background border-kf-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-kf-text-mid">Payment Method *</Label>
                  <select
                    value={paymentMethod}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-kf-background border border-kf-border rounded-md text-sm"
                  >
                    <option value="Bank">Bank</option>
                    <option value="Credit">Credit</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                  {paymentMethod === "Other" && (
                    <Input
                      placeholder="Enter payment method"
                      value={customPaymentMethod}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomPaymentMethod(e.target.value)}
                      className="bg-kf-background border-kf-border mt-2"
                    />
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEntryOpen(false)}
              className="border-kf-border"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEntry}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
              disabled={submitting || (!selectedSupplier && !selectedClient) || !entryAmount}
            >
              {submitting ? "Adding..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Entry Modal */}
      <Dialog open={isModifyEntryOpen} onOpenChange={setIsModifyEntryOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md bg-sidebar border-kf-border" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Modify Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Name</Label>
              <Input
                value={activeTab === "creditor" ? paymentToModify?.supplierId?.name : paymentToModify?.clientId?.name}
                disabled
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={modifyAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModifyAmount(e.target.value)}
                placeholder="0.00"
                className="bg-kf-background border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Payment Method *</Label>
              <select
                value={modifyPaymentMethod}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModifyPaymentMethod(e.target.value)}
                className="w-full p-2 bg-kf-background border border-kf-border rounded-md text-sm"
              >
                <option value="Bank">Bank</option>
                <option value="Credit">Credit</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
              {modifyPaymentMethod === "Other" && (
                <Input
                  placeholder="Enter payment method"
                  value={modifyCustomPaymentMethod}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModifyCustomPaymentMethod(e.target.value)}
                  className="bg-kf-background border-kf-border mt-2"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModifyEntryOpen(false)}
              className="border-kf-border"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModifyEntry}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
              disabled={submitting || !modifyAmount}
            >
              {submitting ? "Updating..." : "Update Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-md bg-sidebar border-kf-border" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-kf-text-mid">
              Are you sure you want to delete this payment of{" "}
              {paymentToDelete && new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(paymentToDelete.amount)}?
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentToDelete(null)}
              className="border-kf-border"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteEntry}
              className="bg-kf-red hover:bg-kf-red-dark text-white"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment List Dialog */}
      <Dialog open={isPaymentListOpen} onOpenChange={setIsPaymentListOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">
              Payment History - {selectedSupplierForPayments?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {supplierPayments.length > 0 ? (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kf-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment Method</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment No</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPayments.map((payment) => (
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
                        <td className="py-3 px-4 text-sm text-kf-text-mid">
                          {payment.paymentNo || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-kf-text-mid hover:text-kf-green"
                            onClick={() => {
                              setIsPaymentListOpen(false)
                              openModifyDialog(payment)
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
    </div>
  )
}
