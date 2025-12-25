import mongoose from "mongoose";

const SubscriptionDraftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },

    subscriptions: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        subscriptionType: String,
        days: [String],
        monthlyDay: Number,
        deliverySlot: String,
        duration: Number,
        durationUnit: String,
      },
    ],

    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("SubscriptionDraft", SubscriptionDraftSchema);
