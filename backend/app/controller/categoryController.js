import Category from "../models/category.js";
import Store from "../models/store.js";
import { handleResponse } from "../utils/handleResponse.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, storeId  } = req.body;

    if (!name || !storeId) {
      return handleResponse(res, 400, "name and storeId are required");
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return handleResponse(res, 404, "Store not found");
    }

    
    if (
      req.user.role === "admin" && store.owner.toString() !== req.user.id) {
      return handleResponse(res, 403, "You are not owner of this store");
    }

    const category = await Category.create({
      name,
      description,
      store: storeId,
    });

    return handleResponse(res, 201, "Category created", category);
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};

export const getCategoriesByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const categories = await Category.find({ store: storeId }).sort("name");
    return handleResponse(res,200,"Categories fetched successfully",categories);
  } catch (error) {
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("store");

    if (!category) {
      return handleResponse(res, 404, "category not found");
    }
    console.log(req.user.role)
    if ( req.user.role === "admin" && category.store.owner.toString() !== req.user.id ) {
      return handleResponse(res, 403, "You are not owner of this category");
    }

    await category.deleteOne();
    return handleResponse(res, 200, "category deleted");
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id).populate("store");

    if (!category) {
      return handleResponse(res, 404, "category not found");
    }

    if ( req.user.role === "admin" && category.store.owner.toString() !== req.user.id) {
      return handleResponse(res, 403, "You are not owner of this category");
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;

    await category.save();

    return handleResponse(res, 200, "category updated", category);
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("store", "Store_Name")     

    return handleResponse(res, 200, "Categories fetched", categories);
  } catch (error) {
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};







