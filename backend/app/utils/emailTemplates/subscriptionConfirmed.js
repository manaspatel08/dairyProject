import { baseLayout } from "./baseLayout.js";

export const subscriptionConfirmedEmail = ({
  userName,
  items,
  subscriptionType,
  deliveryDays,
  deliverySlot,
  nextDeliveryDate,
}) => {
  const itemsHtml = items
    .map(
      (i) =>
        `<li>${i.name} × ${i.quantity}</li>`
    )
    .join("");

  return baseLayout({
    title: "Subscription Confirmed",
    body: `
      <h2 style="color:#d32f2f;">Subscription Activated 🎉</h2>

      <p>Hello <strong>${userName}</strong>,</p>

      <p>Your subscription has been successfully activated with the following details:</p>

      <ul>
        <li><strong>Plan:</strong> ${subscriptionType}</li>
        ${
          deliveryDays?.length
            ? `<li><strong>Delivery Days:</strong> ${deliveryDays.join(", ")}</li>`
            : ""
        }
        <li><strong>Delivery Slot:</strong> ${deliverySlot}</li>
        <li><strong>Next Delivery:</strong> ${nextDeliveryDate}</li>
      </ul>

      <p><strong>Subscribed Items:</strong></p>
      <ul>
        ${itemsHtml}
      </ul>

      <p style="margin-top:20px;">
        Thank you for choosing us for your daily dairy needs 🥛
      </p>
    `,
  });
};
