import React, { useEffect, useState } from "react";
 
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function apiGet(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Accept": "application/json"
    },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || json?.error || res.statusText || "Network error");
  return json?.data !== undefined ? json.data : json;
}

async function apiPost(path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || json?.error || res.statusText || "Network error");
  return json?.data !== undefined ? json.data : json;
}

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
   
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/delivery-partners");
      setPartners(Array.isArray(data) ? data : (data?.partners || []));
    } catch (err) {
      console.error("fetchPartners:", err);
      alert("Failed to fetch partners: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e?.preventDefault();
    if (!form.name?.trim()) return alert("Name is required");
    setCreating(true);
    try {
      await apiPost("/delivery-partners", {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setForm({ name: "", phone: "", email: "", notes: "" });
      setShowForm(false);
      await fetchPartners();
    } catch (err) {
      console.error("create partner err:", err);
      alert("Create failed: " + (err.message || ""));
    } finally {
      setCreating(false);
    }
  };
 
  const totalPages = Math.ceil(partners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPartners = partners.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container-fluid mt-2 mt-md-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
        <h3 className="h4 h-md-3 mb-0">Delivery Partners</h3>
        <div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "Create Delivery Partner"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="row g-2">
                <div className="col-md-4">
                  <label className="form-label">Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} onChange={handleChange} className="form-control" />
                </div>
              </div>

              {/* <div className="mt-2">
                <label className="form-label">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} className="form-control" rows={2} />
              </div> */}

              <div className="mt-3">
                <button className="btn btn-success" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped align-middle table-sm">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th className="d-none d-md-table-cell">Phone</th>
              <th className="d-none d-lg-table-cell">Email</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
            )}

            {!loading && currentPartners.length === 0 && (
              <tr><td colSpan={3} className="text-center text-muted py-4">No delivery partners found</td></tr>
            )}

            {!loading && currentPartners.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="fw-bold">{p.name}</div>
                  <div className="d-md-none small text-muted mt-1">
                    {p.phone && <div>Phone: {p.phone}</div>}
                    {p.email && <div>Email: {p.email}</div>}
                  </div>
                </td>
                <td className="d-none d-md-table-cell">{p.phone || "-"}</td>
                <td className="d-none d-lg-table-cell">{p.email || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <li
                  key={num}
                  className={`page-item ${currentPage === num ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(num)}
                  >
                    {num}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}