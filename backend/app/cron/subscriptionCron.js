import cron from "node-cron";
import Subscription from "../models/subscription.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import { sendMail } from "../utils/mailer.js";

const computeNextDelivery = (frequency, fromDate = new Date()) => {
  const d = new Date(fromDate);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  return d;
};

cron.schedule("0 9 * * *", async () => {
  console.log("Running daily subscription reminder cron...");

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const subscriptions = await Subscription.find({
      status: "active",
      nextDeliveryDate: { $gte: todayStart, $lte: todayEnd },
    })
      .populate("user")
      .populate("product");

    for (const sub of subscriptions) {
  const user = sub.user;
  const product = sub.product;

  if (!user || !user.email) {
    console.error(
      "Subscription has no valid user/email, skipping",
      sub._id.toString()
    );
    continue;
  }

  const productName =
    sub.productName || (product ? product.name : "your subscription");

  await sendMail({
    to: user.email,
    subject: "Your dairy subscription delivery is today ",
    html: `
      <h3>Hi ${user.name || user.email},</h3>
      <p>Your delivery for <b>${productName}</b> is scheduled for today.</p>
      <p>Quantity: <b>${sub.quantity}</b></p>
      <p>Frequency: <b>${sub.frequency}</b></p>
      <p>Thank you for choosing DairyProduct!</p>
    `,
  });

  sub.nextDeliveryDate = computeNextDelivery(
    sub.frequency,
    sub.nextDeliveryDate || new Date()
  );
  await sub.save();

    }

    console.log("Subscription reminder cron completed.");
  } catch (err) {
    console.error("Error in subscription cron:", err);
  }
});
