import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
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
      from: `"Dairy Product" <${process.env.BREVO_FROM_EMAIL}>`,
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

