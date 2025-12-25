// backend/scripts/test-razorpay-create.js
import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";

(async () => {
  try {
    console.log(
      "Using Key (masked):",
      process.env.RAZORPAY_KEY_ID?.slice(0, 12) + "…"
    );

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 100,        // ₹1.00 (in paise)
      currency: "INR",
      receipt: "test_" + Date.now(),
      payment_capture: 1,
    });

    console.log("Order created successfully:", order.id);
  } catch (err) {
    console.error(
      "Test create error:",
      err.error ? err.error : err
    );
  }
})();
