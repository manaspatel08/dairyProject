import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";
import { handleResponse } from "../utils/handleResponse.js";

async function findOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, items: [] });
  return wishlist;
}

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate("items.product", "name imageUrl price _id");
    
    if (!wishlist) return handleResponse(res, 200, "Wishlist fetched", { items: [] });
    return handleResponse(res, 200, "Wishlist fetched", wishlist);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { productId } = req.body;
    if (!productId) return handleResponse(res, 400, "productId is required");

    const product = await Product.findById(productId);
    if (!product) return handleResponse(res, 404, "Product not found");

    const wishlist = await findOrCreateWishlist(userId);
    const itemExists = wishlist.items.some(item => 
      item.product.toString() === productId
    );

    if (!itemExists) {
      wishlist.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
      });
      await wishlist.save();
    }
 
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate("items.product", "name imageUrl price _id");

    return handleResponse(res, 200, "Added to wishlist", populatedWishlist);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { productId } = req.params;
    if (!productId) return handleResponse(res, 400, "productId is required");

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    );

    if (!wishlist) return handleResponse(res, 404, "Wishlist not found");
    
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate("items.product", "name imageUrl price _id");
    
    return handleResponse(res, 200, "Removed from wishlist", populatedWishlist);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};


 





