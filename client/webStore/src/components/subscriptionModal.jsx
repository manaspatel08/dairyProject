import React, { useState, useEffect } from "react";
import axios from "../api";
import { toast } from "react-toastify";

const DELIVERY_SLOTS = [
  "6:00 AM - 8:00 AM",
  "8:00 AM - 10:00 AM",
  "5:00 PM - 7:00 PM",
];

const WEEK_DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export default function CartSubscriptionModal({
  show,
  onClose,
  cartItems,
  onConfirm,
}) {
  const [subscriptionType, setSubscriptionType] = useState("daily");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [days, setDays] = useState([]);  
  const [selectedDay, setSelectedDay] = useState("");  
  const [monthlyDay, setMonthlyDay] = useState("");  
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
 
  const getDurationOptions = (type) => {
    if (type === "daily" || type === "alternate") {
      return [
        { value: 5, label: "5 days" },
        { value: 10, label: "10 days" },
        { value: 15, label: "15 days" },
        { value: 20, label: "20 days" },
        { value: 25, label: "25 days" },
        { value: 30, label: "30 days" },
        { value: 40, label: "40 days" },
        { value: 60, label: "60 days" },
        { value: 90, label: "90 days" },
        { value: 180, label: "180 days" },
      ];
    } else if (type === "weekly") {
      return [
        { value: 2, label: "2 weeks" },
        { value: 4, label: "4 weeks (1 month)" },
        { value: 8, label: "8 weeks (2 months)" },
        { value: 12, label: "12 weeks (3 months)" },
        { value: 24, label: "24 weeks (6 months)" },
        { value: 52, label: "52 weeks (1 year)" },
      ];
    } else if (type === "monthly") {
      return [
        { value: 1, label: "1 month" },
        { value: 3, label: "3 months" },
        { value: 6, label: "6 months" },
        { value: 12, label: "12 months (1 year)" },
      ];
    }
    return [];
  }; 

  useEffect(() => {
    const options = getDurationOptions(subscriptionType);
    if (options.length > 0 && !options.find(opt => opt.value === duration)) {
      setDuration(options[0].value);
    }
  }, [subscriptionType]);

  if (!show) return null;
 
  const calculateDeliveries = (type, dur) => {
    if (type === "daily") return dur;
    if (type === "alternate") return Math.floor(dur / 2);
    if (type === "weekly") return dur;
    if (type === "monthly") return dur;
    return 0;
  };
 
  const handleWeeklyDaySelect = (day) => {
    setSelectedDay(day);
    setDays([day]);  
  };
 
  const handleMonthlyDaySelect = (day) => {
    setMonthlyDay(day);
  };

  const handleConfirm = async () => {
    if (!deliverySlot) {
      toast.error("Please select a delivery time slot");
      return;
    }

    if (subscriptionType === "weekly" && !selectedDay) {
      toast.error("Please select a delivery day");
      return;
    }

    if (subscriptionType === "monthly" && !monthlyDay) {
      toast.error("Please select a delivery day of the month");
      return;
    }

    try {
      setLoading(true);
 
      const durationUnit = 
        subscriptionType === "daily" || subscriptionType === "alternate"
          ? "days"
          : subscriptionType === "weekly"
          ? "weeks"
          : "months";

      const subscriptions = cartItems.map((it) => ({
        productId: it.product?._id || it.product,
        quantity: it.quantity,
        subscriptionType,
        days: subscriptionType === "weekly" ? [selectedDay] : [], 
        monthlyDay: subscriptionType === "monthly" ? monthlyDay : null,  
        deliverySlot,
        duration,
        durationUnit,
      }));

      onConfirm(subscriptions);
      onClose();
    } catch (err) {
      toast.error("Failed to prepare subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Subscribe Your Cart</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Subscription Type (Applies to all items)
              </label>
              <select
                className="form-select"
                value={subscriptionType}
                onChange={(e) => {
                  setSubscriptionType(e.target.value);
                  setDays([]);
                  setSelectedDay("");  
                  setMonthlyDay("");  
                 
                  const options = getDurationOptions(e.target.value);
                  if (options.length > 0) setDuration(options[0].value);
                }}
              >
                <option value="daily">Daily</option>
                <option value="alternate">Alternate Days</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
 
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Subscription Duration
              </label>
              <select
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {getDurationOptions(subscriptionType).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <small className="text-muted d-block mt-1">
                {subscriptionType === "daily" && `${duration} deliveries over ${duration} days`}
                {subscriptionType === "alternate" && `${Math.floor(duration / 2)} deliveries over ${duration} days`}
                {subscriptionType === "weekly" && `${duration} deliveries over ${duration} weeks`}
                {subscriptionType === "monthly" && `${duration} deliveries over ${duration} months`}
              </small>
            </div>
 
            {subscriptionType === "weekly" && (
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Select Delivery Day (Once per week)
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {WEEK_DAYS.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      className={`btn btn-sm ${
                        selectedDay === d.key
                          ? "btn-danger"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleWeeklyDaySelect(d.key)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                {selectedDay && (
                  <small className="text-muted d-block mt-1">
                    Delivery will be on {WEEK_DAYS.find(d => d.key === selectedDay)?.label} of each week
                  </small>
                )}
              </div>
            )}
 
            {subscriptionType === "monthly" && (
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Select Delivery Date of Month
                </label>
                <select
                  className="form-select"
                  value={monthlyDay}
                  onChange={(e) => handleMonthlyDaySelect(e.target.value)}
                >
                  <option value="">Select Date</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                {monthlyDay && (
                  <small className="text-muted d-block mt-1">
                    Delivery will be on {monthlyDay}th day of each month
                  </small>
                )}
              </div>
            )}
 
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Delivery Time Slot
              </label>
              <select
                className="form-select"
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
              >
                <option value="">Select time slot</option>
                {DELIVERY_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="border rounded p-2 bg-light">
              <h6 className="fw-bold">Items in Subscription</h6>
              <ul className="mb-0">
                {cartItems.map((it) => {
                  
                  const productName = it.name || it.product?.name || 'Unknown Product';
                  const productQuantity = it.quantity || 1;
                  
                  return (
                    <li key={it.product?._id || it.product?.id || it._id || it.id}>
                      {productName} × {productQuantity}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Subscription"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

