import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/payment.js";
import Subscription from "../models/subscription.js";
import Cart from "../models/cart.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import DeliveryPartner from "../models/deliveryPartner.js";
import { handleResponse } from "../utils/handleResponse.js";
import { sendMail } from "../utils/mailer.js";
import { SUBSCRIPTION_CONFIG } from "../config/subscriptionConfig.js";
import { paymentSuccessEmail } from "../utils/emailTemplates/paymentSuccess.js";
import { computeNextDeliveryDate } from "../utils/subscriptionUtils.js";
import SubscriptionDraft from "../models/subscriptionDraft.js";
import { updateSubscriptionDraftFromCart } from "../utils/subscriptionUtils.js";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const computeSubtotal = (cart) => {
  return (cart.items || []).reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.price || 0),
    0
  );
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { address, subscriptions: reqSubscriptions = [] } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return handleResponse(res, 400, "Cart is empty");
    }
 
    await updateSubscriptionDraftFromCart(userId, cart);
 
    const draft = await SubscriptionDraft.findOne({ user: userId });
   
    let subscriptions = [];
    
    if (draft && draft.subscriptions && draft.subscriptions.length > 0) {
   
      const cartItemMap = new Map();
      cart.items.forEach(item => {
        const productId = item.product?.toString() || item.product;
        cartItemMap.set(productId, item);
      });

      subscriptions = draft.subscriptions
        .filter(sub => {
      
          const productId = sub.productId?.toString() || sub.productId;
          return cartItemMap.has(productId);
        })
        .map(sub => {
          const productId = sub.productId?.toString() || sub.productId;
          const cartItem = cartItemMap.get(productId);
          return {
            ...sub,
            quantity: cartItem.quantity || 1, 
          };
        });
    } else if (reqSubscriptions.length > 0) {
 
      subscriptions = reqSubscriptions;
    } else {
      return handleResponse(res, 400, "No subscription data provided");
    }

    const firstSub = subscriptions[0] || {};
 
    let subscriptionType = firstSub.subscriptionType;
    if (!subscriptionType && draft && draft.subscriptions && draft.subscriptions.length > 0) {
      subscriptionType = draft.subscriptions[0]?.subscriptionType;
    }
    
    let duration = firstSub.duration;
    if (!duration || duration <= 0) {
   
      if (draft && draft.subscriptions && draft.subscriptions.length > 0) {
        duration = draft.subscriptions[0]?.duration || 30;
      } else {
        duration = 30;  
      }
    }
    
    const durationUnit = firstSub.durationUnit || draft?.subscriptions?.[0]?.durationUnit || "days";

    let numberOfDeliveries = 0;
    let totalDurationDays = 0;
 
    if (subscriptionType) {
      if (subscriptionType === "daily") {
        numberOfDeliveries = duration;
        totalDurationDays = duration;
      } else if (subscriptionType === "alternate") {
        numberOfDeliveries = Math.floor(duration / 2);
        totalDurationDays = duration;
      } else if (subscriptionType === "weekly") {
        numberOfDeliveries = duration;
        totalDurationDays = duration * 7; 
      } else if (subscriptionType === "monthly") {
        numberOfDeliveries = duration;
        totalDurationDays = duration * 30; 
      }
    }
 
    const subtotal = (subscriptionType && numberOfDeliveries > 0) || subscriptions.length > 0
      ? cart.items.reduce((sum, item) => {
          const deliveries = numberOfDeliveries > 0 ? numberOfDeliveries : 30;
          return sum + (item.price * item.quantity * deliveries);
        }, 0)
      : computeSubtotal(cart);
 
    let discountPercent = 0;
    let discountAmount = 0;

    if (subscriptionType && SUBSCRIPTION_CONFIG.types[subscriptionType]) {
      discountPercent = SUBSCRIPTION_CONFIG.types[subscriptionType].discountPercent || 0;
      discountAmount = (subtotal * discountPercent) / 100;
    }

    const discountedSubtotal = subtotal - discountAmount;
 
    const platformFee = discountedSubtotal > 0 && discountedSubtotal < 100 ? 20 : 0;
 
    const totalAmount = discountedSubtotal + platformFee;
 
    const razorpayAmount = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: razorpayAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });
 
    const startDate = new Date();
    const endDate = new Date();
    if (totalDurationDays > 0) {
      endDate.setDate(endDate.getDate() + totalDurationDays);
    }

    const createdSubs = [];
    for (const s of subscriptions) {
      const product = await Product.findById(s.productId);
      if (!product) continue;

      const subConfig = SUBSCRIPTION_CONFIG.types[s.subscriptionType] || {};
       
      const nextDeliveryDate = computeNextDeliveryDate({
        subscriptionType: s.subscriptionType,
        interval: subConfig.intervalDays || 1,
        days: s.days || [],
        monthlyDay: s.monthlyDay || null,
      });

 
      const sub = await Subscription.create({
        user: userId,
        product: product._id,
        productName: product.name,
        productImage: product.imageUrl,
        unitPrice: product.price,
        quantity: s.quantity || 1,
        subscriptionType: s.subscriptionType,
        interval: subConfig.intervalDays || 1,
        days: s.days || [],
        monthlyDay: s.monthlyDay || null,
        deliverySlot: s.deliverySlot,
        discountPercent: subConfig.discountPercent || 0,
        platformFee: 0,  
        status: "pending",
        nextDeliveryDate,
        duration: duration,
        durationUnit: durationUnit,
        numberOfDeliveries: numberOfDeliveries,
        remainingDeliveries: numberOfDeliveries,
        startDate: startDate,
        endDate: endDate,
        prepaidAmount: totalAmount,
      });

      createdSubs.push(sub._id);
    }

    const payment = await Payment.create({
      user: userId,
      amount: totalAmount, 
      currency: "INR",
      items: cart.items,
      address,
      subscriptions: createdSubs,
      subtotal,  
      discountPercent,  
      discountAmount,  
      platformFee,  
      subscriptionType,  
      subscriptionDuration: duration,
      subscriptionDurationUnit: durationUnit,
      numberOfDeliveries: numberOfDeliveries,
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    });

    return handleResponse(res, 200, "Order created", {
      orderId: razorpayOrder.id,
      amount: razorpayAmount, 
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentRecordId: payment._id,
    });
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, "Server error");
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentRecordId,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await Payment.findByIdAndUpdate(paymentRecordId, {
        status: "failed",
      });
      return handleResponse(res, 400, "Invalid signature");
    }

    const payment = await Payment.findById(paymentRecordId);
    if (!payment) {
      return handleResponse(res, 404, "Payment not found");
    }
 
    const cart = await Cart.findOne({ user: payment.user });
    const draft = await SubscriptionDraft.findOne({ user: payment.user });

    let finalSubscriptions = [];

    if (cart && cart.items && cart.items.length > 0 && draft && draft.subscriptions && draft.subscriptions.length > 0) {
      
      await updateSubscriptionDraftFromCart(payment.user, cart);
      const updatedDraft = await SubscriptionDraft.findOne({ user: payment.user });

      if (updatedDraft && updatedDraft.subscriptions && updatedDraft.subscriptions.length > 0) {
      
        const firstDraftSub = updatedDraft.subscriptions[0];
        const subscriptionType = firstDraftSub?.subscriptionType || payment.subscriptionType || "daily";
        const duration = firstDraftSub?.duration || payment.subscriptionDuration || 30;
        const durationUnit = firstDraftSub?.durationUnit || payment.subscriptionDurationUnit || "days";
 
        let numberOfDeliveries = 0;
        let totalDurationDays = 0;

        if (subscriptionType === "daily") {
          numberOfDeliveries = duration;
          totalDurationDays = duration;
        } else if (subscriptionType === "alternate") {
          numberOfDeliveries = Math.floor(duration / 2);
          totalDurationDays = duration;
        } else if (subscriptionType === "weekly") {
          numberOfDeliveries = duration;
          totalDurationDays = duration * 7;
        } else if (subscriptionType === "monthly") {
          numberOfDeliveries = duration;
          totalDurationDays = duration * 30;
        }

        const startDate = new Date();
        const endDate = new Date();
        if (totalDurationDays > 0) {
          endDate.setDate(endDate.getDate() + totalDurationDays);
        }
 
        const cartItemMap = new Map();
        cart.items.forEach(item => {
          const productId = item.product?.toString() || item.product;
          cartItemMap.set(productId, item);
        });
 
        await Subscription.deleteMany({
          _id: { $in: payment.subscriptions || [] },
          status: "pending",
        });
 
        const subtotal = cart.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity * numberOfDeliveries);
        }, 0);

        const subConfig = SUBSCRIPTION_CONFIG.types[subscriptionType] || {};
        const discountPercent = subConfig.discountPercent || 0;
        const discountAmount = (subtotal * discountPercent) / 100;
        const discountedSubtotal = subtotal - discountAmount;
        const platformFee = discountedSubtotal > 0 && discountedSubtotal < 100 ? 20 : 0;
        const totalAmount = discountedSubtotal + platformFee;
 
        const createdSubs = [];
        for (const draftSub of updatedDraft.subscriptions) {
          const productId = draftSub.productId?.toString() || draftSub.productId;
          const cartItem = cartItemMap.get(productId);
          
          if (!cartItem) continue;  

          const product = await Product.findById(productId);
          if (!product) continue;

          const itemSubConfig = SUBSCRIPTION_CONFIG.types[draftSub.subscriptionType || subscriptionType] || {};
          
          const nextDeliveryDate = computeNextDeliveryDate({
            subscriptionType: draftSub.subscriptionType || subscriptionType,
            interval: itemSubConfig.intervalDays || 1,
            days: draftSub.days || [],
            monthlyDay: draftSub.monthlyDay || null,
          });
 
          const itemDiscountPercent = itemSubConfig.discountPercent || discountPercent;
          const subscriptionBaseAmount = product.price * (cartItem.quantity || 1) * numberOfDeliveries;
          const subscriptionDiscountAmount = (subscriptionBaseAmount * itemDiscountPercent) / 100;
          const subscriptionPrepaidAmount = subscriptionBaseAmount - subscriptionDiscountAmount;

          const sub = await Subscription.create({
            user: payment.user,
            product: productId,
            productName: product.name,
            productImage: product.imageUrl,
            unitPrice: product.price,
            quantity: cartItem.quantity || 1,  
            subscriptionType: draftSub.subscriptionType || subscriptionType,
            interval: itemSubConfig.intervalDays || 1,
            days: draftSub.days || [],
            monthlyDay: draftSub.monthlyDay || null,
            deliverySlot: draftSub.deliverySlot,
            discountPercent: itemDiscountPercent,  
            platformFee: 0,
            status: "active",  
            nextDeliveryDate,
            duration: duration,
            durationUnit: durationUnit,
            numberOfDeliveries: numberOfDeliveries,
            remainingDeliveries: numberOfDeliveries,
            startDate: startDate,
            endDate: endDate,
            prepaidAmount: subscriptionPrepaidAmount,  
          });

          createdSubs.push(sub._id);
        }

        finalSubscriptions = createdSubs;
 
        await Payment.findByIdAndUpdate(paymentRecordId, {
          subscriptions: createdSubs,
          items: cart.items,  
          amount: totalAmount, 
          subtotal: subtotal,
          discountPercent: discountPercent,
          discountAmount: discountAmount,
          platformFee: platformFee,
          subscriptionType: subscriptionType,
          subscriptionDuration: duration,
          subscriptionDurationUnit: durationUnit,
          numberOfDeliveries: numberOfDeliveries,
        });

        
      }
    } else {
 
      await Subscription.updateMany(
        { _id: { $in: payment.subscriptions || [] } },
        { status: "active" }
      );
      finalSubscriptions = payment.subscriptions || [];
    }
 
    await Cart.findOneAndUpdate(
      { user: payment.user },
      { items: [] }
    );
 
    await SubscriptionDraft.findOneAndDelete({
      user: payment.user,
    });
 
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentRecordId,
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );
 
    // try {
    //   const user = await User.findById(payment.user);
    //   if (user?.email) {
    
    //     const amount = typeof updatedPayment.amount === "number" && updatedPayment.amount > 10000
    //       ? (updatedPayment.amount / 100).toFixed(2)
    //       : Number(updatedPayment.amount || 0).toFixed(2);
 
    //     const populatedSubscriptions = await Subscription.find({
    //       _id: { $in: finalSubscriptions }
    //     }).populate("product", "name imageUrl");

    //     // await sendMail({
    //     //   to: user.email,
    //     //   subject: "Payment Successful - Order Confirmed",
    //     //   html: paymentSuccessEmail({
    //     //     userName: user.name || user.email,
    //     //     amount: amount,
    //     //     paymentId: updatedPayment.razorpayPaymentId || updatedPayment.razorpayOrderId || updatedPayment._id.toString(),
    //     //     orderId: updatedPayment._id.toString(),
    //     //     items: updatedPayment.items || [],
    //     //     subscriptions: populatedSubscriptions,
    //     //     address: updatedPayment.address,
    //     //     discountAmount: updatedPayment.discountAmount || 0,
    //     //     platformFee: updatedPayment.platformFee || 0,
    //     //   }),
    //     // });
    //   }
    // } catch (emailError) {
    //   console.error("Failed to send payment confirmation email:", emailError);
 
    // }

    return handleResponse(res, 200, "Payment verified", updatedPayment);
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, "Server error");
  }
};




export const getUserPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate("subscriptions")
    .sort({ createdAt: -1 });

  return handleResponse(res, 200, "Payments fetched", payments);
};

export const adminGetOrders = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "paid" })
      .populate("user", "name email")
      .populate({
        path: "subscriptions",
        populate: [
          {
            path: "product",
            select: "name imageUrl price category",
          },
          {
            path: "deliveryPartner",
            select: "name phone email",
          },
        ],
      })
      .sort({ createdAt: -1 });

    return handleResponse(res, 200, "Orders fetched", payments);
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, "Server error");
  }
};

export const adminAssignPartnerToOrder = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { partnerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return handleResponse(res, 400, "Invalid payment id");
    }

    const payment = await Payment.findById(paymentId).populate("user", "email");
    if (!payment) {
      return handleResponse(res, 404, "Payment/Order not found");
    }

    if (partnerId && !mongoose.Types.ObjectId.isValid(partnerId)) {
      return handleResponse(res, 400, "Invalid partner id");
    }
 
    const subscriptionIds = payment.subscriptions || [];
    if (subscriptionIds.length === 0) {
      return handleResponse(res, 400, "No subscriptions found in this order");
    }

    await Subscription.updateMany(
      { _id: { $in: subscriptionIds } },
      { deliveryPartner: partnerId || null }
    );
 
    if (payment.user?.email) {
      try {
        const partner = partnerId ? await DeliveryPartner.findById(partnerId) : null;
        await sendMail({
          to: payment.user.email,
          subject: "Delivery Partner Assigned",
          html: `
            <h3>Delivery Partner ${partnerId ? "Assigned" : "Removed"} For Your order</h3>
            <p>Your order <strong>#${payment._id.toString().slice(-8)}</strong> has been ${partnerId ? "assigned" : "unassigned"} ${partnerId ? `to <strong>${partner?.name || "a delivery partner"}` : "from delivery partner"}.</strong></p>
            ${partnerId && partner ? `<p><strong>Delivery Partner:</strong> ${partner.name}</p>` : ""}
            ${partnerId && partner ? `<p><strong>Delivery Partner Eamil:</strong> ${partner.email}</p>` : ""}
            ${partnerId && partner ? `<p><strong>Delivery Partner Phone:</strong> ${partner.phone}</p>` : ""}
          `,
        });
      } catch (e) {
        console.warn("Failed to send email:", e);
      }
    }
 
    const updatedPayment = await Payment.findById(paymentId)
      .populate("user", "name email")
      .populate({
        path: "subscriptions",
        populate: [
          {
            path: "product",
            select: "name imageUrl price category",
          },
          {
            path: "deliveryPartner",
            select: "name phone email",
          },
        ],
      });

    return handleResponse(res, 200, "Partner assigned to order", updatedPayment);
  } catch (err) {
    console.error(err);
    return handleResponse(res, 500, "Server error");
  }
};

