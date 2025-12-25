import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  
 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const storeId = localStorage.getItem("storeId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!storeId) {
      setErr("No storeId found. Please create a store first.");
      setLoading(false);
      return;
    }

    fetchCategories();
  }, [storeId, token]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/categories/${storeId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      setCategories(data.data || []);
      setErr("");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) {
      resetForm();
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditingCategory(null);
    setSaving(false);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId) return;

    setSaving(true);
    setMsg("");
    setErr("");

    try {
      const method = editingCategory ? "PUT" : "POST";
      const url = editingCategory
        ? `${BASE_URL}/categories/${editingCategory._id}`
        : `${BASE_URL}/categories`;

      const payload = editingCategory
        ? { name: form.name, description: form.description }
        : { ...form, storeId };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save category");
      }

      setMsg(data.message || "Category saved");
      resetForm();
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
    setShowForm(true);
  };

  const openDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
    setMsg("");
    setErr("");
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    setMsg("");
    setErr("");

    try {
      const res = await fetch(`${BASE_URL}/categories/${categoryToDelete._id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      setMsg(data.message || "Category deleted");
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (error) {
      setErr(error.message);
    } finally {
      setDeleting(false);
    }
  };
 
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="d-flex flex-row flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
        <h3 className="h4 h-md-3 mb-0">Categories</h3>
        <button
  className="btn btn-primary btn-sm"
  onClick={() => setShowForm(true)}
>
  Create Category
</button>

      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && !showDeleteDialog && <div className="alert alert-danger">{err}</div>}

      {loading ? (
        <div className="text-center py-5">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="alert alert-info">No categories found. Create your first category.</div>
      ) : (
        <>
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered mb-0 table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th className="d-none d-md-table-cell">Description</th>
                      <th style={{ minWidth: "140px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategories.map((category) => (
                      <tr key={category._id}>
                        <td>
                          <div className="fw-bold">{category.name}</div>
                          <div className="d-md-none small text-muted mt-1">{category.description || "-"}</div>
                        </td>
                        <td className="d-none d-md-table-cell">{category.description || "-"}</td>
                        <td>
                          <div className="d-flex flex-column flex-sm-row gap-1 gap-sm-2">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(category)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteDialog(category)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
        </>
      )}

      {showDeleteDialog && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 1040,
            }}
            onClick={cancelDelete}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="card"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1050,
              minWidth: 320,
              maxWidth: "90%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div className="card-body">
              <h5 className="card-title">Confirm delete</h5>
              <p className="card-text">
                Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
              </p>

              {err && <div className="alert alert-danger">{err}</div>}

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary" onClick={cancelDelete} disabled={deleting}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDeleteCategory} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

          </div>
        </>
      )}
      {showForm && (
  <>
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content">
 
          <div className="modal-header">
            <h5 className="modal-title">Create Category</h5>
            <button
              className="btn-close"
              onClick={() => setShowForm(false)}
            />
          </div>
 
          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label">Category Name</label>
                <input
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={onChange}
                />
              </div>

              {err && <div className="alert alert-danger">{err}</div>}
              {msg && <div className="alert alert-success">{msg}</div>}
            </div>
 
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
 
    <div className="modal-backdrop fade show"></div>
  </>
)}

    </div>
  );
}