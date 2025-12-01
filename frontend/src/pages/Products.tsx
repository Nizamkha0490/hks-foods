"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, ArrowUpDown, Package } from "lucide-react"
import api from "../utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface BackendProduct {
  _id: string
  serialNo: string
  name: string
  category: string
  unit: string
  costPrice: number
  sellingPrice: number
  stock: number
  minStockLevel: number
  vat?: number
  isActive: boolean
  imageUrl?: string
  isPublic?: boolean
  createdAt?: string
}

// Cache to store products data
let productsCache: BackendProduct[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 30000 // 30 seconds cache

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null)
  const [products, setProducts] = useState<BackendProduct[]>([])
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    unit: "",
    costPrice: "",
    sellingPrice: "",
    vat: "", // No default value
    imageUrl: "",
    isPublic: true,
  })

  const fetchProducts = async (forceRefresh = false) => {
    const now = Date.now()
    if (!forceRefresh && productsCache && now - lastFetchTime < CACHE_DURATION) {
      setProducts(productsCache)
      setLoading(false)
      setInitialLoad(false)
      return
    }

    try {
      if (initialLoad) setLoading(true)
      const response = await api.get("/products")
      const productsData = response.data.products || response.data
      productsCache = productsData
      lastFetchTime = now
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
      if (initialLoad) {
        toast.error("Error loading products")
      }
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Optimized filtering and sorting
  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.serialNo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })

  const handleAddProduct = async () => {
    if (!formData.vat) {
      toast.error("Please select a VAT rate")
      return
    }

    setIsAdding(true)
    try {
      await api.post("/products", {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        costPrice: Number.parseFloat(formData.costPrice) || 0,
        sellingPrice: Number.parseFloat(formData.sellingPrice) || 0,
        stock: Number.parseFloat(formData.stock) || 0,
        vat: Number.parseFloat(formData.vat),
        minStockLevel: 50,
        imageUrl: formData.imageUrl,
        isPublic: formData.isPublic,
      })
      setIsAddOpen(false)
      resetForm()
      await fetchProducts(true)
      toast.success("Product added successfully")
    } catch (error: any) {
      console.error("Error adding product:", error)
      toast.error(error.response?.data?.message || "Error adding product")
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return
    if (!formData.vat) {
      toast.error("Please select a VAT rate")
      return
    }

    setIsUpdating(true)
    try {
      await api.put(`/products/${selectedProduct._id}`, {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        costPrice: Number.parseFloat(formData.costPrice) || 0,
        sellingPrice: Number.parseFloat(formData.sellingPrice) || 0,
        stock: Number.parseFloat(formData.stock) || 0,
        vat: Number.parseFloat(formData.vat),
        minStockLevel: 50,
        imageUrl: formData.imageUrl,
        isPublic: formData.isPublic,
      })
      setIsEditOpen(false)
      setSelectedProduct(null)
      resetForm()
      await fetchProducts(true)
      toast.success("Product updated successfully")
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast.error(error.response?.data?.message || "Error updating product")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (product: BackendProduct) => {
    setSelectedProduct(product)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    try {
      setDeletingProduct(true)
      await api.delete(`/products/${selectedProduct._id}`)
      await fetchProducts(true)
      toast.success("Product deleted successfully")
      setIsDeleteOpen(false)
      setSelectedProduct(null)
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast.error(error.response?.data?.message || "Error deleting product")
    } finally {
      setDeletingProduct(false)
    }
  }

  const openEditDialog = (product: BackendProduct) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      stock: product.stock.toString(),
      unit: product.unit,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      vat: product.vat?.toString() || "", // Show current VAT or empty
      imageUrl: product.imageUrl || "",
      isPublic: product.isPublic !== undefined ? product.isPublic : true,
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      stock: "",
      unit: "",
      costPrice: "",
      sellingPrice: "",
      vat: "", // Reset to empty
      imageUrl: "",
      isPublic: true,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB")
        return
      }
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading && initialLoad) {
    return (
      <div className="space-y-6 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-metallic mb-1">Product Inventory</h1>
            <p className="text-kf-text-mid">Manage your product stock and pricing</p>
          </div>
          <Button disabled className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card className="p-6 bg-card border-kf-border card-shadow">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-kf-text-mid mx-auto mb-4 animate-pulse" />
              <div className="text-lg text-kf-text-mid">Loading products...</div>
              <div className="text-sm text-kf-text-mid mt-2">Please wait while we load your inventory</div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-metallic mb-1">Product Inventory</h1>
          <p className="text-sm md:text-base text-kf-text-mid">
            {products.length} product{products.length !== 1 ? "s" : ""} loaded
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsAddOpen(true)
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="p-3 md:p-6 bg-card border-kf-border card-shadow">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Serial No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Product Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Selling Price</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-kf-text-mid">Cost Price</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">VAT %</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-kf-text-mid">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className="border-b border-kf-border hover:bg-muted transition-colors">
                  <td className="py-3 px-4 text-sm text-kf-text-light font-mono font-medium">{product.serialNo}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-light">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">{product.category}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={product.stock < product.minStockLevel ? "destructive" : "default"}
                      className={product.stock < product.minStockLevel ? "bg-red-600 text-white" : ""}
                    >
                      {product.stock} {product.unit}s
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-kf-text-light font-semibold">
                    £{product.sellingPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-kf-text-light text-right">£{product.costPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-kf-text-mid">
                    {product.vat !== undefined ? `${product.vat}%` : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-kf-text-mid">
                    {searchTerm
                      ? "No products match your search"
                      : 'No products found. Click "Add Product" to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Product Name *</Label>
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Category *</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Stock Quantity *</Label>
              <Input
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                type="number"
                step="0.01"
                placeholder="Enter quantity"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Unit *</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., kg, box, unit"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Selling Price (£) *</Label>
              <Input
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Cost Price (£) *</Label>
              <Input
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-kf-text-mid">VAT % *</Label>
              <select
                value={formData.vat}
                onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                className="w-full p-2 bg-muted border border-kf-border rounded-md text-sm"
              >
                <option value="">-- Select VAT Rate --</option>
                <option value="0">0% (Zero-Rated)</option>
                <option value="5">5%</option>
                <option value="20">20% (Standard)</option>
                <option value="25">25%</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-kf-text-mid">Product Image (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-muted border-kf-border cursor-pointer"
              />
              <p className="text-xs text-kf-text-mid">Maximum file size: 2MB. Supported formats: JPG, PNG, GIF</p>
              {formData.imageUrl && (
                <div className="mt-3 p-3 bg-muted rounded-lg border border-kf-border">
                  <img src={formData.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded border-2 border-primary mb-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    className="border-kf-border text-destructive hover:text-destructive"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
            <div className="col-span-2 flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="isPublic-add"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isPublic-add" className="text-sm font-medium text-gray-900 cursor-pointer">
                Show in Public Product Inventory
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl bg-sidebar border-kf-border max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-kf-text-light">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Product Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Category *</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Stock Quantity *</Label>
              <Input
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                type="number"
                step="0.01"
                placeholder="Enter quantity"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Unit *</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., kg, box, unit"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Selling Price (£) *</Label>
              <Input
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-kf-text-mid">Cost Price (£) *</Label>
              <Input
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-muted border-kf-border"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-kf-text-mid">VAT % *</Label>
              <select
                value={formData.vat}
                onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                className="w-full p-2 bg-muted border border-kf-border rounded-md text-sm"
              >
                <option value="">-- Select VAT Rate --</option>
                <option value="0">0% (Zero-Rated)</option>
                <option value="5">5%</option>
                <option value="20">20% (Standard)</option>
                <option value="25">25%</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-kf-text-mid">Product Image (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-muted border-kf-border cursor-pointer"
              />
              <p className="text-xs text-kf-text-mid">Maximum file size: 2MB. Supported formats: JPG, PNG, GIF</p>
              {formData.imageUrl && (
                <div className="mt-3 p-3 bg-muted rounded-lg border border-kf-border">
                  <img src={formData.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded border-2 border-primary mb-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                    className="border-kf-border text-destructive hover:text-destructive"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
            <div className="col-span-2 flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="isPublic-edit"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isPublic-edit" className="text-sm font-medium text-gray-900 cursor-pointer">
                Show in Public Product Inventory
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-kf-border">
              Cancel
            </Button>
            <Button onClick={handleEditProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-sidebar border-kf-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-kf-text-light">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-kf-text-mid">
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-kf-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={deletingProduct}>
              {deletingProduct ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
