import React, { useEffect, useState } from "react";
import api from "../api";


const formatDate = (raw) => {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
};

 
const shortId = (id) => {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
};

 
function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const amount = typeof order.amount === "number" && order.amount > 10000
    ? (order.amount / 100).toFixed(2)
    : (Number(order.amount || 0).toFixed(2));

  const items = Array.isArray(order.items) ? order.items : [];
  const subscriptions = Array.isArray(order.subscriptions) ? order.subscriptions : [];

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.4)", zIndex: 2000 }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Order: {order._id}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div><strong>Status:</strong> {order.status || "—"}</div>
                {order.razorpayPaymentId && <div><strong>Payment ID:</strong> {order.razorpayPaymentId}</div>}
              </div>
              <div className="text-end">
                <div className="h5 mb-1">₹{amount}</div>
                <div className="small text-muted">{order.currency || "INR"}</div>
              </div>
            </div>

            <hr />

            <h6 className="mb-3">Items</h6>
            {items.length ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Product Name</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => {
                      const name = it.name || it.productName || it.product?.name || "Item";
                      const qty = it.quantity ?? it.qty ?? 1;
                      const price = it.price ?? it.unitPrice ?? it.product?.price ?? 0;
                      const total = qty * price;
                      return (
                        <tr key={i}>
                          <td>{name}</td>
                          <td className="text-center">{qty}</td>
                          <td className="text-end">₹{Number(price).toFixed(2)}</td>
                          <td className="text-end">₹{Number(total).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted">No items available</div>
            )}

            {order.address && (
              <>
                <hr />
                <h6>Delivery Address</h6>
                <div className="small text-muted">
                  {order.address.name && <div>{order.address.name}</div>}
                  {order.address.line1 && <div>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</div>}
                  {(order.address.city || order.address.state || order.address.pincode) && (
                    <div>
                      {order.address.city || ""}{order.address.state ? `, ${order.address.state}` : ""} {order.address.pincode ? `- ${order.address.pincode}` : ""}
                    </div>
                  )}
                  {order.address.phone && <div>{order.address.phone}</div>}
                </div>
              </>
            )}

            {subscriptions.length > 0 && (
              <>
                <hr />
                <h6 className="mb-3">Subscriptions Started</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Product Name</th>
                        <th>Subscription Type</th>
                        <th className="text-center">Quantity</th>
                        <th>Status</th>
                        <th>Next Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((s, idx) => {
                        const pname = s.productName || s.product?.name || (typeof s === "string" ? s : "Subscription");
                        const subType = s.subscriptionType || s.frequency || "—";
                        const qty = s.quantity ?? 1;
                        const status = s.status || "—";
                        const nextDelivery = s.nextDeliveryDate ? formatDate(s.nextDeliveryDate): "—";
                        return (
                          <tr key={s._id || idx}>
                            <td>{pname}</td>
                            <td>{subType.charAt(0).toUpperCase() + subType.slice(1)}</td>
                            <td className="text-center">{qty}</td>
                            <td>
                              <span className={`badge ${
                                status === "active" ? "bg-success" :
                                status === "pending" ? "bg-warning" :
                                status === "paused" ? "bg-secondary" :
                                "bg-danger"
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td>{nextDelivery}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/payments/me");
        const data = res.data?.data || res.data || [];
        if (!mounted) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="container mt-5">Loading orders...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Orders</h2>

      {orders.length === 0 ? (
        <div className="alert alert-info">No orders yet</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Items</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
             <tbody>
  {orders.map((o) => {
    const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
    const amount =
      typeof o.amount === "number" && o.amount > 10000
        ? (o.amount / 100).toFixed(2)
        : Number(o.amount || 0).toFixed(2);

    return (
      <tr key={o._id}>
        <td style={{ maxWidth: 240 }}>
          <code className="text-break">{o._id}</code>
        </td>
        <td>{o.status || "—"}</td>
        <td>₹{amount}</td>
        <td>{itemsCount}</td>
        <td className="text-end">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setActiveOrder(o)}
          >
            View
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

            </table>
          </div>
 
          <div className="d-block d-md-none mt-3">
            {orders.map((o) => {
              const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
              const amount = typeof o.amount === "number" && o.amount > 10000 ? (o.amount / 100).toFixed(2) : Number(o.amount || 0).toFixed(2);
              return (
                <div key={o._id} className="card mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted">Order</div>
                      <div><code className="text-break">{shortId(o._id)}</code></div>
                    </div>
                    <div className="text-end">
                      <div>₹{amount}</div>
                      <div className="small text-muted">{itemsCount} items</div>
                      <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => setActiveOrder(o)}>View</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
 
      {activeOrder && <OrderDetailsModal order={activeOrder} onClose={() => setActiveOrder(null)} />}
    </div>
  );
}
