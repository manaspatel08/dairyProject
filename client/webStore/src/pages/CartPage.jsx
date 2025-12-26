import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import CartSubscriptionModal from "../components/subscriptionModal";
import axios from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CartPage() {
  const { cart, loading, incrementProduct, decrementProduct, deleteFromCart } =
    useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showSubModal, setShowSubModal] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const items = cart?.items || [];

  const SUBSCRIPTION_DISCOUNTS = {
    daily: 10,
    alternate: 5,
    weekly: 15,
    monthly: 20,
  };

  const SUBSCRIPTION_LABELS = {
    daily: "Daily",
    alternate: "Alternate Days",
    weekly: "Weekly",
    monthly: "Monthly",
  };

  useEffect(() => {
    const loadDraft = async () => {
      if (isAuthenticated()) {
        try {
          const res = await axios.get("/subscription-draft/me");
          if (res.data?.data?.subscriptions?.length) {
            setSubscription(res.data.data.subscriptions);
          }
        } catch (err) {}
      } else {
        const savedDraft = localStorage.getItem("guestSubscriptionDraft");
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            setSubscription(draft);
          } catch (e) {
            console.error("Failed to parse saved subscription draft", e);
            localStorage.removeItem("guestSubscriptionDraft");
          }
        }
      }
    };

    loadDraft();
  }, [isAuthenticated]);

  if (loading) return <div className="container mt-5">Loading cart...</div>;

  const subscriptionType =
    subscription?.subscriptionType || subscription?.[0]?.subscriptionType;
  const duration = subscription?.duration || subscription?.[0]?.duration || 0;
  const durationUnit =
    subscription?.durationUnit || subscription?.[0]?.durationUnit || "days";

  const calculateDeliveries = (type, dur) => {
    if (!type || !dur) return 0;
    if (type === "daily") return dur;
    if (type === "alternate") return Math.floor(dur / 2);
    if (type === "weekly") return dur;
    if (type === "monthly") return dur;
    return 0;
  };

  const numberOfDeliveries = calculateDeliveries(
    subscriptionType,
    duration,
    durationUnit
  );

  const subtotal =
    subscriptionType && numberOfDeliveries > 0
      ? items.reduce(
          (sum, it) => sum + it.price * it.quantity * numberOfDeliveries,
          0
        )
      : items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const discountPercent = subscriptionType
    ? SUBSCRIPTION_DISCOUNTS[subscriptionType] || 0
    : 0;

  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedSubtotal = subtotal - discountAmount;

  const platformFee =
    discountedSubtotal > 0 && discountedSubtotal < 100 ? 20 : 0;

  const total = discountedSubtotal + platformFee;

  const goToCheckout = () => {
    if (
      !subscription ||
      (Array.isArray(subscription) && subscription.length === 0)
    ) {
      toast.info("Please subscribe before checkout");
      return;
    }

    if (!isAuthenticated()) {
      toast.info("Please login to proceed with checkout");
      setTimeout(() => {
        navigate("/login", { state: { from: "/cart" } });
      }, 1500);
      return;
    }

    navigate("/checkout-details", {
      state: {
        subscriptions: Array.isArray(subscription)
          ? subscription
          : [subscription],
      },
    });
  };

  const clearSubscription = async () => {
    try {
      await axios.delete("/subscription-draft/clear");
      setSubscription(null);
      toast.info("Subscription cleared");
    } catch {
      toast.error("Failed to clear subscription");
    }
  };

  return (
    <div className="container mt-2">
      <ToastContainer />
      <h2>Your Cart</h2>

      {items.length === 0 ? (
        <div className="alert alert-info mt-4">
          Your cart is empty. <Link to="/">Shop now</Link>
        </div>
      ) : (
        <div className="row mt-4">
          <div className="col-lg-8">
            <div className="list-group">
              {items.map((it) => {
                const productId =
                  it.product?._id || it.product?.id || it._id || it.id;
                const productPrice = it.price || it.product?.price || 0;
                const productQuantity = it.quantity || 1;
                const lineTotal = productPrice * productQuantity;

                return (
                  <div key={productId} className="list-group-item">
                    <div className="d-flex gap-3">
                      <img
                        src={`${it.imageUrl}`}
                        alt={it.name || it.product?.name || "Product"}
                        style={{ width: 90, height: 90, objectFit: "contain" }}
                      />

                      <div className="flex-grow-1">
                        <h6>
                          {it.name || it.product?.name || "Unknown Product"}
                        </h6>
                        <div className="small text-muted">
                          ₹{it.price || it.product?.price || 0} ×{" "}
                          {it.quantity || 1}
                        </div>

                        <div className="fw-semibold">
                          ₹{lineTotal.toFixed(2)}
                        </div>

                        {/* <div className="d-flex gap-2 mt-2 ">
                          <div className="input-group input-group-sm w-25">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => decrementProduct(productId)}
                            >
                              −
                            </button>
                            <input
                              className="form-control text-center"
                              value={it.quantity}
                              readOnly
                            />
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => incrementProduct(productId)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteFromCart(productId)}
                          >
                            Remove
                          </button>
                        </div> */}

                        <div className="mt-2">
                          <div className="d-none d-sm-flex align-items-center gap-2">
                            <div
                              className="input-group input-group-sm"
                              style={{ width: 110 }}
                            >
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => decrementProduct(productId)}
                              >
                                −
                              </button>
                              <input
                                className="form-control text-center"
                                value={it.quantity}
                                readOnly
                              />
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => incrementProduct(productId)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteFromCart(productId)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="d-flex d-sm-none flex-column gap-2">
                            <div className="input-group input-group-sm w-75">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => decrementProduct(productId)}
                              >
                                −
                              </button>
                              <input
                                className="form-control text-center"
                                value={it.quantity}
                                readOnly
                              />
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => incrementProduct(productId)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              className="btn btn-sm btn-outline-danger w-75"
                              onClick={() => deleteFromCart(productId)}
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-3">Order Summary</h5>

                {items.map((it) => {
                  const productName =
                    it.name || it.product?.name || "Unknown Product";
                  const productPrice = it.price || it.product?.price || 0;
                  const productQuantity = it.quantity || 1;

                  return (
                    <div
                      key={it.product?._id || it.product?.id || it._id || it.id}
                      className="d-flex justify-content-between small mb-1"
                    >
                      <span>
                        {productName} × {productQuantity}
                      </span>
                      <span>
                        ₹{(productPrice * productQuantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                <hr />

                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {subscriptionType && numberOfDeliveries > 0 && (
                  <div className="d-flex justify-content-between text-muted small mb-2">
                    <span>Deliveries</span>
                    <span>
                      {numberOfDeliveries}{" "}
                      {numberOfDeliveries === 1 ? "delivery" : "deliveries"}
                    </span>
                  </div>
                )}

                <div
                  className={`d-flex justify-content-between ${
                    discountPercent > 0 ? "text-success" : ""
                  }`}
                >
                  <span>
                    Discount
                    {subscriptionType && (
                      <span className="text-muted small">
                        {" "}
                        ({SUBSCRIPTION_LABELS[subscriptionType]})
                      </span>
                    )}
                    {discountPercent > 0 && ` (${discountPercent}%)`}
                  </span>
                  <span>
                    {discountAmount > 0
                      ? `-₹${discountAmount.toFixed(2)}`
                      : "₹0.00"}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-muted small">
                    <span>After Discount</span>
                    <span>₹{discountedSubtotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <span>Platform Fee</span>
                  <span>{platformFee > 0 ? `₹${platformFee}` : "Free"}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <button
                  className="btn btn-danger w-100"
                  onClick={() => {
                    if (!isAuthenticated()) {
                      toast.info(
                        "Please login to subscribe to your cart items"
                      );
                      setTimeout(() => {
                        navigate("/login", { state: { from: "/cart" } });
                      }, 1500);
                    } else {
                      setShowSubModal(true);
                    }
                  }}
                >
                  {subscription ? "Change Subscription" : "Subscribe"}
                </button>

                {subscription && (
                  <button
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={clearSubscription}
                  >
                    Clear Subscription
                  </button>
                )}

                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={goToCheckout}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartSubscriptionModal
        show={showSubModal}
        cartItems={items}
        onClose={() => setShowSubModal(false)}
        onConfirm={async (subscriptions) => {
          if (isAuthenticated()) {
            try {
              await axios.post("/subscription-draft/save", { subscriptions });
              setSubscription(subscriptions);
              toast.success("Subscription applied");
            } catch {
              toast.error("Failed to save subscription");
            }
          } else {
            try {
              localStorage.setItem(
                "guestSubscriptionDraft",
                JSON.stringify(subscriptions)
              );
              setSubscription(subscriptions);
              toast.success("Subscription applied");
            } catch (e) {
              console.error("Failed to save subscription draft", e);
              toast.error("Failed to save subscription");
            }
          }
          setShowSubModal(false);
        }}
      />
    </div>
  );
}
