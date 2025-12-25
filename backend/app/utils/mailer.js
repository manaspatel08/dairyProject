import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("Email transporter error:", err);
  } else {
    console.log("Email transporter ready");
  }
});
 
export const sendMail = async ({ to, subject, html, text }) => {
  try {
    if (!to) {
      console.error("sendMail called without 'to'");
      return;
    }

    await transporter.sendMail({
      from: `"Dairy Product" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

