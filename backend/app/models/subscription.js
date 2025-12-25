import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    productName: String,
    productImage: String,

    unitPrice: { type: Number, required: true },
    quantity: { type: Number, default: 1 },

    subscriptionType: {
      type: String,
      enum: ["daily", "alternate", "weekly", "monthly"],
      required: true,
    },

    interval: { type: Number, default: 1 },  
    days: [{ type: String }],  
    monthlyDay: { type: Number },  

    deliverySlot: {
      type: String,
      required: true,
    },

    discountPercent: Number,
    platformFee: Number,

    status: {
      type: String,
      enum: ["pending", "active", "paused", "cancelled"],
      default: "pending",
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },

    nextDeliveryDate: Date,
 
    duration: { type: Number },  
    durationUnit: { type: String, enum: ["days", "weeks", "months"] },  
    numberOfDeliveries: { type: Number },  
    remainingDeliveries: { type: Number },  
    startDate: { type: Date },  
    endDate: { type: Date },  
    prepaidAmount: { type: Number },  

    meta: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", SubscriptionSchema);
