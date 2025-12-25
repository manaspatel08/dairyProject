import React from "react";

export default function TermsConditions() {
  return (
    <div className="container py-5">
      <h2 className="mb-4">Terms & Conditions</h2>

      <p>
        By using FoodTrove, you agree to comply with the following terms and
        conditions.
      </p>

      <ul>
        <li>Users must provide accurate information during registration</li>
        <li>Orders and subscriptions are subject to availability</li>
        <li>Payments must be completed using supported payment methods</li>
        <li>Misuse of the platform may result in account suspension</li>
      </ul>

      <p>
        FoodTrove reserves the right to update these terms at any time without
        prior notice.
      </p>
    </div>
  );
}
