import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },            
    description: { type: String },
    imageUrl: { type: String },     
    tag: { type: String },                
    rating: { type: Number, default: 0 },  
    brand: { type: String },
    stock: { type: Number, default: 0 },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
     imageUrl : {type : String}
  },
  { timestamps: true }
);

// Add indexes for performance
productSchema.index({ store: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", description: "text", tag: "text", brand: "text" }); // Text search index

export default mongoose.model("Product", productSchema);
