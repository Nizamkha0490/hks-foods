"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, ArrowUpDown, Eye } from "lucide-react";
import api from "../utils/api";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { toast } from "sonner"

interface BackendSupplier {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  totalDebit?: number
  totalCredit?: number
}

export default function Suppliers() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<BackendSupplier | null>(null)
  const [suppliers, setSuppliers] = useState<BackendSupplier[]>([])
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingSupplier, setDeletingSupplier] = useState(false)
  const [stats, setStats] = useState({ totalSuppliers: 0, totalBalance: 0 })

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

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/suppliers");
      setSuppliers(response.data.suppliers || response.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Error loading suppliers");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/suppliers/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error loading stats");
    }
  };

  useEffect(() => {
    fetchSuppliers()
    fetchStats()
  }, [])

  const filteredSuppliers = suppliers
    .filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.phone && supplier.phone.includes(searchTerm))
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

  const getFullAddress = (supplier: BackendSupplier) => {
    const parts = []
    if (supplier.address) parts.push(supplier.address)
    if (supplier.city) parts.push(supplier.city)
    if (supplier.zipCode) parts.push(supplier.zipCode)
    return parts.length > 0 ? parts.join(", ") : "-"
  }

  const handleAddSupplier = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address.street,
        city: formData.address.city,
        zipCode: formData.address.postalCode,
      };
      await api.post("/suppliers", payload);
      setIsAddOpen(false);
      resetForm();
      fetchSuppliers();
      toast.success("Supplier created successfully");
    } catch (error: any) {
      console.error("Error creating supplier:", error);
      toast.error(
        error.response?.data?.message || "Error creating supplier"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSupplier = async () => {
    if (!selectedSupplier) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address.street,
        city: formData.address.city,
        zipCode: formData.address.postalCode,
      };
      await api.put(`/suppliers/${selectedSupplier._id}`, payload);
      setIsEditOpen(false);
      setSelectedSupplier(null);
      resetForm();
      fetchSuppliers();
      toast.success("Supplier updated successfully");
    } catch (error: any) {
      console.error("Error updating supplier:", error);
      toast.error(
        error.response?.data?.message || "Error updating supplier"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (supplier: BackendSupplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSupplier) return;

    try {
      setDeletingSupplier(true);
      await api.delete(`/suppliers/${selectedSupplier._id}`);
      fetchSuppliers();
      toast.success("Supplier deleted successfully");
      setIsDeleteOpen(false);
      setSelectedSupplier(null);
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast.error(
        error.response?.data?.message || "Error deleting supplier"
      );
    } finally {
      setDeletingSupplier(false);
    }
  };

  const openEditDialog = (supplier: BackendSupplier) => {
    setSelectedSupplier(supplier)
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
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        postalCode: "",
      },
    })
  }



  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Loading suppliers...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-metallic mb-1">Supplier Management</h1>
            <p className="text-sm md:text-base text-kf-text-mid">Manage your business suppliers</p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setIsAddOpen(true)
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px] text-left md:text-right">
            <p className="text-kf-text-mid text-sm">Total Suppliers</p>
            <p className="text-xl md:text-2xl font-bold text-metallic">{stats.totalSuppliers}</p>
          </div>
          <div className="flex-1 min-w-[140px] text-left md:text-right">
            <p className="text-kf-text-mid text-sm">Total Balance</p>
            <p className="text-xl md:text-2xl font-bold text-metallic">
              {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(stats.totalBalance)}
            </p>
          </div>
        </div>
      </div>

      <Card className="p-3 md:p-6 bg-card border-kf-border card-shadow">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted border-kf-border text-sm md:text-base min-h-[44px]"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="border-kf-border w-full md:w-auto min-h-[44px]"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <span className="text-sm">{sortOrder === "latest" ? "Latest First" : "Oldest First"}</span>
          </Button>
        </div>

        <div className="overflow-auto">
          <table className="w-full">

            <thead>
              <tr className="border-b border-kf-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid hidden md:table-cell">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid hidden md:table-cell">Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid text-right">Balance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier._id}
                  className="border-b border-kf-border hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate(`/suppliers/${supplier._id}`)}
                >
                  <td className="py-3 px-4 text-sm text-kf-text-light font-medium">{supplier.name}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-light hidden md:table-cell">{supplier.email}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid hidden md:table-cell">{supplier.phone || "-"}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid hidden md:table-cell">{getFullAddress(supplier)}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-light text-right font-medium">
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((supplier.totalDebit || 0) - (supplier.totalCredit || 0))}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSupplier(supplier)
                          setIsViewOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/suppliers/${supplier._id}`)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(supplier)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-kf-text-mid">
                    No suppliers found. Click "Add Supplier" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Supplier Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-muted border-kf-border"
                  placeholder="Supplier name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-muted border-kf-border"
                  placeholder="supplier@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-muted border-kf-border"
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
                    className="bg-muted border-kf-border"
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
                    className="bg-muted border-kf-border"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-kf-text-mid">Postal Code</Label>
                  <Input
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, postalCode: e.target.value },
                      })
                    }
                    className="bg-muted border-kf-border"
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleAddSupplier}
              disabled={submitting || !formData.name || !formData.email}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {submitting ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-muted border-kf-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-muted border-kf-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-muted border-kf-border"
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
                    className="bg-muted border-kf-border"
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
                    className="bg-muted border-kf-border"
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
                    className="bg-muted border-kf-border"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button
              onClick={handleEditSupplier}
              disabled={submitting || !formData.name || !formData.email}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {submitting ? "Updating..." : "Update Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Supplier Details Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md bg-sidebar border-kf-border p-0 overflow-hidden gap-0">
          <div className="bg-kf-border/30 p-6 border-b border-kf-border">
            <DialogHeader className="p-0">
              <DialogTitle className="text-kf-text-light text-xl">Supplier Details</DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {selectedSupplier?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-kf-text-light">{selectedSupplier?.name}</h3>
                <p className="text-kf-text-mid text-sm">Added on {selectedSupplier?.createdAt ? new Date(selectedSupplier.createdAt).toLocaleDateString() : "-"}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-kf-border">
                <Label className="text-xs text-kf-text-mid uppercase tracking-wider font-semibold">Contact Info</Label>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-kf-text-light">
                    <span className="w-16 text-kf-text-mid">Email:</span>
                    {selectedSupplier?.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-kf-text-light">
                    <span className="w-16 text-kf-text-mid">Phone:</span>
                    {selectedSupplier?.phone || "-"}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-kf-border">
                <Label className="text-xs text-kf-text-mid uppercase tracking-wider font-semibold">Address</Label>
                <p className="mt-2 text-sm text-kf-text-light leading-relaxed">
                  {selectedSupplier ? getFullAddress(selectedSupplier) : "-"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsViewOpen(false)}
            >
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-light">
              Are you sure you want to delete this supplier?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              This will permanently delete supplier "{selectedSupplier?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingSupplier}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deletingSupplier ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
