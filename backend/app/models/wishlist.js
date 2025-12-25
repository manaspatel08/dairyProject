import mongoose from "mongoose";

const WishlistItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String },
  price: { type: Number },
  imageUrl: { type: String },
}, { _id: false });

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [WishlistItemSchema],
}, { timestamps: true });

export default mongoose.model("Wishlist", WishlistSchema);
