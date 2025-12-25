import { baseLayout } from "./baseLayout.js";

export const paymentSuccessEmail = ({
  userName,
  amount,
  paymentId,
  orderId,
  items = [],
  subscriptions = [],
  address,
  discountAmount = 0,
  platformFee = 0,
}) => {
 
  let itemsHtml = "";
  if (items && items.length > 0) {
    itemsHtml = `
      <h3 style="color:#333; margin-top:20px; margin-bottom:10px;">Order Items</h3>
      <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse; margin:10px 0; border:1px solid #ddd;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="text-align:left; padding:8px; border:1px solid #ddd;">Product</th>
            <th style="text-align:center; padding:8px; border:1px solid #ddd;">Quantity</th>
            <th style="text-align:right; padding:8px; border:1px solid #ddd;">Price</th>
            <th style="text-align:right; padding:8px; border:1px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => {
            const name = item.name || item.productName || "Item";
            const qty = item.quantity || item.qty || 1;
            const price = item.price || item.unitPrice || 0;
            const total = qty * price;
            return `
              <tr>
                <td style="padding:8px; border:1px solid #ddd;">${name}</td>
                <td style="text-align:center; padding:8px; border:1px solid #ddd;">${qty}</td>
                <td style="text-align:right; padding:8px; border:1px solid #ddd;">₹${Number(price).toFixed(2)}</td>
                <td style="text-align:right; padding:8px; border:1px solid #ddd;">₹${Number(total).toFixed(2)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }
 
  let subscriptionsHtml = "";
  if (subscriptions && subscriptions.length > 0) {
    subscriptionsHtml = `
      <h3 style="color:#333; margin-top:20px; margin-bottom:10px;">Subscriptions Started</h3>
      <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse; margin:10px 0; border:1px solid #ddd;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="text-align:left; padding:8px; border:1px solid #ddd;">Product</th>
            <th style="text-align:left; padding:8px; border:1px solid #ddd;">Type</th>
            <th style="text-align:center; padding:8px; border:1px solid #ddd;">Quantity</th>
            <th style="text-align:left; padding:8px; border:1px solid #ddd;">Status</th>
            <th style="text-align:left; padding:8px; border:1px solid #ddd;">Next Delivery</th>
          </tr>
        </thead>
        <tbody>
          ${subscriptions.map((sub) => {
            const pname = sub.productName || sub.product?.name || "Subscription";
            const subType = sub.subscriptionType || sub.frequency || "—";
            const qty = sub.quantity || 1;
            const status = sub.status || "active";
            const nextDelivery = sub.nextDeliveryDate 
              ? new Date(sub.nextDeliveryDate).toLocaleDateString() 
              : "—";
            return `
              <tr>
                <td style="padding:8px; border:1px solid #ddd;">${pname}</td>
                <td style="padding:8px; border:1px solid #ddd;">${subType.charAt(0).toUpperCase() + subType.slice(1)}</td>
                <td style="text-align:center; padding:8px; border:1px solid #ddd;">${qty}</td>
                <td style="padding:8px; border:1px solid #ddd;">
                  <span style="background:#4caf50; color:white; padding:2px 8px; border-radius:3px; font-size:12px;">
                    ${status}
                  </span>
                </td>
                <td style="padding:8px; border:1px solid #ddd;">${nextDelivery}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }
 
  let addressHtml = "";
  if (address) {
    addressHtml = `
      <h3 style="color:#333; margin-top:20px; margin-bottom:10px;">Delivery Address</h3>
      <div style="background:#f9f9f9; padding:12px; border-left:3px solid #d32f2f; margin:10px 0;">
        ${address.name ? `<div><strong>${address.name}</strong></div>` : ""}
        ${address.line1 ? `<div>${address.line1}${address.line2 ? `, ${address.line2}` : ""}</div>` : ""}
        ${address.city || address.state || address.pincode 
          ? `<div>${address.city || ""}${address.state ? `, ${address.state}` : ""} ${address.pincode ? `- ${address.pincode}` : ""}</div>` 
          : ""}
        ${address.phone ? `<div>Phone: ${address.phone}</div>` : ""}
      </div>
    `;
  }

  return baseLayout({
    title: "Payment Successful",
    body: `
      <h2 style="color:#388e3c;">Payment Successful ✅</h2>

      <p>Hello <strong>${userName}</strong>,</p>

      <p>We have received your payment successfully. Your order has been confirmed!</p>

      <table cellpadding="6" cellspacing="0" style="margin:15px 0; width:100%;">
        <tr>
          <td style="padding:6px;"><strong>Order ID:</strong></td>
          <td style="padding:6px;">${orderId || paymentId}</td>
        </tr>
        <tr>
          <td style="padding:6px;"><strong>Payment ID:</strong></td>
          <td style="padding:6px;">${paymentId}</td>
        </tr>
        <tr>
          <td style="padding:6px;"><strong>Amount Paid:</strong></td>
          <td style="padding:6px; font-size:18px; color:#388e3c;"><strong>₹${amount}</strong></td>
        </tr>
        ${discountAmount > 0 ? `
        <tr>
          <td style="padding:6px;"><strong>Discount:</strong></td>
          <td style="padding:6px; color:#388e3c;">-₹${Number(discountAmount).toFixed(2)}</td>
        </tr>
        ` : ""}
        ${platformFee > 0 ? `
        <tr>
          <td style="padding:6px;"><strong>Platform Fee:</strong></td>
          <td style="padding:6px;">₹${Number(platformFee).toFixed(2)}</td>
        </tr>
        ` : ""}
      </table>

      ${itemsHtml}
      ${addressHtml}
      ${subscriptionsHtml}

      <p style="margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
        ${subscriptions && subscriptions.length > 0 
          ? "Your subscriptions are now active and deliveries will begin as scheduled. You will receive reminders before each delivery." 
          : "Thank you for your order! We will process it shortly."}
      </p>

      <p style="margin-top:15px;">
        If you have any questions, please don't hesitate to contact our support team.
      </p>
    `,
  });
};

