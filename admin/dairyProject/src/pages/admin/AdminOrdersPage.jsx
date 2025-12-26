import React, { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiGet(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let json;
  try {
    json = await res.json();
  } catch (err) {
    if (!res.ok) throw new Error(res.statusText || "Network error");
    return null;
  }

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Something went wrong");
  }

  return json?.data !== undefined ? json.data : json;
}

async function apiPut(path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  let json;
  try {
    json = await res.json();
  } catch (err) {
    if (!res.ok) throw new Error(res.statusText || "Network error");
    return null;
  }

  if (!res.ok) {
    throw new Error(json?.message || json?.error || "Something went wrong");
  }

  return json?.data !== undefined ? json.data : json;
}

export default function AdminOrdersPage() {
  const [allSubs, setAllSubs] = useState([]); 
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
 
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);  
  const [searchTerm, setSearchTerm] = useState(""); 

  const ORDERS_PATH = "/payments/admin/orders";
  const PARTNERS_PATH = "/delivery-partners";
  const ASSIGN_ORDER_PATH = "/payments/admin/assign-order";

  const fetchAll = async () => {
    try {
      setLoading(true);
 
      const [ordersData, partnersData] = await Promise.all([
        apiGet(ORDERS_PATH),
        apiGet(PARTNERS_PATH),
      ]);
 
      const orders = Array.isArray(ordersData)
        ? ordersData
        : ordersData?.orders || ordersData?.data || [];

      setAllSubs(Array.isArray(orders) ? orders : []);
      setPartners(Array.isArray(partnersData) ? partnersData : (partnersData?.partners || partnersData || []));
    } catch (err) {
      console.error("fetchAll error:", err);
      alert("Failed to fetch orders or partners: " + (err.message || ""));
      setAllSubs([]);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
 
  }, []);

  const handleAssign = async (paymentId, partnerId) => {
    if (!paymentId) return;
    setAssigning((p) => ({ ...p, [paymentId]: true }));
    try {
      await apiPut(`${ASSIGN_ORDER_PATH}/${paymentId}`, { partnerId: partnerId || null });
      await fetchAll();
    } catch (err) {
      console.error("assign error:", err);
      alert("Assign failed: " + (err.message || ""));
    } finally {
      setAssigning((p) => ({ ...p, [paymentId]: false }));
    }
  };
 
  const filtered = allSubs.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const orderId = order._id?.toString().slice(-8) || "";
    const userEmail = order.user?.email || "";
    const userName = order.user?.name || "";
 
    const productMatch = (order.subscriptions || []).some((sub) => 
      (sub.product?.name || sub.productName || "").toLowerCase().includes(term)
    );
    return (
      userName.toLowerCase().includes(term) ||
      userEmail.toLowerCase().includes(term) ||
      orderId.toLowerCase().includes(term) ||
      productMatch
    );
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = pageStart + rowsPerPage;
  const subsOnPage = filtered.slice(pageStart, pageEnd);

  const goToPage = (p) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container-fluid ">
      <h3 className="h4 h-md-3 mb-3">Subscriptions / Orders</h3>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
        <div className="text-muted small">
          {total} orders · {partners.length} delivery partners
        </div>

        {/* <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center w-100 w-md-auto">
          <input
            type="search"
            placeholder="Search product"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="form-control form-control-sm"
            style={{ minWidth: "200px" }}
          />

          <select
            className="form-select form-select-sm"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            style={{ minWidth: "120px" }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
            <option value={total}>All</option>
          </select>
        </div> */}
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle table-sm">
          <thead className="table-light">
            <tr>
              <th className="d-none d-md-table-cell">Order #</th>
              <th>User</th>
              <th>Products</th>
              <th className="d-none d-lg-table-cell">Frequency</th>
              <th className="d-none d-md-table-cell">Next Delivery</th>
              <th className="d-none d-lg-table-cell">Delivery Partner</th>
              <th style={{ minWidth: "180px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {subsOnPage.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">No orders found</td>
              </tr>
            )}

            {subsOnPage.map((order) => {
              const subscriptions = order.subscriptions || [];
              const firstSub = subscriptions[0];
              const subscriptionType = firstSub?.subscriptionType || order.subscriptionType || "—";
              const frequencyLabel = subscriptionType === "daily" ? "Daily" :
                                    subscriptionType === "alternate" ? "Alternate Days" :
                                    subscriptionType === "weekly" ? "Weekly" :
                                    subscriptionType === "monthly" ? "Monthly" : subscriptionType;
              
           
              const deliveryPartner = firstSub?.deliveryPartner;
              
           
              const nextDeliveryDates = subscriptions
                .map(s => s.nextDeliveryDate ? new Date(s.nextDeliveryDate) : null)
                .filter(d => d !== null)
                .sort((a, b) => a - b);
              const nextDelivery = nextDeliveryDates.length > 0 
                ? nextDeliveryDates[0].toLocaleDateString() 
                : "-";

              return (
                <tr key={order._id}>
                  <td className="d-none d-md-table-cell">{order._id ? order._id.toString().slice(-8) : "—"}</td>

                  <td>
                    <div className="d-md-none small text-muted mb-1">Order #{order._id ? order._id.toString().slice(-8) : "—"}</div>
                    <div style={{ maxWidth: 200 }}>
                      {order.user?.name && <div className="small">{order.user.name}</div>}
                      <small className="text-muted d-block">{order.user?.email || "N/A"}</small>
                    </div>
                  </td>

                  <td>
                    <div style={{ maxWidth: 300 }}>
                      {subscriptions.length > 0 ? (
                        <div>
                          {subscriptions.map((sub, idx) => (
                            <div key={sub._id || idx} className="d-flex align-items-center gap-2 mb-2">
                              <img
                                src={`${sub.product.imageUrl}`} 
                                alt={sub.product?.name || sub.productName || "Product"}
                                style={{ width: 35, height: 35, objectFit: "cover", borderRadius: 4 }}
                              />
                              <div>
                                <div style={{ fontSize: 12 }}>
                                  {sub.product?.name || sub.productName} × {sub.quantity || 1}
                                </div>
                                <small className="text-muted">
                                  ₹{Number(sub.unitPrice || sub.product?.price || 0).toFixed(2)}/unit
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No products</span>
                      )}
                    </div>
                    <div className="d-md-none mt-2">
                      <small className="text-muted">Freq: {frequencyLabel}</small>
                      {deliveryPartner?.name && (
                        <div className="small text-muted">Partner: {deliveryPartner.name}</div>
                      )}
                    </div>
                  </td>

                  <td className="d-none d-lg-table-cell">{frequencyLabel}</td>
                  <td className="d-none d-md-table-cell">{nextDelivery}</td>
                  <td className="d-none d-lg-table-cell">{deliveryPartner?.name || "-"}</td>

                  <td>
                    <div className="d-flex gap-1 align-items-center">
                      <select
                        className="form-select form-select-sm"
                        value={deliveryPartner?._id || ""}
                        onChange={(e) => handleAssign(order._id, e.target.value || null)}
                        disabled={!!assigning[order._id]}
                        style={{ minWidth: "140px", fontSize: "0.75rem" }}
                      >
                        <option value="">-- assign --</option>
                        {partners.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
 
      <div className="d-flex justify-content-center align-items-center mt-3 flex-wrap gap-2">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>
 
        <div className="btn-group" role="group" aria-label="pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={`page-${p}`}
              className={`btn btn-sm ${p === currentPage ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

