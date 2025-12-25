import Subscription from "../models/subscription.js";
import Product from "../models/product.js";
import DeliveryPartner from "../models/deliveryPartner.js";
import { handleResponse } from "../utils/handleResponse.js";
import mongoose from "mongoose";
import { SUBSCRIPTION_CONFIG } from "../config/subscriptionConfig.js";
import User from "../models/user.js";
import { sendMail } from "../utils/mailer.js";
import { subscriptionConfirmedEmail } from "../utils/emailTemplates/subscriptionConfirmed.js";

import { computeNextDeliveryDate } from "../utils/subscriptionUtils.js";


export const createSubscription = async (req, res) => {
  try {
    const {
      productId,
      subscriptionType,
      quantity = 1,
      days = [],
      deliverySlot,
    } = req.body;

    const userId = req.user.id;

    if (!deliverySlot) {
      return handleResponse(res, 400, "Delivery slot is required");
    }

    const config = SUBSCRIPTION_CONFIG.types[subscriptionType];
    if (!config) {
      return handleResponse(res, 400, "Invalid subscription type");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return handleResponse(res, 404, "Product not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    const baseAmount = product.price * quantity;
    const discount = (baseAmount * config.discountPercent) / 100;
    const platformFee = SUBSCRIPTION_CONFIG.platformFeeRule(baseAmount);

    const nextDeliveryDate = computeNextDeliveryDate({
      subscriptionType,
      interval: config.intervalDays || 1,
      days,
      monthlyDay: req.body.monthlyDay || null,
    });

    const sub = await Subscription.create({
      user: userId,
      product: productId,
      productName: product.name,
      productImage: product.imageUrl,
      unitPrice: product.price,
      quantity,
      subscriptionType,
        interval: config.intervalDays || 1,
        days,
        monthlyDay: req.body.monthlyDay || null,
        deliverySlot,
      discountPercent: config.discountPercent,
      platformFee,
      nextDeliveryDate,
      status: "active",
    });

    await sendMail({
      to: user.email,
      subject: "Subscription Confirmed",
      html: subscriptionConfirmedEmail({
        userName: user.name || user.email,
        subscriptionType,
        deliveryDays: days,
        deliverySlot,
        nextDeliveryDate: nextDeliveryDate.toDateString(),
        items: [{ name: product.name, quantity }],
      }),
    });

    return handleResponse(res, 201, "Subscription created", sub);
  } catch (err) {
    console.error("createSubscription error:", err);
    return handleResponse(res, 500, "Server Error", {
      error: err.message,
    });
  }
};


export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const subs = await Subscription.find({ user: userId })
      .populate("product", "name imageUrl price")
      .populate("deliveryPartner", "name phone email")
      .sort({ createdAt: -1 });

    return handleResponse(res, 200, "Subscriptions fetched", subs);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};



export const adminListSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ status: "active" })
      .populate("user", "name email")
      .populate("product", "name imageUrl price")
      .populate("deliveryPartner", "name phone email")
      .sort({ createdAt: -1 });

    return handleResponse(res, 200, "Subscriptions fetched", subs);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const adminAssignPartner = async (req, res) => {
  try {
    const { id } = req.params; 
    const { partnerId } = req.body;
     
    if (!mongoose.Types.ObjectId.isValid(id)) return handleResponse(res, 400, "Invalid subscription id");
    if (!partnerId) return  handleResponse(res, 400, "partnerId required");

    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) return handleResponse(res, 404, "Partner not found");

    const sub = await Subscription.findById(id);
    if (!sub) return handleResponse(res, 404, "Subscription not found");

    const buyer= await Subscription.findById(id).populate("user","email")
    console.log(buyer.user.email)
    sub.deliveryPartner = partnerId;
    await sub.save();
    await sub.populate("deliveryPartner", "name phone email").execPopulate?.();
   if (buyer && buyer.user.email) {
      try {
        
        await sendMail({ to: buyer.user.email, subject: "partner assigned", html: `<h3>Your delivery partner is assigned</h3>` });
      } catch (e) {
        console.warn("Failed to send payment email:", e);
      }
    }
     
    return handleResponse(res, 200, "Partner assigned", sub);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};


