"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, ArrowUpDown, Download } from "lucide-react";
import api from "../utils/api";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"



interface Expense {
  _id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: string
  reference?: string
  notes?: string
  vat?: number
}

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showOtherPaymentInput, setShowOtherPaymentInput] = useState(false)
  const [showOtherCategoryInput, setShowOtherCategoryInput] = useState(false)
  const [customPaymentMethod, setCustomPaymentMethod] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    date: "",
    category: "",
    description: "",
    amount: "",
    paymentMethod: "Bank Transfer",
    reference: "",
    vat: "0",
  })

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/expenses?limit=1000");
      const formattedExpenses = response.data.expenses.map((expense: any) => ({
        ...expense,
        date: expense.date
          ? expense.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));
      setExpenses(formattedExpenses);
    } catch (err) {
      console.error(err);
      toast.error("Error loading expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const filteredExpenses = expenses
    .filter(
      (e) =>
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  const handleAddExpense = async () => {
    if (
      !formData.date ||
      !formData.category ||
      !formData.description ||
      !formData.amount ||
      !formData.paymentMethod
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsAdding(true);
    try {
      const finalCategory =
        formData.category === "Other" ? customCategory : formData.category;
      const finalPaymentMethod =
        formData.paymentMethod === "Other"
          ? customPaymentMethod
          : formData.paymentMethod;

      const payload = {
        date: formData.date,
        category: finalCategory,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        paymentMethod: finalPaymentMethod,
        reference: formData.reference || "",
        notes: finalCategory === "Other" ? customCategory : "",
        vat: Number.parseInt(formData.vat),
      };

      await api.post("/expenses", payload);

      toast.success("Expense added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      await loadExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditExpense = async () => {
    if (!selectedExpense) return;

    if (
      !formData.date ||
      !formData.category ||
      !formData.description ||
      !formData.amount ||
      !formData.paymentMethod
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const finalCategory =
        formData.category === "Other" ? customCategory : formData.category;
      const finalPaymentMethod =
        formData.paymentMethod === "Other"
          ? customPaymentMethod
          : formData.paymentMethod;

      const payload = {
        date: formData.date,
        category: finalCategory,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        paymentMethod: finalPaymentMethod,
        reference: formData.reference || "",
        notes: finalCategory === "Other" ? customCategory : "",
        vat: Number.parseInt(formData.vat),
      };

      await api.put(`/expenses/${selectedExpense._id}`, payload);

      toast.success("Expense updated successfully");
      setIsEditDialogOpen(false);
      setSelectedExpense(null);
      resetForm();
      await loadExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update expense");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    setIsDeleting(true);
    try {
      await api.delete(`/expenses/${selectedExpense._id}`);
      toast.success("Expense deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
      await loadExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense)
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod,
      reference: expense.reference || "",
      vat: (expense.vat !== undefined ? expense.vat : 0).toString(),
    })

    // Check if we need to show custom inputs
    const categoryIsOther = !["Premises", "Vehicles", "Insurance", "Utilities", "Maintenance", "Equipment"].includes(expense.category);
    const paymentIsOther = !["Bank Transfer", "Credit Card", "Cash"].includes(expense.paymentMethod);

    setShowOtherCategoryInput(categoryIsOther);
    setShowOtherPaymentInput(paymentIsOther);

    if (categoryIsOther) {
      setCustomCategory(expense.category);
      setFormData(prev => ({ ...prev, category: "Other" }));
    }

    if (paymentIsOther) {
      setCustomPaymentMethod(expense.paymentMethod);
      setFormData(prev => ({ ...prev, paymentMethod: "Other" }));
    }

    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      date: "",
      category: "",
      description: "",
      amount: "",
      paymentMethod: "Bank Transfer",
      reference: "",
      vat: "0",
    })
    setShowOtherPaymentInput(false)
    setShowOtherCategoryInput(false)
    setCustomPaymentMethod("")
    setCustomCategory("")
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const handlePaymentMethodChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value })
    setShowOtherPaymentInput(value === "Other")
    if (value !== "Other") {
      setCustomPaymentMethod("")
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value })
    setShowOtherCategoryInput(value === "Other")
    if (value !== "Other") {
      setCustomCategory("")
    }
  }

  //   const exportToPDF = () => {
  //   const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  //   // Add logo - using the logo.jpg from public folder
  //   const logoUrl = './logo.jpg';

  //   // Add HKS Food Ltd header with professional styling
  //   doc.setFontSize(24);
  //   doc.setFont(undefined, 'bold');
  //   doc.setTextColor(30, 64, 124); // Professional blue color
  //   doc.text("HKS Food Ltd", 45, 25);

  //   // Add subtitle
  //   doc.setFontSize(12);
  //   doc.setFont(undefined, 'normal');
  //   doc.setTextColor(100, 100, 100);
  //   doc.text("Expenses Report", 45, 32);

  //   // Report date
  //   doc.setFontSize(10);
  //   doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', { 
  //     day: '2-digit', 
  //     month: 'long', 
  //     year: 'numeric' 
  //   })}`, 14, 45);

  //   // Summary section with professional styling
  //   doc.setDrawColor(200, 200, 200);
  //   doc.setFillColor(248, 250, 252);
  //   doc.roundedRect(14, 50, 182, 15, 3, 3, 'F');

  //   doc.setFontSize(11);
  //   doc.setFont(undefined, 'bold');
  //   doc.setTextColor(30, 64, 124);
  //   doc.text("SUMMARY", 20, 58);

  //   doc.setFont(undefined, 'normal');
  //   doc.setTextColor(80, 80, 80);
  //   doc.text(`Total Expenses: £${totalExpenses.toLocaleString()}`, 60, 58);
  //   doc.text(`Total Records: ${filteredExpenses.length}`, 130, 58);

  //   // Table with proper alignment
  //   const headers = [["Date", "Category", "Description", "Amount (£)", "Payment Method"]];
  //   const body = filteredExpenses.map(expense => [
  //     expense.date,
  //     expense.category,
  //     expense.description.length > 30 ? expense.description.substring(0, 30) + '...' : expense.description,
  //     `£${expense.amount.toFixed(2)}`,
  //     expense.paymentMethod
  //   ]);

  //   autoTable(doc, {
  //     head: headers,
  //     body: body,
  //     startY: 70,
  //     styles: { 
  //       fontSize: 9,
  //       cellPadding: 3,
  //       lineColor: [200, 200, 200],
  //       lineWidth: 0.1
  //     },
  //     headStyles: { 
  //       fillColor: [30, 64, 124],
  //       textColor: [255, 255, 255],
  //       fontStyle: 'bold',
  //       halign: 'center'
  //     },
  //     bodyStyles: {
  //       textColor: [60, 60, 60]
  //     },
  //     columnStyles: {
  //       0: { cellWidth: 25, halign: 'center' }, // Date
  //       1: { cellWidth: 30, halign: 'left' },   // Category
  //       2: { cellWidth: 60, halign: 'left' },   // Description
  //       3: { cellWidth: 25, halign: 'right' },  // Amount - FIXED ALIGNMENT
  //       4: { cellWidth: 35, halign: 'left' }    // Payment Method
  //     },
  //     margin: { top: 70 },
  //     theme: 'grid'
  //   });

  //   // Add footer with page numbers
  //   const pageCount = doc.getNumberOfPages();
  //   for (let i = 1; i <= pageCount; i++) {
  //     doc.setPage(i);
  //     doc.setFontSize(8);
  //     doc.setTextColor(150, 150, 150);
  //     doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  //     doc.text(`HKS Food Ltd - Confidential`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' });
  //   }

  //   const fileName = `HKS-Food-Ltd-Expenses-${new Date().toISOString().split("T")[0]}.pdf`;
  //   doc.save(fileName);
  //   toast.success("PDF exported successfully");
  //   setIsExportOpen(false);
  // }

  const exportToPDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    try {
      // Determine logo URL - prioritize environment variable, then hostname detection
      const getLogoUrl = () => {
        // Use environment variable if set (most reliable)
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
          (window.location.hostname === 'hksfoods.com' ||
            window.location.hostname === 'www.hksfoods.com' ||
            window.location.hostname === 'hksfoods.netlify.app'
            ? 'https://hksfoods.com'
            : 'http://localhost:8080');

        return `${baseUrl}/logoupdt.png`;
      };

      const logoUrl = getLogoUrl();

      console.log('Loading logo from:', logoUrl);

      // Load and add logo
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Important for CORS
      img.src = logoUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('Logo loaded successfully');
          resolve(true);
        };
        img.onerror = () => {
          console.warn('Failed to load logo, using placeholder');
          resolve(false); // Don't reject, just continue with placeholder
        };
        // Fallback timeout
        setTimeout(() => {
          console.warn('Logo load timeout, using placeholder');
          resolve(false);
        }, 2000);
      });

      if (img.complete && img.naturalHeight !== 0) {
        // Logo loaded successfully - add it to PDF
        doc.addImage(img, 'JPEG', 14, 14, 25, 25);
        console.log('Logo added to PDF');
      } else {
        // Use professional placeholder
        addLogoPlaceholder(doc);
      }

      // Add HKS Food Ltd header with professional styling
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 64, 124);
      doc.text("HKS Food Ltd", 45, 25);

      // Add subtitle
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text("Expenses Report", 45, 32);

      // Report date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })}`, 14, 45);

      // Summary section with professional styling
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 50, 182, 15, 3, 3, 'F');

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 64, 124);
      doc.text("SUMMARY", 20, 58);

      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Total Expenses: £${totalExpenses.toLocaleString()}`, 60, 58);
      doc.text(`Total Records: ${filteredExpenses.length}`, 130, 58);

      // Table with proper alignment
      const headers = [["Date", "Category", "Description", "Amount (\u00a3)", "VAT", "Payment Method"]];
      const body = filteredExpenses.map(expense => [
        expense.date,
        expense.category,
        expense.description.length > 30 ? expense.description.substring(0, 30) + '...' : expense.description,
        `\u00a3${expense.amount.toFixed(2)}`,
        `${expense.vat !== undefined ? expense.vat : 0}%`,
        expense.paymentMethod
      ]);

      autoTable(doc, {
        head: headers,
        body: body,
        startY: 70,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [30, 64, 124],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          textColor: [60, 60, 60]
        },
        columnStyles: {
          0: { cellWidth: 22, halign: 'center' },
          1: { cellWidth: 28, halign: 'left' },
          2: { cellWidth: 55, halign: 'left' },
          3: { cellWidth: 22, halign: 'right' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 33, halign: 'left' }
        },
        margin: { top: 70 },
        theme: 'grid'
      });

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text(`HKS Food Ltd - Confidential`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' });
      }

      const fileName = `HKS-Food-Ltd-Expenses-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      toast.success("PDF exported successfully with company logo");

    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportOpen(false);
    }
  }

  // Helper function for logo placeholder
  const addLogoPlaceholder = (doc: jsPDF) => {
    doc.setDrawColor(30, 64, 124);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 14, 25, 25, 3, 3, 'F');
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("HKS", 18, 22);
    doc.text("LOGO", 17, 26);
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-metallic mb-1">Expenses</h1>
          <p className="text-kf-text-mid">Track operational costs and warehouse expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-kf-border bg-transparent" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(v) => { setIsAddDialogOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-sidebar border-kf-border max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="add-dialog-description">
              <DialogHeader>
                <DialogTitle className="text-kf-text-light">Add New Expense</DialogTitle>
              </DialogHeader>
              <div id="add-dialog-description" className="sr-only">
                Form to add a new expense entry
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-kf-text-mid">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-muted border-kf-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-kf-text-mid">
                    Category *
                  </Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="bg-muted border-kf-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premises">Premises</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {showOtherCategoryInput && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="customCategory" className="text-kf-text-mid">
                      Specify Category *
                    </Label>
                    <Input
                      id="customCategory"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter category"
                      className="bg-muted border-kf-border"
                    />
                  </div>
                )}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description" className="text-kf-text-mid">
                    Description *
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted border-kf-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-kf-text-mid">
                    Amount (£) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-muted border-kf-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat" className="text-kf-text-mid">
                    VAT *
                  </Label>
                  <Select value={formData.vat} onValueChange={(value) => setFormData({ ...formData, vat: value })}>
                    <SelectTrigger className="bg-muted border-kf-border">
                      <SelectValue placeholder="Select VAT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-kf-text-mid">
                    Payment Method *
                  </Label>
                  <Select value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                    <SelectTrigger className="bg-muted border-kf-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {showOtherPaymentInput && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="customPayment" className="text-kf-text-mid">
                      Specify Payment Method *
                    </Label>
                    <Input
                      id="customPayment"
                      value={customPaymentMethod}
                      onChange={(e) => setCustomPaymentMethod(e.target.value)}
                      placeholder="Enter payment method"
                      className="bg-muted border-kf-border"
                    />
                  </div>
                )}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="reference" className="text-kf-text-mid">
                    Reference (Optional)
                  </Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="bg-muted border-kf-border"
                    placeholder="Invoice number or reference"
                  />
                </div>
                <Button
                  onClick={handleAddExpense}
                  className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 bg-card border-kf-border card-shadow">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="text-kf-text-light">
            <p className="text-sm text-kf-text-mid">Total Expenses</p>
            <h2 className="text-2xl font-bold">£{totalExpenses.toLocaleString()}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="border-kf-border"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === "asc" ? "Oldest First" : "Latest First"}
            </Button>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted border-kf-border"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kf-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">VAT</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Payment Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-kf-text-mid">
                    Loading expenses...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-kf-text-mid">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b border-kf-border hover:bg-muted transition-colors">
                    <td className="py-3 px-4 text-sm text-kf-text-light">{expense.date}</td>
                    <td className="py-3 px-4 text-sm text-kf-text-light font-medium">{expense.category}</td>
                    <td className="py-3 px-4 text-sm text-kf-text-light">{expense.description}</td>
                    <td className="py-3 px-4 text-sm text-kf-text-light font-semibold">
                      £{expense.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-kf-text-mid">{expense.vat !== undefined ? expense.vat : 0}%</td>
                    <td className="py-3 px-4 text-sm text-kf-text-mid">{expense.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(expense)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(v) => { setIsEditDialogOpen(v); if (!v) { setSelectedExpense(null); resetForm(); } }}>
        <DialogContent className="bg-sidebar border-kf-border max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Edit Expense</DialogTitle>
          </DialogHeader>
          <div id="edit-dialog-description" className="sr-only">
            Form to edit an existing expense entry
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date" className="text-kf-text-mid">
                Date *
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-kf-text-mid">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-muted border-kf-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Premises">Premises</SelectItem>
                  <SelectItem value="Vehicles">Vehicles</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showOtherCategoryInput && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-customCategory" className="text-kf-text-mid">
                  Specify Category *
                </Label>
                <Input
                  id="edit-customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter category"
                  className="bg-muted border-kf-border"
                />
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description" className="text-kf-text-mid">
                Description *
              </Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="text-kf-text-mid">
                Amount (£) *
              </Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vat" className="text-kf-text-mid">
                VAT *
              </Label>
              <Select value={formData.vat} onValueChange={(value) => setFormData({ ...formData, vat: value })}>
                <SelectTrigger className="bg-muted border-kf-border">
                  <SelectValue placeholder="Select VAT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-paymentMethod" className="text-kf-text-mid">
                Payment Method *
              </Label>
              <Select value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger className="bg-muted border-kf-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showOtherPaymentInput && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-customPayment" className="text-kf-text-mid">
                  Specify Payment Method *
                </Label>
                <Input
                  id="edit-customPayment"
                  value={customPaymentMethod}
                  onChange={(e) => setCustomPaymentMethod(e.target.value)}
                  placeholder="Enter payment method"
                  className="bg-muted border-kf-border"
                />
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-reference" className="text-kf-text-mid">
                Reference (Optional)
              </Label>
              <Input
                id="edit-reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="bg-muted border-kf-border"
                placeholder="Invoice number or reference"
              />
            </div>
            <Button
              onClick={handleEditExpense}
              className="col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="bg-sidebar border-kf-border" aria-describedby="export-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Export Data</DialogTitle>
          </DialogHeader>
          <div id="export-dialog-description" className="sr-only">
            Choose to export expenses data as PDF
          </div>
          <div className="space-y-4">
            <p className="text-kf-text-mid">This will export all expenses as a professional PDF report.</p>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-kf-border bg-transparent"
                onClick={() => setIsExportOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-light">
              Are you sure you want to delete this expense?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              This action cannot be undone. This will permanently delete the expense from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
