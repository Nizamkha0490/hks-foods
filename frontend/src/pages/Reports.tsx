"use client"

import { useState, useEffect } from "react"
import {
    TrendingUp,
    FileText,
    Calendar,
    Package,
    ShoppingCart,
    BarChart3,
    PoundSterling,
    Download,
    Loader2,
    Search,
    Menu,
    X,
    ArrowDown
} from "lucide-react"
import api from "../utils/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { toast } from "sonner"
import StatCard from "@/components/StatCard"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type ReportSection = "kpis" | "daily" | "monthly" | "yearly" | "stock" | "product" | "product-sale" | "top-products" | "profit"

interface SalesStats {
    totalSales: number
    totalSalesThisMonth: number
    totalSalesThisWeek: number
    totalSalesToday: number
}

interface ProfitStats {
    totalProfit: number
    totalProfitThisMonth: number
    totalProfitThisWeek: number
    totalProfitToday: number
}

export default function Reports() {
    const [activeSection, setActiveSection] = useState<ReportSection>("kpis")
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showScrollButton, setShowScrollButton] = useState(false)

    // KPIs state
    const [salesStats, setSalesStats] = useState<SalesStats | null>(null)
    const [profitStats, setProfitStats] = useState<ProfitStats | null>(null)
    const [salesOverview, setSalesOverview] = useState<any[]>([])

    // Report data state
    const [reportData, setReportData] = useState<any[]>([])
    const [filteredReportData, setFilteredReportData] = useState<any[]>([])

    // Date filters
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Search
    const [searchQuery, setSearchQuery] = useState("")

    // Profit view selector
    const [profitView, setProfitView] = useState<"daily" | "monthly" | "yearly">("monthly")

    // Handle Scroll Button Visibility
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollButton(true)
            } else {
                setShowScrollButton(false)
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        })
    }

    // Set default date filters based on report type
    const setDefaultDates = () => {
        // Daily: Set to today's date
        if (activeSection === "daily") {
            const today = new Date().toISOString().split('T')[0]
            setStartDate(today)
            setEndDate(today)
        } else {
            // All other tabs default to "All Time" (empty dates)
            setStartDate("")
            setEndDate("")
        }
    }

    // Fetch KPIs data
    const fetchKPIs = async () => {
        try {
            setLoading(true)
            const [salesRes, profitRes, overviewRes] = await Promise.all([
                api.get("/reports/sales-stats"),
                api.get("/reports/profit-stats"),
                api.get("/reports/sales-overview")
            ])

            setSalesStats(salesRes.data)
            setProfitStats(profitRes.data)
            setSalesOverview(overviewRes.data.report || [])
        } catch (error) {
            console.error("Error fetching KPIs:", error)
            toast.error("Error loading KPI data")
        } finally {
            setLoading(false)
        }
    }

    // Fetch report data based on active section
    const fetchReportData = async () => {
        try {
            setLoading(true)
            let endpoint = ""
            let params: any = {}

            if (startDate) params.startDate = startDate
            if (endDate) params.endDate = endDate

            switch (activeSection) {
                case "daily":
                    endpoint = "/reports/daily"
                    break
                case "monthly":
                    endpoint = "/reports/monthly"
                    break
                case "yearly":
                    endpoint = "/reports/yearly"
                    break
                case "stock":
                    endpoint = "/reports/stock"
                    break
                case "product":
                    endpoint = "/reports/product"
                    break
                case "product-sale":
                    endpoint = "/reports/product-sale"
                    break
                case "top-products":
                    endpoint = "/reports/top-products"
                    break
                case "profit":
                    endpoint = "/reports/profit-report"
                    params.view = profitView
                    break
                default:
                    return
            }

            const response = await api.get(endpoint, { params })
            const data = response.data.report || []
            setReportData(data)
            setFilteredReportData(data)
            setSearchQuery("") // Reset search when fetching new data
        } catch (error) {
            console.error("Error fetching report data:", error)
            toast.error("Error loading report data")
        } finally {
            setLoading(false)
        }
    }

    // Search functionality
    const handleSearch = (query: string) => {
        setSearchQuery(query)

        if (!query.trim()) {
            setFilteredReportData(reportData)
            return
        }

        const lowercaseQuery = query.toLowerCase()
        const filtered = reportData.filter(row => {
            return Object.values(row).some(value =>
                String(value).toLowerCase().includes(lowercaseQuery)
            )
        })

        setFilteredReportData(filtered)
    }

    // Helper to calculate totals
    const calculateTotals = (data: any[], headers: string[]) => {
        const totalRow: any = { [headers[0]]: "TOTAL" }

        headers.forEach((header, index) => {
            if (index === 0) return // Skip first column (already set to TOTAL)

            if (["Selling Price", "VAT Value", "Total", "Total Sales", "Total Cost", "Gross Profit", "Cost Price", "Profit"].includes(header)) {
                const sum = data.reduce((acc, row) => {
                    const val = parseFloat(String(row[header]).replace(/[^0-9.-]+/g, "")) || 0
                    return acc + val
                }, 0)
                totalRow[header] = sum.toFixed(2)
            } else {
                totalRow[header] = ""
            }
        })

        return totalRow
    }

    // Export to CSV with proper date formatting and Totals
    const exportToCSV = () => {
        const dataToExport = filteredReportData.length > 0 ? filteredReportData : reportData

        if (dataToExport.length === 0) {
            toast.error("No data to export")
            return
        }

        if (exporting) return

        setExporting(true)

        try {
            const headers = Object.keys(dataToExport[0])

            // Calculate and append totals
            const totalRow = calculateTotals(dataToExport, headers)
            const exportDataWithTotals = [...dataToExport, totalRow]

            let csv = headers.join(",") + "\n"

            exportDataWithTotals.forEach(row => {
                const values = headers.map(header => {
                    let value = row[header]

                    // Format dates properly for Excel (only for normal rows, not total row)
                    if (row !== totalRow && header.toLowerCase().includes('date') && value) {
                        const dateMatch = value.match(/(\d{2})\/(\d{2})\/(\d{4})/)
                        if (dateMatch) {
                            value = `="${value}"`
                        }
                    }

                    if (typeof value === "string") {
                        return value.includes(",") || value.includes('"')
                            ? `"${value.replace(/"/g, '""')}"`
                            : value
                    }
                    return value
                })
                csv += values.join(",") + "\n"
            })

            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${activeSection}-report-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()

            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success("CSV exported successfully")
        } catch (error) {
            console.error("Error exporting CSV:", error)
            toast.error("Error exporting CSV")
        } finally {
            setTimeout(() => setExporting(false), 500)
        }
    }

    // Export to PDF with Branded Styling, Totals, and Strict Pagination (12 rows/page)
    const exportToPDF = () => {
        const dataToExport = filteredReportData.length > 0 ? filteredReportData : reportData

        if (dataToExport.length === 0) {
            toast.error("No data to export")
            return
        }

        if (exporting) return

        setExporting(true)

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            })

            // Fix Title: "Daily Reports" -> "DAILY REPORT"
            const rawLabel = menuItems.find(item => item.id === activeSection)?.label || "Report"
            const reportTitle = rawLabel.replace(/ Reports?/i, "").toUpperCase() + " REPORT"

            const headers = Object.keys(dataToExport[0])

            // Calculate and append totals to create FULL dataset
            const totalRow = calculateTotals(dataToExport, headers)
            const allRows = [...dataToExport, totalRow].map(row => headers.map(header => String(row[header] || '')))

            // STRICT PAGINATION: Chunk into 12 rows per page
            const ROWS_PER_PAGE = 12
            const chunks = []
            for (let i = 0; i < allRows.length; i += ROWS_PER_PAGE) {
                chunks.push(allRows.slice(i, i + ROWS_PER_PAGE))
            }

            // Draw each chunk as a separate table/page
            chunks.forEach((chunk, index) => {
                if (index > 0) {
                    doc.addPage()
                }

                autoTable(doc, {
                    head: [headers],
                    body: chunk,
                    startY: 55, // Fixed start position for every page
                    theme: 'grid',
                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        textColor: 20
                    },
                    headStyles: {
                        fillColor: [30, 58, 138], // #1e3a8a Blue
                        textColor: 255,
                        fontStyle: 'bold',
                        lineWidth: 0
                    },
                    alternateRowStyles: {
                        fillColor: [248, 250, 252] // #f8fafc Light Gray
                    },
                    didParseCell: (data) => {
                        // Highlight Totals Row (It will be the last item of the LAST chunk)
                        const isLastChunk = index === chunks.length - 1
                        const isLastRowInChunk = data.row.index === chunk.length - 1

                        if (isLastChunk && isLastRowInChunk) {
                            data.cell.styles.fontStyle = 'bold'
                            data.cell.styles.fillColor = [229, 231, 235] // Light gray
                        }
                    },
                    didDrawPage: (data) => {
                        // Header Section (Matches Receipt Style)
                        // Drawn on EVERY page because we manually handle pages or autoTable hook runs nicely
                        const pageWidth = doc.internal.pageSize.width
                        const centerX = pageWidth / 2

                        // Company Name
                        doc.setFontSize(22)
                        doc.setTextColor(30, 58, 138) // #1e3a8a
                        doc.setFont("helvetica", "bold")
                        doc.text("HKS FOODS LTD", centerX, 20, { align: 'center' })

                        // Address
                        doc.setFontSize(9)
                        doc.setTextColor(102, 102, 102) // #666666
                        doc.setFont("helvetica", "normal")
                        doc.text("104 ANTHONY ROAD", centerX, 26, { align: 'center' })
                        doc.text("B8 3AA", centerX, 30, { align: 'center' })
                        doc.text("07477956299 | VAT: 495814839 | Company No: 16372393", centerX, 35, { align: 'center' })

                        // Separator Line
                        doc.setDrawColor(30, 58, 138)
                        doc.setLineWidth(0.5)
                        doc.line(14, 40, pageWidth - 14, 40)

                        // Report Title & Date
                        doc.setFontSize(14)
                        doc.setTextColor(0, 0, 0)
                        doc.setFont("helvetica", "bold")
                        doc.text(reportTitle, centerX, 48, { align: 'center' })

                        doc.setFontSize(8)
                        doc.setFont("helvetica", "normal")
                        doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, centerX, 53, { align: 'center' })

                        // Footer
                        const footerY = doc.internal.pageSize.height - 10
                        doc.setFontSize(8)
                        doc.setTextColor(100, 100, 100)

                        const pageStr = 'Page ' + doc.internal.getCurrentPageInfo().pageNumber + ' of ' + chunks.length
                        doc.text(pageStr, pageWidth - 20, footerY, { align: 'right' })

                        doc.text("HKS Foods Ltd - Confidential", 14, footerY)
                    }
                })
            })

            doc.save(`${activeSection}-report-${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success("PDF exported successfully")

        } catch (error) {
            console.error("Error exporting PDF:", error)
            toast.error("Error exporting PDF")
        } finally {
            setTimeout(() => setExporting(false), 500)
        }
    }

    // Handle export selection from dropdown
    const handleExport = (format: 'csv' | 'pdf') => {
        if (format === 'csv') {
            exportToCSV()
        } else {
            exportToPDF()
        }
    }

    // Load data when section changes
    useEffect(() => {
        // Clear previous data immediately when switching tabs
        setReportData([])
        setFilteredReportData([])
        setSearchQuery("")

        if (activeSection === "kpis") {
            fetchKPIs()
        } else {
            // Handle date setting
            if (["daily", "monthly", "yearly", "stock", "product", "product-sale"].includes(activeSection)) {
                setDefaultDates()

                // For Daily: setDefaultDates sets start/end dates -> This will trigger the SECOND useEffect (date change)
                // For Others: setDefaultDates sets empty strings -> DATE STATE WON'T CHANGE (if already empty) -> Must fetch manually here
                if (activeSection !== "daily" && !startDate && !endDate) {
                    fetchReportData()
                }
            } else {
                fetchReportData()
            }
        }
    }, [activeSection])

    // Fetch data when dates change (only for date-based tabs)
    useEffect(() => {
        // Skip if on KPIs tab or if dates aren't set yet
        if (activeSection === "kpis") return

        // For all date-based tabs, fetch data. 
        // We allow fetching even if dates are empty (implies "All Time")
        if (["daily", "monthly", "yearly", "stock", "product", "product-sale"].includes(activeSection)) {
            fetchReportData()
        }
    }, [startDate, endDate])

    // Fetch data when profit view changes (only for profit tab)
    useEffect(() => {
        if (activeSection === "profit") {
            fetchReportData()
        }
    }, [profitView])

    const menuItems = [
        { id: "kpis" as ReportSection, label: "HKS KPIs", icon: TrendingUp },
        { id: "daily" as ReportSection, label: "Daily Reports", icon: Calendar },
        { id: "monthly" as ReportSection, label: "Monthly Reports", icon: Calendar },
        { id: "yearly" as ReportSection, label: "Yearly Reports", icon: Calendar },
        { id: "stock" as ReportSection, label: "Stock Report", icon: Package },
        { id: "product" as ReportSection, label: "Product Report", icon: ShoppingCart },
        { id: "product-sale" as ReportSection, label: "Product Sale Report", icon: FileText },
        { id: "top-products" as ReportSection, label: "Top Selling Products", icon: BarChart3 },
        { id: "profit" as ReportSection, label: "Profit", icon: PoundSterling },
    ]

    return (
        <div className="space-y-6 p-6 animate-fade-in relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-metallic mb-1">Reports</h1>
                    <p className="text-kf-text-mid">Comprehensive business analytics and insights</p>
                </div>
                <Button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    variant="outline"
                    size="sm"
                    className="border-kf-border"
                >
                    {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Navigation */}
                <Card className={`${sidebarCollapsed ? 'w-16' : 'w-64'} p-4 bg-card border-kf-border card-shadow h-fit transition-all duration-300`}>
                    <div className="space-y-1">
                        {!sidebarCollapsed && (
                            <div className="text-xs font-semibold text-kf-text-mid uppercase mb-3 px-3">
                                Analytics
                            </div>
                        )}
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-colors ${activeSection === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-kf-text-mid hover:bg-muted"
                                    }`}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {/* HKS KPIs Tab */}
                    {activeSection === "kpis" && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    {/* Sales KPIs */}
                                    <div>
                                        <h2 className="text-xl font-bold text-kf-text-light mb-4">Sales Metrics</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <StatCard
                                                title="Total Sales"
                                                value={`£${salesStats?.totalSales?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={TrendingUp}
                                                iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
                                            />
                                            <StatCard
                                                title="Sales This Month"
                                                value={`£${salesStats?.totalSalesThisMonth?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={TrendingUp}
                                                iconBg="bg-gradient-to-br from-green-500 to-green-600"
                                            />
                                            <StatCard
                                                title="Sales This Week"
                                                value={`£${salesStats?.totalSalesThisWeek?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={TrendingUp}
                                                iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
                                            />
                                            <StatCard
                                                title="Sales Today"
                                                value={`£${salesStats?.totalSalesToday?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={TrendingUp}
                                                iconBg="bg-gradient-to-br from-orange-500 to-orange-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Profit KPIs */}
                                    <div>
                                        <h2 className="text-xl font-bold text-kf-text-light mb-4">Profit Metrics</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <StatCard
                                                title="Total Profit"
                                                value={`£${profitStats?.totalProfit?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={PoundSterling}
                                                iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
                                            />
                                            <StatCard
                                                title="Profit This Month"
                                                value={`£${profitStats?.totalProfitThisMonth?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={PoundSterling}
                                                iconBg="bg-gradient-to-br from-teal-500 to-teal-600"
                                            />
                                            <StatCard
                                                title="Profit This Week"
                                                value={`£${profitStats?.totalProfitThisWeek?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={PoundSterling}
                                                iconBg="bg-gradient-to-br from-cyan-500 to-cyan-600"
                                            />
                                            <StatCard
                                                title="Profit Today"
                                                value={`£${profitStats?.totalProfitToday?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                                                icon={PoundSterling}
                                                iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Sales Overview Chart */}
                                    <Card className="p-6 bg-card border-kf-border card-shadow">
                                        <h2 className="text-xl font-bold text-kf-text-light mb-6">Sales Overview</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={salesOverview}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                                                <XAxis dataKey="name" stroke="#999999" />
                                                <YAxis stroke="#999999" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#FFFFFF",
                                                        border: "1px solid #E0E0E0",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                                <Line type="monotone" dataKey="sales" stroke="#4CAF50" strokeWidth={3} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </>
                            )}
                        </div>
                    )}

                    {/* All other report tabs */}
                    {activeSection !== "kpis" && (
                        <Card className="p-6 bg-card border-kf-border card-shadow">
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <h2 className="text-xl font-bold text-kf-text-light">
                                        {menuItems.find(item => item.id === activeSection)?.label}
                                    </h2>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {/* Profit view selector */}
                                        {activeSection === "profit" && (
                                            <Select value={profitView} onValueChange={(value: any) => setProfitView(value)}>
                                                <SelectTrigger className="w-32 bg-kf-background border-kf-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}

                                        {/* Date filters for applicable reports (excluding daily as per request) */}
                                        {["monthly", "yearly", "stock", "product", "product-sale"].includes(activeSection) && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-sm text-kf-text-mid">From:</Label>
                                                    <Input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-40 bg-kf-background border-kf-border text-kf-text-dark"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-sm text-kf-text-mid">To:</Label>
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-40 bg-kf-background border-kf-border text-kf-text-dark"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={fetchReportData}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-kf-border"
                                                >
                                                    Apply
                                                </Button>
                                            </>
                                        )}

                                        {/* Export dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    disabled={exporting || reportData.length === 0}
                                                    className="w-40 bg-kf-green hover:bg-kf-green-dark text-white border-kf-green"
                                                >
                                                    {exporting ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Exporting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Export
                                                        </>
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleExport("csv")}>
                                                    Export as CSV
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                                                    Export as PDF
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Search bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kf-text-mid" />
                                    <Input
                                        type="text"
                                        placeholder="Search in table..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10 bg-kf-background border-kf-border text-kf-text-dark"
                                    />
                                </div>
                            </div>

                            {/* Report Table */}
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : filteredReportData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-kf-border">
                                                {Object.keys(filteredReportData[0]).map((header) => (
                                                    <th
                                                        key={header}
                                                        className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid"
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReportData.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors"
                                                >
                                                    {Object.values(row).map((value: any, i) => (
                                                        <td key={i} className="py-3 px-4 text-sm text-kf-text-dark">
                                                            {value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                        {/* Total Row */}
                                        <tfoot className="bg-kf-background border-t-2 border-kf-border font-bold">
                                            <tr>
                                                {Object.keys(filteredReportData[0]).map((header, index) => {
                                                    // First column says "TOTAL"
                                                    if (index === 0) {
                                                        return <td key={header} className="py-3 px-4 text-sm text-kf-text-light">TOTAL</td>
                                                    }

                                                    // Calculate totals for specific columns
                                                    if (["Selling Price", "VAT Value", "Total", "Total Sales", "Total Cost", "Gross Profit"].includes(header)) {
                                                        const total = filteredReportData.reduce((sum, row) => {
                                                            const val = parseFloat(String(row[header]).replace(/[^0-9.-]+/g, "")) || 0
                                                            return sum + val
                                                        }, 0)
                                                        return (
                                                            <td key={header} className="py-3 px-4 text-sm text-kf-text-light">
                                                                {total.toFixed(2)}
                                                            </td>
                                                        )
                                                    }

                                                    // Empty cells for other columns
                                                    return <td key={header} className="py-3 px-4"></td>
                                                })}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : reportData.length > 0 ? (
                                <div className="text-center py-12 text-kf-text-mid">
                                    No results found for "{searchQuery}"
                                </div>
                            ) : (
                                <div className="text-center py-12 text-kf-text-mid">
                                    No data available for this report
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
                <Button
                    onClick={scrollToBottom}
                    className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-50 animate-bounce"
                    variant="default"
                >
                    <ArrowDown className="h-6 w-6" />
                </Button>
            )}
        </div>
    )
}
