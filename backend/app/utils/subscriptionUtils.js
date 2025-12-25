import SubscriptionDraft from "../models/subscriptionDraft.js";

export const computeNextDeliveryDate = ({
  subscriptionType,
  interval,
  days,
  monthlyDay,
  fromDate = new Date(),
}) => {
  const d = new Date(fromDate);

  if (subscriptionType === "daily" || subscriptionType === "alternate") {
    d.setDate(d.getDate() + interval);
    return d;
  }

  if (subscriptionType === "monthly") {
    
    if (monthlyDay) {
      const targetDay = parseInt(monthlyDay, 10);
      const currentDay = d.getDate();
 
      d.setMonth(d.getMonth() + 1);
 
      const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
       
      const finalDay = Math.min(targetDay, lastDayOfMonth);
      d.setDate(finalDay);
    } else {
    
      d.setDate(d.getDate() + 30);
    }
    return d;
  }

  if (subscriptionType === "weekly" && Array.isArray(days) && days.length > 0) {
  
    const today = d.getDay();  
    const map = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const targetDay = map[days[0]]; 

    if (targetDay !== undefined) {
      const daysUntilTarget = targetDay > today 
        ? targetDay - today 
        : 7 - today + targetDay;  
      
      d.setDate(d.getDate() + daysUntilTarget);
    }
    return d;
  }

  return d;
};
 
export const updateSubscriptionDraftFromCart = async (userId, cart) => {
  try {
 
    const draft = await SubscriptionDraft.findOne({ user: userId });
 
    if (!draft || !draft.subscriptions || draft.subscriptions.length === 0) {
      return;
    }
 
    if (!cart || !cart.items || cart.items.length === 0) {
      await SubscriptionDraft.findOneAndDelete({ user: userId });
      return;
    }
 
    const defaultSettings = draft.subscriptions[0] || {};
    const defaultSubscriptionType = defaultSettings.subscriptionType || "daily";
    const defaultDuration = defaultSettings.duration || 30;
    const defaultDurationUnit = defaultSettings.durationUnit || "days";
    const defaultDays = defaultSettings.days || [];
    const defaultMonthlyDay = defaultSettings.monthlyDay || null;
    const defaultDeliverySlot = defaultSettings.deliverySlot || "6:00 AM - 8:00 AM";

 
    const existingSubMap = new Map();
    draft.subscriptions.forEach(sub => {
      const productId = sub.productId?.toString() || sub.productId;
      existingSubMap.set(productId, sub);
    });
 
    const updatedSubscriptions = cart.items.map(cartItem => {
      const productId = cartItem.product?.toString() || cartItem.product;
      const existingSub = existingSubMap.get(productId);

      if (existingSub) {
    
        return {
          productId: productId,
          quantity: cartItem.quantity || 1,
          subscriptionType: existingSub.subscriptionType || defaultSubscriptionType,
          days: existingSub.days || defaultDays,
          monthlyDay: existingSub.monthlyDay !== undefined ? existingSub.monthlyDay : defaultMonthlyDay,
          deliverySlot: existingSub.deliverySlot || defaultDeliverySlot,
          duration: existingSub.duration || defaultDuration,
          durationUnit: existingSub.durationUnit || defaultDurationUnit,
        };
      } else {
 
        return {
          productId: productId,
          quantity: cartItem.quantity || 1,
          subscriptionType: defaultSubscriptionType,
          days: defaultDays,
          monthlyDay: defaultMonthlyDay,
          deliverySlot: defaultDeliverySlot,
          duration: defaultDuration,
          durationUnit: defaultDurationUnit,
        };
      }
    });
 
    await SubscriptionDraft.findOneAndUpdate(
      { user: userId },
      { 
        subscriptions: updatedSubscriptions,
        updatedAt: new Date()
      }
    );
  } catch (error) {
    console.error("Error updating subscription draft from cart:", error);
   
  }
};
