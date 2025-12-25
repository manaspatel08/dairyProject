import SubscriptionDraft from "../models/subscriptionDraft.js";
import { handleResponse } from "../utils/handleResponse.js";


export const saveSubscriptionDraft = async (req, res) => {
  const userId = req.user.id;
  const { subscriptions } = req.body;

  if (!subscriptions || subscriptions.length === 0) {
    return handleResponse(res, 400, "No subscription data provided");
  }

  const draft = await SubscriptionDraft.findOneAndUpdate(
    { user: userId },
    { subscriptions, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  return handleResponse(res, 200, "Subscription draft saved", draft);
};


export const getSubscriptionDraft = async (req, res) => {
  const userId = req.user.id;

  const draft = await SubscriptionDraft.findOne({ user: userId });

  return handleResponse(res, 200, "Subscription draft fetched", draft);
};
 
export const clearSubscriptionDraft = async (req, res) => {
  const userId = req.user.id;

  await SubscriptionDraft.findOneAndDelete({ user: userId });

  return handleResponse(res, 200, "Subscription draft cleared");
};

