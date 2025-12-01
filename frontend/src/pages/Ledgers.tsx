"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import api from "../utils/api"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface LedgerEntry {
  _id: string
  date: string
  description: string
  entity: string
  type: "Client" | "Supplier"
  transactionType: "Debit" | "Credit"
  amount: number
  reference?: string
}

export default function Ledgers() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [loading, setLoading] = useState(true)
  const [isPrintStatementOpen, setIsPrintStatementOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [activeTab, setActiveTab] = useState<"client" | "supplier">("client")
  const [printType, setPrintType] = useState<"all" | "client" | "supplier">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const handlePrintStatement = async () => {
    try {
      const response = await api.get(`/ledger/statement?from=${dateRange.from}&to=${dateRange.to}&type=${printType}`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement("a")
      a.href = url
      a.download = `ledger-statement-${printType}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setIsPrintStatementOpen(false)
      toast.success("Statement downloaded successfully")
    } catch (error) {
      console.error("Error printing statement:", error)
      toast.error("Error printing statement")
    }
  }

  useEffect(() => {
    const fetchLedgerEntries = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/ledger?type=${activeTab}`)
        setEntries(response.data.ledgerEntries)
      } catch (error) {
        console.error("Error fetching ledger entries:", error)
        toast.error("Error loading ledger entries")
      } finally {
        setLoading(false)
      }
    }

    fetchLedgerEntries()
  }, [activeTab])

  const sortedEntries = entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === "latest" ? dateB - dateA : dateA - dateB
  })

  // Filter entries based on search term
  const filteredEntries = sortedEntries.filter((entry) =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Loading ledger entries...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-metallic mb-1">Ledger</h1>
          <p className="text-kf-text-mid">Consolidated view of all transactions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="border-kf-border"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === "latest" ? "Latest First" : "Oldest First"}
          </Button>
          <Button
            onClick={() => setIsPrintStatementOpen(true)}
          >
            Print Statement
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-kf-border">
        <button
          className={`pb-2 px-4 ${activeTab === "client" ? "border-b-2 border-kf-green font-bold text-kf-green" : "text-kf-text-mid"}`}
          onClick={() => setActiveTab("client")}
        >
          Client Ledger
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === "supplier" ? "border-b-2 border-kf-green font-bold text-kf-green" : "text-kf-text-mid"}`}
          onClick={() => setActiveTab("supplier")}
        >
          Supplier Ledger
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <Input
          placeholder="Search ledger entries..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="bg-kf-background border-kf-border"
        />
      </div>

      <Card className="p-6 bg-card border-kf-border card-shadow">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kf-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Entity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Reference</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-kf-text-mid">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry._id} className="border-b border-kf-border hover:bg-muted transition-colors">
                  <td className="py-3 px-4 text-sm text-kf-text-light">
                    {new Date(entry.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3 px-4 text-sm text-kf-text-light">{entry.description}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">{entry.entity}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">{entry.reference || "-"}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.transactionType === "Credit"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                      {entry.transactionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-kf-text-light text-right font-medium">
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(entry.amount)}
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-kf-text-mid">
                    No ledger entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isPrintStatementOpen} onOpenChange={setIsPrintStatementOpen}>
        <DialogContent className="max-w-md bg-kf-white border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Print Statement</DialogTitle>
            <DialogDescription className="text-kf-text-mid">
              Select the date range and type of statement you want to generate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Type</Label>
              <select
                value={printType}
                onChange={(e) => setPrintType(e.target.value as any)}
                className="w-full p-2 bg-kf-background border border-kf-border rounded-md"
              >
                <option value="all">Both (Client & Supplier)</option>
                <option value="client">Customers Only</option>
                <option value="supplier">Suppliers Only</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">From</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, from: e.target.value })}
                className="bg-kf-background border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">To</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, to: e.target.value })}
                className="bg-kf-background border-kf-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintStatementOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button onClick={handlePrintStatement} className="bg-kf-green hover:bg-kf-green-dark text-white">
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
