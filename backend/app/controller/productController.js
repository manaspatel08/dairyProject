
import Product from "../models/product.js";
import Store from "../models/store.js";
import Category from "../models/category.js";
import { handleResponse } from "../utils/handleResponse.js";
import product from "../models/product.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      storeId,
      categoryId,
      tag,
      rating,
      oldPrice,
      brand,
      stock,
    } = req.body;

    
    // const filename = req.file ? req.file.filename : null;
    // console.log(filename)
    // const product_photo = filename ? `/uploads/${filename}`: null; 
    // const product_photo = filename ; 

const imageUrl = req.file?.path || null; // Cloudinary URL


    if (!name || price == null || !storeId || !categoryId) {
      return handleResponse(
        res,
        400,
        "name, price, storeId and categoryId are required"
      );
    }
    
   
    const store = await Store.findById(storeId);
    if (!store) {
      return handleResponse(res, 404, "Store not found");
    }
    
    if (req.user && req.user.role === "admin" && store.owner.toString() !== req.user.id) {
      return handleResponse(res, 403, "You are not owner of this store");
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return handleResponse(res, 404, "Category not found");
    }

    if (category.store && category.store.toString() !== storeId) {
      return handleResponse(
        res,
        400,
        "Category does not belong to this store"
      );
    }

    const product = await Product.create({
      name,
      price,
      oldPrice,
      description,
      tag,
      rating,
      brand,
      stock,
      store: storeId,
      category: categoryId,
      imageUrl 
    });

      const populated = await Product.findById(product._id)
      .populate("store", "Store_Name")
      .populate("category", "name");

    return handleResponse(res, 201, "Product created", populated);
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  console.log("ROLE:", req.user?.role);
console.log("FILE:", req.file);
console.log("BODY:", req.body);

  try {
    const {
      name,
      price,
      description,
      categoryId,
      tag,
      rating,
      oldPrice,
      brand,
      stock,
    } = req.body;


    
    const product = await Product.findById(req.params.id).populate("store").populate("category");

    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    if (req.user && req.user.role === "admin" && product.store.owner.toString() !== req.user.id) {
      return handleResponse(res, 403, "You are not owner of this store");
    }
 
      if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (oldPrice !== undefined) product.oldPrice = oldPrice;
    if (description !== undefined) product.description = description;
   
    if (tag !== undefined) product.tag = tag;
    if (rating !== undefined) product.rating = rating;
    if (brand !== undefined) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
 
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return handleResponse(res, 404, "Category not found");
      }

      if (category.store && category.store.toString() !== product.store._id.toString()) {
        return handleResponse(res, 400, "Category does not belong to this store");
      }

      product.category = categoryId;
    }

    await product.save();

     let populated = await product.populate("store", "Store_Name");
    populated = await populated.populate("category", "name");

    return handleResponse(res, 200, "Product updated", populated);
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("store");

    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    if (req.user && req.user.role === "admin" && product.store.owner.toString() !== req.user.id) {
      return handleResponse(res, 403, "You are not owner of this store");
    }

    await product.deleteOne();
    return handleResponse(res, 200, "Product deleted");
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};
 
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("store", "Store_Name")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return handleResponse(res, 200, "Products fetched", products);
  } catch (error) {
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};


export const getProductByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const products = await Product.find({ store: storeId })
      .populate("store", "Store_Name")
      .populate("category", "name")
      .sort("name");

    return handleResponse(res, 200, "products fetched successfully", products);
  } catch (error) {
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};
 
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("store", "Store_Name")
      .populate("category", "name");

    if (!product) return handleResponse(res, 404, "Product not found");

    return handleResponse(res, 200, "Product fetched", product);
  } catch (error) {
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};
 
export const searchProducts = async (req, res) => {
  try {
    const {
      q = "",
      category = "",
      store = "",
      minPrice,
      maxPrice,
      minRating,
      sort,
    } = req.query;
   
    const text = q.trim();
    const filter = {};
 
    if (text) {
      filter.$or = [
        { name: { $regex: text, $options: "i" } },
        { description: { $regex: text, $options: "i" } },
        { tag: { $regex: text, $options: "i" } },
        { brand: { $regex: text, $options: "i" } },
      ];
    }
 
    if (category) {
      const catDoc = await Category.findOne({ name: category });
      if (catDoc) {
        filter.category = catDoc._id;
      } else {
        return handleResponse(res, 200, "Search results", []);
      }
    }

    if (store) {
      filter.store = store;
    }
   
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        filter.price.$lte = Number(maxPrice);
      }
    }
 
    if (minRating !== undefined && minRating !== "") {
      filter.rating = { $gte: Number(minRating) };
    }
 
    let sortOption = { createdAt: -1 };  
    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "rating_desc":
        sortOption = { rating: -1 };
        break;2
      case "rating_asc":
        sortOption = { rating: 1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }
 
    const products = await Product.find(filter)
      .populate("store", "Store_Name")
      .populate("category", "name")
      .sort(sortOption);

    return handleResponse(res, 200, "Search results", products);
  } catch (error) {
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};



