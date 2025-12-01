"use client"

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, Search, ArrowUpDown, RefreshCw } from "lucide-react";
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
import { statsState, refreshStats } from "../utils/stats";

interface BackendCustomer {
  _id: string
  name: string
  email: string
  phone?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
  }
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  totalDues?: number
}

export default function Customers() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<BackendCustomer | null>(null)
  const [customers, setCustomers] = useState<BackendCustomer[]>([])
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState(false)
  const [stats, setStats] = useState({ totalCustomers: 0, totalBalance: 0 })
  const [refreshingBalance, setRefreshingBalance] = useState(false)

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

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clients");
      setCustomers(response.data.clients || response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async () => {
    try {
      const newStats = await refreshStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  // Function to refresh only the balance
  const refreshBalance = async () => {
    try {
      setRefreshingBalance(true);
      await updateStats();
    } catch (error) {
      console.error("Error refreshing balance:", error);
    } finally {
      setRefreshingBalance(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    updateStats();
  }, []);

  // Listen for stats updates from payments
  useEffect(() => {
    const handleStatsUpdate = () => {
      refreshBalance();
    };

    window.addEventListener("stats-updated", handleStatsUpdate);

    return () => {
      window.removeEventListener("stats-updated", handleStatsUpdate);
    };
  }, []);

  const filteredCustomers = customers
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/clients", formData);
      setIsAddOpen(false);
      resetForm();
      fetchCustomers();
      await updateStats();
      toast.success("Customer created successfully");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Error creating customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      setSubmitting(true);
      await api.put(`/clients/${selectedCustomer._id}`, formData);
      setIsEditOpen(false);
      setSelectedCustomer(null);
      resetForm();
      fetchCustomers();
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Error updating customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (customer: BackendCustomer) => {
    setSelectedCustomer(customer)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      setDeletingCustomer(true);
      await api.delete(`/clients/${selectedCustomer._id}`);
      fetchCustomers();
      await updateStats();
      toast.success("Customer deleted successfully");
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Error deleting customer");
    } finally {
      setDeletingCustomer(false);
    }
  };

  const handleViewCustomer = (customer: BackendCustomer) => {
    setSelectedCustomer(customer)
    setIsViewOpen(true)
  }

  const openEditDialog = (customer: BackendCustomer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: {
        street: customer.address?.street || "",
        city: customer.address?.city || "",
        postalCode: customer.address?.postalCode || "",
      }
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
      }
    })
  }

  const getFullAddress = (customer: BackendCustomer) => {
    if (!customer.address) return "-"
    const { street, city, postalCode } = customer.address
    const parts = [street, city, postalCode].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : "-"
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-kf-text-mid">Loading customers...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-kf-text-dark mb-1">Customer Management</h1>
            <p className="text-sm md:text-base text-kf-text-mid">Manage your business customers</p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setIsAddOpen(true)
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px] text-left md:text-right">
            <p className="text-kf-text-mid text-sm">Total Customers</p>
            <p className="text-xl md:text-2xl font-bold text-kf-text-dark">{stats.totalCustomers}</p>
          </div>

          <div className="flex-1 min-w-[140px] text-left md:text-right">
            <div className="flex items-center gap-2 mb-1 justify-start md:justify-end">
              <p className="text-kf-text-mid text-sm">Total Balance</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-kf-green/20"
                onClick={refreshBalance}
                disabled={refreshingBalance}
              >
                <RefreshCw className={`h-3 w-3 ${refreshingBalance ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xl md:text-2xl font-bold text-kf-text-dark">
              {new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP"
              }).format(stats.totalBalance)}
            </p>
          </div>
        </div>
      </div>

      <Card className="p-3 md:p-6 bg-card border-kf-border card-shadow">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-kf-background border-kf-border text-sm md:text-base min-h-[44px]"
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
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b border-kf-border hover:bg-kf-sidebar-hover transition-colors cursor-pointer"
                  onClick={() => navigate(`/customers/${customer._id}`)}
                >
                  <td className="py-3 px-4 text-sm text-kf-text-dark font-medium">{customer.name}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-dark hidden md:table-cell">{customer.email}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid hidden md:table-cell">{customer.phone || "-"}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid hidden md:table-cell">{getFullAddress(customer)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-kf-text-mid hover:text-kf-green"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${customer._id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-kf-red hover:text-kf-red-dark"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(customer);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-kf-text-mid">
                    No customers found. Click "Add Customer" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div >
      </Card >

      {/* Add Customer Modal */}
      < Dialog open={isAddOpen} onOpenChange={setIsAddOpen} >
        <DialogContent className="max-w-[95vw] md:max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Add New Customer</DialogTitle>
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
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className="bg-white text-gray-900 border-kf-border"
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-kf-text-mid">City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    className="bg-white text-gray-900 border-kf-border"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-kf-text-mid">Postal Code</Label>
                  <Input
                    value={formData.address.postalCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, postalCode: e.target.value }
                    })}
                    className="bg-white text-gray-900 border-kf-border"
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
              onClick={handleAddCustomer}
              disabled={submitting || !formData.name || !formData.email}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {submitting ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Edit Customer Modal */}
      < Dialog open={isEditOpen} onOpenChange={setIsEditOpen} >
        <DialogContent className="max-w-[95vw] md:max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-dark">Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white text-gray-900 border-kf-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-kf-text-mid">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white text-gray-900 border-kf-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-kf-text-mid">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white text-gray-900 border-kf-border"
              />
            </div>

            <div className="border-t border-kf-border pt-4">
              <Label className="text-kf-text-mid font-semibold">Address (Optional)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-kf-text-mid">Street</Label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className="bg-white text-gray-900 border-kf-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-kf-text-mid">City</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                    className="bg-white text-gray-900 border-kf-border"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-kf-text-mid">Postal Code</Label>
                  <Input
                    value={formData.address.postalCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, postalCode: e.target.value }
                    })}
                    className="bg-white text-gray-900 border-kf-border"
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
              onClick={handleEditCustomer}
              disabled={submitting || !formData.name || !formData.email}
              className="bg-kf-green hover:bg-kf-green-dark text-white"
            >
              {submitting ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Delete Confirmation Modal */}
      < AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} >
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-dark">
              Are you sure you want to delete this customer?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              This will permanently delete customer "{selectedCustomer?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingCustomer}
              className="bg-kf-red hover:bg-kf-red-dark text-white"
            >
              {deletingCustomer ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </div >
  )
}
