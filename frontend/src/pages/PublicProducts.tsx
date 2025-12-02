import { useState, useEffect } from "react"
import { PublicNav } from "@/components/PublicNav"
import { Package, Search, Filter, X, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PublicProduct {
    _id: string
    name: string
    description: string
    category: string
    unit: string
    price: number
    imageUrl: string
    inStock: boolean
    stock: number
}

export default function PublicProducts() {
    const [products, setProducts] = useState<PublicProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            // Determine API URL - prioritize environment variable, then hostname detection
            const getApiUrl = () => {
                // Use environment variable if set (most reliable)
                if (import.meta.env.VITE_API_BASE_URL) {
                    return `${import.meta.env.VITE_API_BASE_URL}/public/products`;
                }

                // Fallback to hostname detection for production
                if (window.location.hostname === 'hksfoods.com' ||
                    window.location.hostname === 'www.hksfoods.com' ||
                    window.location.hostname === 'hksfoods.netlify.app') {
                    return 'https://hks-foods.onrender.com/api/public/products';
                }

                // Default to localhost for development
                return 'http://localhost:5000/api/public/products';
            };

            const response = await fetch(getApiUrl())
            const data = await response.json()
            if (data.success) {
                setProducts(data.products)
            }
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))]

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <PublicNav />
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center">
                        <Package className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
                        <p className="text-gray-600 text-lg">Loading our product catalog...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PublicNav />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold mb-6">
                            <Package className="h-4 w-4 mr-2" />
                            {products.length} Products Available
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Product Inventory
                        </h1>
                        <p className="text-xl text-blue-100">
                            Browse our extensive catalog of premium food products
                        </p>
                    </div>
                </div>
            </section>

            {/* Search & Filter Bar */}
            <section className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 flex-wrap justify-center">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <Filter className="h-4 w-4" />
                                <span>Filter:</span>
                            </div>
                            {categories.map(category => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category)}
                                    className={`
                    ${selectedCategory === category
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "border-gray-300 hover:border-blue-600 hover:text-blue-600"
                                        }
                  `}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2 border-l pl-4 ml-4 border-gray-300">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode("grid")}
                                title="Grid View"
                                className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode("list")}
                                title="List View"
                                className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-sm border border-gray-200">
                                <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm ? "Try adjusting your search terms or filters" : "Check back later for new products"}
                                </p>
                                {(searchTerm || selectedCategory !== "All") && (
                                    <Button
                                        onClick={() => {
                                            setSearchTerm("")
                                            setSelectedCategory("All")
                                        }}
                                        variant="outline"
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? "s" : ""}
                                    {selectedCategory !== "All" && <span className="text-blue-600"> in {selectedCategory}</span>}
                                </p>
                            </div>
                            <div className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "flex flex-col gap-4"
                            }>
                                {filteredProducts.map(product => (
                                    viewMode === "grid"
                                        ? <ProductCard key={product._id} product={product} />
                                        : <ProductListItem key={product._id} product={product} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}

function ProductCard({ product }: { product: PublicProduct }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-24 w-24 text-gray-300" />
                    </div>
                )}
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <Badge variant="destructive" className="text-base px-6 py-2 font-bold">
                            Out of Stock
                        </Badge>
                    </div>
                )}
                {product.inStock && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-green-600 hover:bg-green-600 text-white shadow-lg">
                            In Stock
                        </Badge>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-3">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium">
                        {product.category}
                    </Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-3xl font-bold text-gray-900">
                                £{product.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                per {product.unit}
                            </div>
                        </div>

                        {product.inStock && (
                            <div className="text-right">
                                <div className="text-sm font-semibold text-green-700">
                                    {product.stock} {product.unit}s
                                </div>
                                <div className="text-xs text-gray-500">
                                    available
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProductListItem({ product }: { product: PublicProduct }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col sm:flex-row h-auto sm:h-40">
            {/* Product Image */}
            <div className="w-full sm:w-40 h-40 sm:h-full bg-gradient-to-br from-gray-100 to-gray-200 relative flex-shrink-0">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                    </div>
                )}
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <Badge variant="destructive" className="text-xs px-2 py-1 font-bold">
                            Out of Stock
                        </Badge>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col sm:flex-row flex-grow gap-4">
                <div className="flex-grow">
                    <div className="mb-2">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium text-xs">
                            {product.category}
                        </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center min-w-[120px] border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4 mt-auto sm:mt-0">
                    <div className="text-left sm:text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            £{product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                            per {product.unit}
                        </div>
                    </div>

                    {product.inStock ? (
                        <div className="text-right mt-0 sm:mt-2">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">
                                {product.stock} {product.unit}s left
                            </Badge>
                        </div>
                    ) : (
                        <div className="mt-0 sm:mt-2">
                            <Badge variant="outline" className="text-gray-500 border-gray-300">
                                Unavailable
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
