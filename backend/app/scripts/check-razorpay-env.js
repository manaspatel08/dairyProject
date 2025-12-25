// backend/scripts/check-razorpay-env.js
import dotenv from "dotenv";
dotenv.config();

console.log("RAZORPAY_KEY_ID present:", !!process.env.RAZORPAY_KEY_ID);
console.log(
  "RAZORPAY_KEY_ID (masked):",
  process.env.RAZORPAY_KEY_ID
    ? process.env.RAZORPAY_KEY_ID.slice(0, 12) + "…"
    : "missing"
);

console.log("RAZORPAY_SECRET present:", !!process.env.RAZORPAY_SECRET);
console.log(
  "RAZORPAY_SECRET (masked):",
  process.env.RAZORPAY_SECRET
    ? process.env.RAZORPAY_SECRET.slice(0, 8) + "…"
    : "missing"
);
