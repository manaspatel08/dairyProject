import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },  
  currency: { type: String, default: "INR" },
  items: { type: Array, default: [] },
  address: { type: Object, default: null },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }],
  
  subtotal: { type: Number },  
  discountPercent: { type: Number, default: 0 },  
  discountAmount: { type: Number, default: 0 },  
  platformFee: { type: Number, default: 0 },  
  subscriptionType: { type: String },  
   
  subscriptionDuration: { type: Number }, 
  subscriptionDurationUnit: { type: String },  
  numberOfDeliveries: { type: Number },  
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
}, { timestamps: true });

export default mongoose.model("Payment", PaymentSchema);
