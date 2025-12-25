export const SUBSCRIPTION_CONFIG = {
  types: {
    daily: {
      label: "Daily",
      intervalDays: 1,
      discountPercent: 10,
    },
    alternate: {
      label: "Alternate Days",
      intervalDays: 2,
      discountPercent: 5,
    },
    weekly: {
      label: "Weekly",
      discountPercent: 15,
    },
    monthly: {
      label: "Monthly",
      intervalDays: 30,
      discountPercent: 20,
    },
  },

  deliverySlots: [
    "6:00 AM - 8:00 AM",
    "8:00 AM - 10:00 AM",
    "5:00 PM - 7:00 PM",
  ],

  platformFeeRule: (amount) => {
    return amount < 100 ? 20 : 0;
  },
};
