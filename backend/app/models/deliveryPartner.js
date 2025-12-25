// import mongoose from "mongoose";

const DeliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model("DeliveryPartner", DeliveryPartnerSchema);

import mongoose from "mongoose";

