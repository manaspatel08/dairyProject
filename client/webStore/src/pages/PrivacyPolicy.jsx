import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="container py-5">
      <h2 className="mb-4">Privacy Policy</h2>

      <p>
        We value your privacy. This Privacy Policy explains how FoodTrove
        collects, uses, and protects your personal information.
      </p>

      <h5>Information We Collect</h5>
      <ul>
        <li>Personal details such as name, email, phone number, and address</li>
        <li>Order and payment-related information</li>
        <li>Usage data to improve our services</li>
      </ul>

      <h5>How We Use Your Information</h5>
      <ul>
        <li>To process orders and subscriptions</li>
        <li>To provide customer support</li>
        <li>To improve our platform and services</li>
      </ul>

      <p>
        We do not sell or share your personal data with third parties except
        where required by law.
      </p>
    </div>
  );
}
