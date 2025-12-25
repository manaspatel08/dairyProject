import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    isDefault: { type: Boolean, default: false },  
  },
  { _id: true }  
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNo: String,
    role: {
      type: String,
      enum: ["super_admin", "admin", "customer"],
      default: "customer",
    },
    address: addressSchema,  
    addresses: [addressSchema],  
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);



