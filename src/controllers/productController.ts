import { NextFunction, Request, Response } from "express";
import { BaseQuery, newProductReqBody, SearchReqQuery } from "../types/types.js";
import { ProductModel } from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { rm } from "fs";
import { dataCaching } from "../app.js";
import { invalidateCache } from "../utils/invalidateCache.js";


// create new product
export const createProduct = async (
    req: Request<{}, {}, newProductReqBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const photo = req.file;
        const { name, category, description, price, stock } = req.body;
        
        console.log("Error:", name, category, description, price, stock, photo);
        

        if (!photo) return next(new ErrorHandler("Please attach an image!", 400))
        console.log("Uploaded file details:", photo);

        if (!name || !category || !description || !price) {
            rm(photo.path, () => {
                console.log("Deleted Successfully")
            })

            return next(new ErrorHandler("Please full all fields", 400))
        }

        // Get user ID from the authenticated user
        const userId = req.user._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User is not authenticated.",
            });
        }

        // Create the product in the database
        const product = await ProductModel.create({
            name,
            category: category.toLowerCase(),
            description,
            price,
            stock,
            photo: photo?.path,
            user: userId,
        });

        invalidateCache({
            product: true,
            admin: true,
            productId:product._id
        })

        return res.status(201).json({
            success: true,
            message: "Product created Successfully",
            product,
        });
    } catch (error) {
        console.log("Error:", error);
        return next(new ErrorHandler("Failed to create product.", 500));
    }
};



// latest products
export const getLatestProducts = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {

        let products
        if (dataCaching.has("latest-products")) {
            products = JSON.parse(dataCaching.get("latest-products") as string)
        } else {
            products = await ProductModel.find({})
                .sort({ createdAt: -1 })
                .limit(8)

            dataCaching.set("latest-products", JSON.stringify(products))
        }

        return res.status(200).json({
            success: true,
            message: "Latest products retrieved successfully",
            totalProducts: products.length,
            products
        })

    } catch (error) {
        return next(new ErrorHandler("An error occurred during getting latest products", 400))
    }
}


// all categories
// Revalidated on new, update, delete and on order
export const getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {

        let categories;
        if (dataCaching.has("categories")) {
            categories = JSON.parse(dataCaching.get("categories") as string)
        } else {
            categories = await ProductModel.distinct("category")
            dataCaching.set("categories", JSON.stringify(categories))
        }
        return res.status(200).json({
            success: true,
            message: "categories retrieved successfully",
            totalCategories: categories.length,
            categories
        })

    } catch (error) {
        return next(new ErrorHandler("An error occurred during getting all categories", 400))
    }
}


// all products
// Revalidated on new, update, delete and on order
export const getAdminProducts = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        // let products;
        // if (dataCaching.has("all-product")) {
        //     products = JSON.parse(dataCaching.get("all-product") as string)
        // } else {
        //     products = await ProductModel.find({})
        //     dataCaching.set("all-product", JSON.stringify(products))
        // }

        // invalidateCache({
        //     product: true,
        //     admin: true,
        //     productId:products.map(product=>product._id)
        // })
        const products = await ProductModel.find({})

        return res.status(200).json({
            success: true,
            message: "Admin products retrieved successfully",
            totalProducts: products.length,
            products
        })

    } catch (error) {
        return next(new ErrorHandler("An error occurred during getting all products", 400))
    }
}


// get s single product
// Revalidated on new, update, delete and on order
export const getSingleProduct = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    try {
        let product
        const id = req.params.id

        if (dataCaching.has(`product-${id}`)) {
            product = JSON.parse(dataCaching.get(`product-${id}`) as string)
        } else {
            product = await ProductModel.findById(id)
            if (!product) {
                return next(new ErrorHandler("Product not found", 404))
            }
            dataCaching.set(`product-${id}`, JSON.stringify(product))
        }

        return res.status(200).json({
            success: true,
            message: "A single product retrieved successfully",
            product
        })

    } catch (error) {
        return next(new ErrorHandler("An error occurred during getting a single product", 400))
    }
}


// update products
export const updateProduct = async (
    req: Request<{ id: string }, {}, Partial<newProductReqBody>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { name, category, description, price, stock } = req.body;

        console.log("Product data received:", name, category, description, price, stock);

        // Find product by ID
        const product = await ProductModel.findById(id);
        if (!product) return next(new ErrorHandler("Product not found", 404));

        const photo = req.file;
        if (photo) {
            rm(product.photo, () => {
                console.log("Old Photo deleted withing product update")
            })
            product.photo = photo.path
        }

        // Update product fields if provided
        if (name) product.name = name;
        if (category) product.category = category.toLowerCase();
        if (description) product.description = description;
        if (price && price > 0) product.price = price;
        if (stock && stock >= 0) product.stock = stock;

        // Save the updated product in the database
        await product.save();

        invalidateCache({
            product: true,
            admin: true,
            productId: String(product._id)
        })

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return next(new ErrorHandler("Failed to update product.", 500));
    }
};


// delete product
export const deleteProduct = async (
    req: Request<{ id: string }, {}, Partial<newProductReqBody>>,
    res: Response,
    next: NextFunction
) => {
    try {
        const product = await ProductModel.findById(req.params.id);

        if (!product) return next(new ErrorHandler("Product not found", 404))

        rm(product.photo, () => {
            console.log("Associated photo deleted successfully")
        })

        // Delete the product from the database
        await product.deleteOne();

        invalidateCache({
            product: true,
            admin: true,
            productId: String(product._id)
        })

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to delete product", 500));
    }
};


// search products
export const getAllProductsWithSearch = async (
    req: Request<{}, {}, {}, SearchReqQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log('Inside searchProducts route', req.query);
        const { search, minPrice, maxPrice, category, sort } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;

        const baseQuery: BaseQuery = {};

        // Search by product name
        if (search) {
            baseQuery.name = {
                $regex: search,
                $options: "i",
            };
        }

        // Search by price range (using both gte and lte)
        if (minPrice || maxPrice) {
            baseQuery.price = {}; // Initialize `price` object
            if (minPrice) {
                baseQuery.price.$gte = Number(minPrice); 
            }
            if (maxPrice) {
                baseQuery.price.$lte = Number(maxPrice); 
            }
        }

        // Search by category
        if (category) baseQuery.category = category;

        // Find products with pagination and sorting
        const productsPromise = ProductModel.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip);

        // Get all filtered products for total count
        const [products, filteredProducts] = await Promise.all([
            productsPromise,
            ProductModel.find(baseQuery),
        ]);

        const totalPages = Math.ceil(filteredProducts.length / limit);

        if (products.length < 1) {
            return next(
                new ErrorHandler(
                    `No products found with search ${search || minPrice || maxPrice || category || sort}`,
                    404
                )
            );
        }

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully by searching...",
            totalPages,
            totalItems: filteredProducts.length,
            products,
        });

    } catch (error) {
        return next(new ErrorHandler("Failed to get filtered products", 400));
    }
};