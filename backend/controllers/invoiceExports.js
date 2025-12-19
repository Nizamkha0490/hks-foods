import PDFDocument from "pdfkit"
import ExcelJS from "exceljs"
import Purchase from "../models/Purchase.js"
import Supplier from "../models/Supplier.js"
import asyncHandler from "express-async-handler"

// Export Invoice List as PDF
export const exportInvoiceListPDF = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const supplierId = req.params.id
    const { from, to } = req.query

    const supplier = await Supplier.findOne({ _id: supplierId, userId: req.admin._id })
    if (!supplier) {
        return res.status(404).json({ success: false, message: "Supplier not found" })
    }

    // Fetch invoices with invoiceNo (filter out record goods)
    const query = {
        supplierId,
        userId: req.admin._id,
        invoiceNo: { $exists: true, $ne: "" }
    }

    if (from && to) {
        query.dateReceived = {
            $gte: new Date(from),
            $lte: new Date(to)
        }
    }

    const invoices = await Purchase.find(query).sort({ dateReceived: -1 }).lean()

    // Create PDF
    const doc = new PDFDocument({ margin: 40, size: "A4" })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=invoice-list-${supplier.name}.pdf`)

    doc.pipe(res)

    const invoicesPerPage = 15
    const totalPages = Math.ceil(invoices.length / invoicesPerPage)

    for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage()

        // Header on every page
        doc.fontSize(18).font("Helvetica-Bold").text("Invoice List", 40, 40)
        doc.fontSize(10).font("Helvetica").text(`Supplier: ${supplier.name}`, 40, 65)
        if (from && to) {
            doc.text(`Period: ${new Date(from).toLocaleDateString()} - ${new Date(to).toLocaleDateString()}`, 40, 80)
        }
        doc.text(`Page ${page + 1} of ${totalPages}`, 500, 40, { align: "right" })

        // Table headers
        const tableTop = 110
        doc.fontSize(9).font("Helvetica-Bold")
        doc.text("Date", 40, tableTop)
        doc.text("Invoice No", 100, tableTop)
        doc.text("Description", 170, tableTop, { width: 120 })
        doc.text("Net", 300, tableTop, { width: 50, align: "right" })
        doc.text("VAT", 360, tableTop, { width: 50, align: "right" })
        doc.text("Total", 420, tableTop, { width: 50, align: "right" })
        doc.text("Payment", 480, tableTop, { width: 60 })
        doc.text("Status", 540, tableTop)

        doc.moveTo(40, tableTop + 15).lineTo(570, tableTop + 15).stroke()

        // Table rows
        const startIdx = page * invoicesPerPage
        const endIdx = Math.min(startIdx + invoicesPerPage, invoices.length)
        const pageInvoices = invoices.slice(startIdx, endIdx)

        let y = tableTop + 20
        doc.font("Helvetica").fontSize(8)

        pageInvoices.forEach((invoice) => {
            doc.text(new Date(invoice.dateReceived).toLocaleDateString(), 40, y, { width: 55 })
            doc.text(invoice.invoiceNo || "-", 100, y, { width: 65 })
            doc.text(invoice.notes || "-", 170, y, { width: 120, ellipsis: true })
            doc.text(`£${(invoice.items[0]?.unitPrice || 0).toFixed(2)}`, 300, y, { width: 50, align: "right" })
            doc.text(`£${(invoice.vatAmount || 0).toFixed(2)}`, 360, y, { width: 50, align: "right" })
            doc.text(`£${invoice.totalAmount.toFixed(2)}`, 420, y, { width: 50, align: "right" })
            doc.text(invoice.paymentMethod || "-", 480, y, { width: 60, ellipsis: true })
            doc.text(invoice.isPaid ? "Paid" : "Unpaid", 540, y)
            y += 20
        })

        // Footer on every page
        const footerY = 750
        doc.moveTo(40, footerY).lineTo(570, footerY).stroke()
        doc.fontSize(7).text(`Generated: ${new Date().toLocaleString()}`, 40, footerY + 5)

        // Totals on last page
        if (page === totalPages - 1) {
            const totalNet = invoices.reduce((sum, inv) => sum + (inv.items[0]?.unitPrice || 0), 0)
            const totalVAT = invoices.reduce((sum, inv) => sum + (inv.vatAmount || 0), 0)
            const grandTotal = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

            doc.fontSize(9).font("Helvetica-Bold")
            doc.text("Totals:", 300, footerY + 20, { width: 50, align: "right" })
            doc.text(`£${totalNet.toFixed(2)}`, 300, footerY + 35, { width: 50, align: "right" })
            doc.text(`£${totalVAT.toFixed(2)}`, 360, footerY + 35, { width: 50, align: "right" })
            doc.text(`£${grandTotal.toFixed(2)}`, 420, footerY + 35, { width: 50, align: "right" })
        }
    }

    doc.end()
})

// Export Invoice List as Excel
export const exportInvoiceListExcel = asyncHandler(async (req, res) => {
    if (!req.admin || !req.admin._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const supplierId = req.params.id
    const { from, to } = req.query

    const supplier = await Supplier.findOne({ _id: supplierId, userId: req.admin._id })
    if (!supplier) {
        return res.status(404).json({ success: false, message: "Supplier not found" })
    }

    // Fetch invoices
    const query = {
        supplierId,
        userId: req.admin._id,
        invoiceNo: { $exists: true, $ne: "" }
    }

    if (from && to) {
        query.dateReceived = {
            $gte: new Date(from),
            $lte: new Date(to)
        }
    }

    const invoices = await Purchase.find(query).sort({ dateReceived: -1 }).lean()

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Invoice List")

    // Set column widths
    worksheet.columns = [
        { header: "Date", key: "date", width: 12 },
        { header: "Invoice No", key: "invoiceNo", width: 15 },
        { header: "Description", key: "description", width: 30 },
        { header: "Net Amount", key: "net", width: 12 },
        { header: "VAT Amount", key: "vat", width: 12 },
        { header: "Total", key: "total", width: 12 },
        { header: "Payment Method", key: "payment", width: 15 },
        { header: "Status", key: "status", width: 10 }
    ]

    // Style header row - ORANGE background for invoice list
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
    worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF6600" } // Orange
    }
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" }
    worksheet.getRow(1).height = 20

    // Add data rows
    invoices.forEach((invoice) => {
        const row = worksheet.addRow({
            date: new Date(invoice.dateReceived).toLocaleDateString(),
            invoiceNo: invoice.invoiceNo || "-",
            description: invoice.notes || "-",
            net: invoice.items[0]?.unitPrice || 0,
            vat: invoice.vatAmount || 0,
            total: invoice.totalAmount,
            payment: invoice.paymentMethod || "-",
            status: invoice.isPaid ? "Paid" : "Unpaid"
        })

        // Format currency columns
        row.getCell(4).numFmt = "£#,##0.00"
        row.getCell(5).numFmt = "£#,##0.00"
        row.getCell(6).numFmt = "£#,##0.00"

        // Add borders
        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            }
        })
    })

    // Add totals row
    const totalNet = invoices.reduce((sum, inv) => sum + (inv.items[0]?.unitPrice || 0), 0)
    const totalVAT = invoices.reduce((sum, inv) => sum + (inv.vatAmount || 0), 0)
    const grandTotal = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

    const totalsRow = worksheet.addRow({
        date: "",
        invoiceNo: "",
        description: "TOTALS",
        net: totalNet,
        vat: totalVAT,
        total: grandTotal,
        payment: "",
        status: ""
    })

    totalsRow.font = { bold: true }
    totalsRow.getCell(4).numFmt = "£#,##0.00"
    totalsRow.getCell(5).numFmt = "£#,##0.00"
    totalsRow.getCell(6).numFmt = "£#,##0.00"

    // Send file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename=invoice-list-${supplier.name}.xlsx`)

    await workbook.xlsx.write(res)
    res.end()
})
