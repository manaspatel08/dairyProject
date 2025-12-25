import { baseLayout } from "./baseLayout.js";

export const deliveryReminderEmail = ({
  userName,
  deliverySlot,
  items,
}) => {
  const itemsHtml = items
    .map((i) => `<li>${i.name} × ${i.quantity}</li>`)
    .join("");

  return baseLayout({
    title: "Delivery Reminder",
    body: `
      <h2 style="color:#1976d2;">Delivery Reminder 🚚</h2>

      <p>Hello <strong>${userName}</strong>,</p>

      <p>This is a reminder that your dairy delivery is scheduled:</p>

      <ul>
        <li><strong>Time Slot:</strong> ${deliverySlot}</li>
      </ul>

      <p><strong>Items being delivered:</strong></p>
      <ul>${itemsHtml}</ul>

      <p>Please ensure someone is available to receive the delivery.</p>
    `,
  });
};
