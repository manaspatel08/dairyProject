import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String },
  price: { type: Number },
  imageUrl: { type: String },
  quantity: { type: Number, default: 1, min: 1 },
}, { _id: false });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

// Add indexes for performance
CartSchema.index({ user: 1 });

export default mongoose.model("Cart", CartSchema);
