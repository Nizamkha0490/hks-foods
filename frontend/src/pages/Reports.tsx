"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import api from "../utils/api"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import StatCard from "@/components/StatCard"

export default function Reports() {
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])
  const [reportTitle, setReportTitle] = useState("")
  const [reportHeaders, setReportHeaders] = useState<string[]>([])
  const [salesOverviewData, setSalesOverviewData] = useState<any[]>([])
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalSalesThisMonth: 0,
    totalSalesThisWeek: 0,
    totalSalesToday: 0,
  })
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [reportSearchTerm, setReportSearchTerm] = useState("")
  const [reportDateFilter, setReportDateFilter] = useState({ from: "", to: "" })
  const [isExporting, setIsExporting] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [currentReportType, setCurrentReportType] = useState<string | null>(null)
  const [loadingReportType, setLoadingReportType] = useState<string | null>(null)
  const lastFetchedDates = useRef({ from: "", to: "" })

  useEffect(() => {
    fetchSalesStats()
    fetchTopProducts()
    fetchSalesOverview()
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings")
      setSettings(response.data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const fetchSalesOverview = async () => {
    try {
      const response = await api.get("/reports/sales-overview")
      setSalesOverviewData(response.data.report || [])
    } catch (error) {
      console.error("Error fetching sales overview:", error)
      toast.error("Failed to load sales overview")
      setSalesOverviewData([])
    }
  }

  const fetchTopProducts = async () => {
    try {
      const response = await api.get("/reports/top-products")
      setTopProducts(response.data.report || [])
    } catch (error) {
      console.error("Error fetching top products:", error)
      toast.error("Failed to load top products")
      setTopProducts([])
    }
  }

  const fetchSalesStats = async () => {
    try {
      const response = await api.get("/reports/sales-stats")
      setSalesStats(
        response.data || {
          totalSales: 0,
          totalSalesThisMonth: 0,
          totalSalesThisWeek: 0,
          totalSalesToday: 0,
        },
      )
    } catch (error) {
      console.error("Error fetching sales stats:", error)
      toast.error("Failed to load sales stats")
    }
  }

  const fetchReport = useCallback(async (reportType: string) => {
    try {
      setLoadingReportType(reportType)
      // Build query parameters
      const params = new URLSearchParams()
      // Only apply date filters for reports that support them
      if (reportType !== "stock" && reportType !== "product") {
        if (reportDateFilter.from) {
          params.append('startDate', reportDateFilter.from)
        }
        if (reportDateFilter.to) {
          params.append('endDate', reportDateFilter.to)
        }
      }

      const url = `/reports/${reportType}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await api.get(url)
      setReportData(response.data.report || [])
      setReportTitle(reportType.replace("-", " "))
      if (response.data.report && response.data.report.length > 0) {
        setReportHeaders(Object.keys(response.data.report[0]))
      }
      setReportSearchTerm("") // Reset search
      setCurrentReportType(reportType) // Store current report type

      // Update last fetched dates to prevent double fetch in useEffect
      lastFetchedDates.current = { ...reportDateFilter }

      setIsReportOpen(true)
    } catch (error: any) {
      console.error(`Error fetching ${reportType} report:`, error)
      toast.error(error.response?.data?.message || `Error loading ${reportType} report`)
    } finally {
      setLoadingReportType(null)
    }
  }, [reportDateFilter.from, reportDateFilter.to])

  // Auto-refetch when date filter changes (but not on initial mount or if dates haven't changed)
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Check if dates actually changed from last fetch
    if (
      reportDateFilter.from === lastFetchedDates.current.from &&
      reportDateFilter.to === lastFetchedDates.current.to
    ) {
      return
    }

    if (currentReportType && isReportOpen) {
      fetchReport(currentReportType)
    }
  }, [reportDateFilter.from, reportDateFilter.to, currentReportType, isReportOpen, fetchReport])

  // Filter report data based on search only (date filtering is done on backend)
  const filteredReportData = reportData.filter((row) => {
    // Search filter
    const matchesSearch = reportSearchTerm === "" ||
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(reportSearchTerm.toLowerCase())
      )

    return matchesSearch
  })

  // Calculate column totals for numeric columns
  const calculateColumnTotals = () => {
    const totals: any = {}
    const numericColumns = ["Selling Price", "VAT Value", "Total", "Profit/Loss", "Cost Price", "SellingWVAT"]

    reportHeaders.forEach(header => {
      if (numericColumns.includes(header)) {
        const sum = filteredReportData.reduce((acc, row) => {
          const value = parseFloat(row[header]) || 0
          return acc + value
        }, 0)
        totals[header] = sum.toFixed(2)
      } else {
        totals[header] = header === reportHeaders[0] ? "TOTAL" : ""
      }
    })

    return totals
  }

  const columnTotals = filteredReportData.length > 0 ? calculateColumnTotals() : {}

  const exportToPDF = async () => {
    if (filteredReportData.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      setIsExporting(true)
      const doc = new jsPDF()

      // Company Header
      doc.setFillColor(30, 58, 138)
      doc.setTextColor(30, 58, 138)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(settings?.warehouseName || "HKS FOODS LTD", 105, 20, { align: "center" })

      // Company Details
      doc.setTextColor(102, 102, 102)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(settings?.address || "104 ANTHONY ROAD", 105, 28, { align: "center" })
      doc.text(settings?.postalCode || "BIRMINGHAM B83AA", 105, 33, { align: "center" })
      doc.text(
        `${settings?.contactNumber || "Tel:+44 7477 956299"} | VAT: ${settings?.vatNumber || "495814839"} | Company No: ${settings?.companyNumber || "16372393"}`,
        105,
        38,
        { align: "center" }
      )

      // Report Title
      doc.setDrawColor(30, 58, 138)
      doc.setLineWidth(0.5)
      doc.line(15, 43, 195, 43)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(`${reportTitle.toUpperCase()} REPORT`, 105, 52, { align: "center" })

      // Date Generated
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB")}`, 105, 60, { align: "center" })

      // Prepare table data with totals row
      const tableData = filteredReportData.map((row) => reportHeaders.map((header) => {
        const value = row[header]
        if (typeof value === 'number') {
          return value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        return value || ''
      }))

      const totalsRow = reportHeaders.map((header) => {
        const total = columnTotals[header]
        if (typeof total === 'number') {
          return total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        return total || ''
      })
      tableData.push(totalsRow)

      // Table
      autoTable(doc, {
        head: [reportHeaders],
        body: tableData,
        startY: 68,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        didParseCell: function (data: any) {
          // Make totals row bold and highlighted
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = [240, 240, 240]
            data.cell.styles.textColor = [30, 58, 138]
          }
        },
        margin: { left: 15, right: 15 }
      })

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(
          `Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        )
      }

      doc.save(`${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success("PDF exported successfully")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Error exporting PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToXLS = async () => {
    if (filteredReportData.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      setIsExporting(true)
      // Add totals row to data
      const dataWithTotals = [...filteredReportData, columnTotals]

      const ws = XLSX.utils.json_to_sheet(dataWithTotals)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, reportTitle)
      XLSX.writeFile(wb, `${reportTitle}.xlsx`)
      toast.success("Excel exported successfully")
    } catch (error) {
      console.error("Error exporting Excel:", error)
      toast.error("Error exporting Excel")
    } finally {
      setIsExporting(false)
    }
  }

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "-"
    }
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.join(", ")
      }
      // For objects like address, bankDetails, etc.
      return Object.values(value)
        .filter((v) => v)
        .join(" - ")
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No"
    }
    if (typeof value === "number") {
      // Check if it looks like a date or ID
      if (value > 1000000000000) {
        return new Date(value).toLocaleDateString()
      }
      return value.toString()
    }
    return String(value)
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-metallic mb-1">Reports</h1>
        <p className="text-kf-text-mid">Generate and view various reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(salesStats.totalSales)}
        />
        <StatCard
          title="Total Sales This Month"
          value={new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
            salesStats.totalSalesThisMonth,
          )}
        />
        <StatCard
          title="Total Sales This Week"
          value={new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
            salesStats.totalSalesThisWeek,
          )}
        />
        <StatCard
          title="Total Sales Today"
          value={new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
            salesStats.totalSalesToday,
          )}
        />
      </div>

      <Card className="p-6 bg-card border-kf-border card-shadow">
        <h2 className="text-xl font-bold text-kf-text-light mb-4">Sales Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesOverviewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
            <Bar dataKey="revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-kf-border card-shadow">
          <h2 className="text-xl font-bold text-kf-text-light mb-4">Sales Reports</h2>
          <div className="space-y-2">
            <Button
              onClick={() => fetchReport("daily")}
              className="w-full"
              disabled={loadingReportType === "daily"}
            >
              {loadingReportType === "daily" ? "Opening..." : "Daily Report"}
            </Button>
            <Button
              onClick={() => fetchReport("monthly")}
              className="w-full"
              disabled={loadingReportType === "monthly"}
            >
              {loadingReportType === "monthly" ? "Opening..." : "Monthly Report"}
            </Button>
            <Button
              onClick={() => fetchReport("yearly")}
              className="w-full"
              disabled={loadingReportType === "yearly"}
            >
              {loadingReportType === "yearly" ? "Opening..." : "Yearly Report"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card border-kf-border card-shadow">
          <h2 className="text-xl font-bold text-kf-text-light mb-4">Product Reports</h2>
          <div className="space-y-2">
            <Button
              onClick={() => fetchReport("stock")}
              className="w-full"
              disabled={loadingReportType === "stock"}
            >
              {loadingReportType === "stock" ? "Opening..." : "Stock Report"}
            </Button>
            <Button
              onClick={() => fetchReport("product")}
              className="w-full"
              disabled={loadingReportType === "product"}
            >
              {loadingReportType === "product" ? "Opening..." : "Product Report"}
            </Button>
            <Button
              onClick={() => fetchReport("product-sale")}
              className="w-full"
              disabled={loadingReportType === "product-sale"}
            >
              {loadingReportType === "product-sale" ? "Opening..." : "Product Sale Report"}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card border-kf-border card-shadow">
        <h2 className="text-xl font-bold text-kf-text-light mb-4">Top 10 Selling Products</h2>
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kf-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Quantity Sold</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={`top-product-${index}`} className="border-b border-kf-border hover:bg-muted transition-colors">
                  <td className="py-3 px-4 text-sm text-kf-text-light">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-light">{product.quantity}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-light">
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(product.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-7xl bg-sidebar border-kf-border">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light capitalize">{reportTitle} Report</DialogTitle>
            <DialogDescription className="text-kf-text-mid">
              View and export detailed {reportTitle} data
            </DialogDescription>
          </DialogHeader>

          {/* Search and Date Filters - Not included in export */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <input
                type="text"
                placeholder="Search in report..."
                value={reportSearchTerm}
                onChange={(e) => setReportSearchTerm(e.target.value)}
                className="w-full p-2 border border-kf-border rounded-md bg-kf-background"
              />
            </div>
            {currentReportType !== "stock" && currentReportType !== "product" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <input
                    type="date"
                    value={reportDateFilter.from}
                    onChange={(e) => setReportDateFilter({ ...reportDateFilter, from: e.target.value })}
                    className="w-full p-2 border border-kf-border rounded-md bg-kf-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <input
                    type="date"
                    value={reportDateFilter.to}
                    onChange={(e) => setReportDateFilter({ ...reportDateFilter, to: e.target.value })}
                    className="w-full p-2 border border-kf-border rounded-md bg-kf-background"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={exportToPDF}
              className="bg-kf-blue hover:bg-kf-blue-dark text-white"
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
            <Button
              onClick={exportToXLS}
              className="bg-kf-yellow hover:bg-kf-yellow-dark text-black"
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export to XLS"}
            </Button>
          </div>
          <div className="overflow-auto max-h-[60vh] border border-kf-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-kf-background border-b border-kf-border">
                  {reportHeaders.map((header) => (
                    <th key={header} className="text-left py-3 px-4 font-semibold text-kf-red whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReportData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-kf-border ${index % 2 === 0 ? "bg-white" : "bg-kf-background"} hover:bg-kf-sidebar-hover transition-colors`}
                  >
                    {reportHeaders.map((header) => (
                      <td key={header} className="py-3 px-4 text-kf-text-dark">
                        {formatCellValue(row[header])}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Totals Row */}
                {filteredReportData.length > 0 && (
                  <tr className="bg-gray-100 border-t-2 border-kf-border font-bold">
                    {reportHeaders.map((header) => (
                      <td key={header} className="py-3 px-4 text-kf-text-dark">
                        {formatCellValue(columnTotals[header])}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
