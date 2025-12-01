import Product from "../models/Product.js";

// GET PUBLIC PRODUCTS
export const getPublicProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isPublic: true,
            isActive: true
        })
            .select('name description category unit sellingPrice imageUrl stock')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            products: products.map(product => ({
                _id: product._id,
                name: product.name,
                description: product.description,
                category: product.category,
                unit: product.unit,
                price: product.sellingPrice,
                imageUrl: product.imageUrl,
                inStock: product.stock > 0,
                stock: product.stock
            }))
        });
    } catch (error) {
        console.error("Error fetching public products:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching products",
        });
    }
};
