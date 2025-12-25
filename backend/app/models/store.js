
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    Store_Name: { type: String, required: true },
    Store_Adress: { type: String, required: true },
    Store_contactNo: { type: String, required: true },
    Store_bank_account_no: { type: String, required: true },
    store_ifsc_code: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Store", storeSchema);
