import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { handleResponse } from "../utils/handleResponse.js";
import { updateSubscriptionDraftFromCart } from "../utils/subscriptionUtils.js";

async function findOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const cart = await Cart.findOne({ user: userId }).populate("items.product", "name imageUrl price");
    if (!cart) return handleResponse(res, 200, "Cart fetched", { items: [] });

    return handleResponse(res, 200, "Cart fetched", cart);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { productId, quantity = 1 } = req.body;
    if (!productId) return handleResponse(res, 400, "productId required");

    const product = await Product.findById(productId);
    if (!product) return handleResponse(res, 404, "Product not found");

    const cart = await findOrCreateCart(userId);
    const existing = cart.items.find(it => it.product.toString() === productId);

    if (existing) {
      existing.quantity = (existing.quantity || 0) + Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: Number(quantity),
      });
    }

    await cart.save();
    await cart.populate("items.product", "name imageUrl price");
    
    // Update subscription draft to match current cart
    await updateSubscriptionDraftFromCart(userId, cart);
    
    return handleResponse(res, 200, "Item added to cart", cart);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const deleteFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const productId = req.params.productId;
    if (!productId) return handleResponse(res, 400, "productId required");

    const cart = await findOrCreateCart(userId);
    const before = cart.items.length;
    cart.items = cart.items.filter(it => it.product.toString() !== productId);

    if (cart.items.length === before) {
      return handleResponse(res, 404, "Item not found in cart");
    }

    await cart.save();
    await cart.populate("items.product", "name imageUrl price");
    
    // Update subscription draft to match current cart
    await updateSubscriptionDraftFromCart(userId, cart);
    
    return handleResponse(res, 200, "Item removed", cart);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};


export const incrementProduct = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { productId } = req.body;
    if (!productId) return handleResponse(res, 400, "productId required");

    const cart = await findOrCreateCart(userId);
    const item = cart.items.find(it => it.product.toString() === productId);
    if (!item) return handleResponse(res, 404, "Item not in cart");

    item.quantity = (item.quantity || 0) + 1;

    await cart.save();
    await cart.populate("items.product", "name imageUrl price");
    
    // Update subscription draft to match current cart
    await updateSubscriptionDraftFromCart(userId, cart);
    
    return handleResponse(res, 200, "Quantity incremented", cart);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const decrementProduct = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { productId } = req.body;
    if (!productId) return handleResponse(res, 400, "productId required");

    const cart = await findOrCreateCart(userId);
    const item = cart.items.find(it => it.product.toString() === productId);
    if (!item) return handleResponse(res, 404, "Item not in cart");

    item.quantity = (item.quantity || 0) - 1;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(it => it.product.toString() !== productId);
    }

    await cart.save();
    await cart.populate("items.product", "name imageUrl price");
    
    // Update subscription draft to match current cart
    await updateSubscriptionDraftFromCart(userId, cart);
    
    return handleResponse(res, 200, "Quantity updated", cart);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

