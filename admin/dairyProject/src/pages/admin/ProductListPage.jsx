import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
   
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    tag : "",
    rating : "",
    oldPrice: "",
    brand:"",
    stock:"",
  });
  const [createFormImage, setCreateFormImage] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    tag : "",
    rating : "",
    oldPrice: "",
    brand:"",
    stock:"",
  });
  const [productFormImage, setProductFormImage] = useState(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAdminStore();
 
  }, []);

  const fetchAdminStore = async () => {
    try {
      setLoading(true);
      setErr("");

      const storeRes = await fetch(`${BASE_URL}/stores/my-store`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const storeJson = await storeRes.json();

      if (!storeRes.ok) {
        if (storeRes.status === 404) {
          setErr("You don't have a store yet. Please create a store first.");
          setLoading(false);
          return;
        }
        throw new Error(storeJson.message || "Failed to fetch store");
      }

      const adminStoreId = storeJson.data?.store?._id;
      if (!adminStoreId) {
        setErr("Store ID not found");
        setLoading(false);
        return;
      }

      localStorage.setItem("storeId", adminStoreId);
      setStoreId(adminStoreId);

      await Promise.all([fetchProducts(adminStoreId), fetchCategories(adminStoreId)]);

      setLoading(false);
    } catch (err) {
      setErr(err.message);
      setLoading(false);
    }
  };

  const fetchProducts = async (id) => {
    const res = await fetch(`${BASE_URL}/products`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || "Failed to fetch products");

    const storeProducts = (json.data || []).filter((p) => {
      const productStoreId = p.store?._id || p.store;
      return productStoreId === id || productStoreId?.toString() === id;
    });
    setProducts(storeProducts);
  };

  const fetchCategories = async (id) => {
    const res = await fetch(`${BASE_URL}/categories/${id}`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || "Failed to fetch categories");

    setCategories(json.data || []);
  };

  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
    if (showCreateForm) {
      resetCreateForm();
    }
  };

  const resetCreateForm = () => {
    setCreateForm({ name: "", price: "", description: "", categoryId: "",tag : "",
      rating : "",
      oldPrice: "",
      brand:"",
      stock:"",});
    setCreateFormImage(null);
    setCreating(false);
  };
  

  const onCreateChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setCreateFormImage(files[0]);
    } else {
      setCreateForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!storeId) {
      setErr("No storeId found. Please create a store first.");
      return;
    }

    if (!createFormImage) {
      setErr("Please select a product image");
      return;
    }

    setCreating(true);
    setMsg("");
    setErr("");

    try {
      const formData = new FormData();
      formData.append("imageUrl", createFormImage);
      formData.append("name", createForm.name);
      formData.append("price", createForm.price);
      formData.append("description", createForm.description);
      formData.append("storeId", storeId);
      formData.append("categoryId", createForm.categoryId);
      formData.append("tag", createForm.tag);
      formData.append("rating", createForm.rating);
      formData.append("oldPrice", createForm.oldPrice);
      formData.append("brand", createForm.brand);
      formData.append("stock", createForm.stock);

      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create product");

      setMsg(data.message || "Product created");
      resetCreateForm();
      setShowCreateForm(false);
      await fetchProducts(storeId);
    } catch (error) {
      setErr(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      price: product.price || "",
      description: product.description || "",
      categoryId: product.category?._id || product.category || "",
      tag : product.tag || "",
      rating : product.rating || "",
      oldPrice : product.oldPrice || "",
      brand : product.brand || "",
      stock : product.stock || "",
    });
    setProductFormImage(null);
    setMsg("");
    setErr("");
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setProductForm({ name: "", price: "", description: "", categoryId: "",tag:"",rating:"",oldPrice:"",brand:"",stock:"" });
    setProductFormImage(null);
  };

  const onProductChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setProductFormImage(files[0]);
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProduct = async (e) => {
  e.preventDefault();
  if (!editingProduct) return;

  setMsg("");
  setErr("");

  try {
    const formData = new FormData();

    formData.append("name", productForm.name);
    formData.append("price", productForm.price);
    formData.append("description", productForm.description);
    formData.append("categoryId", productForm.categoryId);
    formData.append("tag", productForm.tag);
    formData.append("rating", productForm.rating);
    formData.append("oldPrice", productForm.oldPrice);
    formData.append("brand", productForm.brand);
    formData.append("stock", productForm.stock);

 
    if (productFormImage) {
      formData.append("imageUrl", productFormImage);
    }

    const res = await fetch(`${BASE_URL}/products/${editingProduct._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,  
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update product");

    setMsg("Product updated successfully");
    setEditingProduct(null);
    await fetchProducts(storeId);
  } catch (err) {
    setErr(err.message);
  }
};


  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
    setMsg("");
    setErr("");
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    setMsg("");
    setErr("");

    try {
      const res = await fetch(`${BASE_URL}/products/${productToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");

      setMsg(data.message || "Product deleted successfully");
      setShowDeleteDialog(false);
      setProductToDelete(null);
      await fetchProducts(storeId);
    } catch (err) {
      setErr(err.message);
    } finally {
      setDeleting(false);
    }
  };
 
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid ">
      <div className="d-flex flex-row flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
        <h3 className="h4 h-md-3 mb-0">Product List</h3>
       
        <button
  className="btn btn-primary btn-sm"
  onClick={() => setShowCreateForm(true)}
  disabled={!storeId}
>
  Create Product
</button>

      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && !showDeleteDialog && <div className="alert alert-danger">{err}</div>}

      {currentProducts.length === 0 ? (
        <div className="alert alert-info mt-3">No products found. Create products to see them listed here.</div>
      ) : (
        <>
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th className="d-none d-md-table-cell">Name</th>
                  <th>Price</th>
                  <th className="d-none d-lg-table-cell">Description</th>
                  <th className="d-none d-md-table-cell">Category</th>
                  <th className="d-none d-xl-table-cell">Tag</th>
                  <th className="d-none d-xl-table-cell">Rating</th>
                  <th className="d-none d-xl-table-cell">Old Price</th>
                  <th className="d-none d-lg-table-cell">Brand</th>
                  <th className="d-none d-md-table-cell">Stock</th>
                  <th>Image</th>
                  <th style={{ minWidth: "120px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentProducts.map((p) => (
                  <tr key={p._id}>
                    <td className="d-none d-md-table-cell">{p.name}</td>
                    <td>
                      <div className="d-md-none fw-bold mb-1">{p.name}</div>
                      ₹{p.price}
                    </td>
                    <td className="d-none d-lg-table-cell">{p.description ? (p.description.length > 50 ? p.description.substring(0, 50) + "..." : p.description) : "-"}</td>
                    <td className="d-none d-md-table-cell">{p.category?.name || "-"}</td>
                    <td className="d-none d-xl-table-cell">{p.tag || "-"}</td>
                    <td className="d-none d-xl-table-cell">{p.rating || "-"}</td>
                    <td className="d-none d-xl-table-cell">{p.oldPrice || "-"}</td>
                    <td className="d-none d-lg-table-cell">{p.brand || "-"}</td>
                    <td className="d-none d-md-table-cell">{p.stock || "-"}</td>
                    <td>
                      {p.imageUrl ? (
                        <img 
                          src={`${BASE_URL}${p.imageUrl}`} 
                          alt={p.name} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                          className="rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-column flex-sm-row gap-1 gap-sm-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(p)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteDialog(p)}>
                          Delete
                        </button>
                      </div>
                    </td>
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
        </>
      )}

      {/* {editingProduct && (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Edit Product</h5>

            <form onSubmit={handleUpdateProduct}>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" name="name" value={productForm.name} onChange={onProductChange} required />
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Price</label>
                  <input className="form-control" name="price" type="number" step="0.01" value={productForm.price} onChange={onProductChange} required />
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Tag</label>
                  <input className="form-control" name="tag" value={productForm.tag} onChange={onProductChange} required />
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Rating</label>
                  <input className="form-control" name="rating" type="number" step="0.01" value={productForm.rating} onChange={onProductChange} required />
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Brand</label>
                  <input className="form-control" name="brand" value={productForm.brand} onChange={onProductChange} required />
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Stock</label>
                  <input className="form-control" name="stock" type="number" step="0.01" value={productForm.stock} onChange={onProductChange} required />
                </div>
              </div>
              <div className=" mb-3">
                  <label className="form-label">Old Price</label>
                  <input className="form-control" name="oldPrice" type="number" step="0.01" value={productForm.oldPrice} onChange={onProductChange} required />
                </div>

                 <div className=" mb-3">
                  <label className="form-label">Product Image</label>
                  <input 
                    className="form-control" 
                    name="imageUrl" 
                    type="file" 
                    accept="image/*"
                    onChange={onProductChange}
                  />
                  {productFormImage && (
                    <small className="text-muted">New file: {productFormImage.name}</small>
                  )}
                  {!productFormImage && editingProduct?.imageUrl && (
                    <small className="text-muted">Current: {editingProduct.imageUrl}</small>
                  )}
                </div>

 
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows={3} value={productForm.description} onChange={onProductChange} />
              </div>

             

<div className="mb-3">
  <label className="form-label">Category</label>
  <select
    className="form-select"
    name="categoryId"
    value={productForm.categoryId}
    onChange={onProductChange}
    required
  >
    <option value="">Select category</option>

    {categories
      .filter((cat) => {
        // allow only categories belonging to the same store
        const catStoreId = cat.store?._id || cat.store;
        return catStoreId === storeId;
      })
      .map((category) => (
        <option key={category._id} value={category._id}>
          {category.name}
        </option>
      ))}
  </select>
</div>


              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">
                  Update Product
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

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
                Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
              </p>

              {err && <div className="alert alert-danger">{err}</div>}

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary" onClick={cancelDelete} disabled={deleting}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDeleteProduct} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {showCreateForm && (
  <>
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
 
          <div className="modal-header">
            <h5 className="modal-title">Create Product</h5>
            <button
  className="btn-close"
  onClick={() => {
    resetCreateForm();
    setShowCreateForm(false);
  }}
/>

          </div>
 
          <form onSubmit={handleCreateProduct}>
            <div className="modal-body"
           
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={createForm.name}
                    onChange={onCreateChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Price</label>
                  <input
                    className="form-control"
                    name="price"
                    type="number"
                    value={createForm.price}
                    onChange={onCreateChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Tag</label>
                  <input
                    className="form-control"
                    name="tag"
                    value={createForm.tag}
                    onChange={onCreateChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Rating</label>
                  <input
                    className="form-control"
                    name="rating"
                    type="number"
                    value={createForm.rating}
                    onChange={onCreateChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Old Price</label>
                  <input
                    className="form-control"
                    name="oldPrice"
                    type="number"
                    value={createForm.oldPrice}
                    onChange={onCreateChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Stock</label>
                  <input
                    className="form-control"
                    name="stock"
                    type="number"
                    value={createForm.stock}
                    onChange={onCreateChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-control"
                    name="brand"
                    value={createForm.brand}
                    onChange={onCreateChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Product Image</label>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    onChange={onCreateChange}
                    required
                  />
                  {createFormImage && (
                    <small className="text-muted">
                      Selected: {createFormImage.name}
                    </small>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows={3}
                    value={createForm.description}
                    onChange={onCreateChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="categoryId"
                    value={createForm.categoryId}
                    onChange={onCreateChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {err && <div className="alert alert-danger mt-3">{err}</div>}
              {msg && <div className="alert alert-success mt-3">{msg}</div>}
            </div>
 
            <div className="modal-footer">
             <button
  type="button"
  className="btn btn-secondary btn-sm"
  onClick={() => {
    resetCreateForm();
    setShowCreateForm(false);
  }}
>
  Cancel
</button>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
 
    <div className="modal-backdrop fade show"></div>
  </>
)}
{editingProduct && (
  <>
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxHeight: "90vh" }}>
        <div className="modal-content">

           
          <div className="modal-header">
            <h5 className="modal-title">Edit Product</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancelEdit}
            />
          </div>

          <form onSubmit={handleUpdateProduct}>
         
            <div className="modal-body overflow-auto" style={{ maxHeight: "65vh" }}>
              <div className="row g-3">

           
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={productForm.name}
                    onChange={onProductChange}
                    required
                  />
                </div>
 
                <div className="col-md-6">
                  <label className="form-label">Price</label>
                  <input
                    className="form-control"
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={onProductChange}
                    required
                  />
                </div>
 
                <div className="col-md-6">
                  <label className="form-label">Old Price</label>
                  <input
                    className="form-control"
                    type="number"
                    name="oldPrice"
                    value={productForm.oldPrice}
                    onChange={onProductChange}
                  />
                </div>
 
                <div className="col-md-6">
                  <label className="form-label">Rating</label>
                  <input
                    className="form-control"
                    type="number"
                    step="0.1"
                    name="rating"
                    value={productForm.rating}
                    onChange={onProductChange}
                  />
                </div>
 
                <div className="col-md-6">
                  <label className="form-label">Tag</label>
                  <input
                    className="form-control"
                    name="tag"
                    value={productForm.tag}
                    onChange={onProductChange}
                  />
                </div>

   
                <div className="col-md-6">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-control"
                    name="brand"
                    value={productForm.brand}
                    onChange={onProductChange}
                  />
                </div>
 
                <div className="col-md-6">
                  <label className="form-label">Stock</label>
                  <input
                    className="form-control"
                    type="number"
                    name="stock"
                    value={productForm.stock}
                    onChange={onProductChange}
                  />
                </div>
 
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={onProductChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((cat) => {
                        const catStoreId = cat.store?._id || cat.store;
                        return catStoreId === storeId;
                      })
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
 
                <div className="col-12">
                  <label className="form-label">Product Image</label>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    onChange={onProductChange}
                  />
                  {!productFormImage && (
                    <small className="text-muted">
                      Current: {editingProduct.imageUrl}
                    </small>
                  )}
                </div>
 
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="description"
                    value={productForm.description}
                    onChange={onProductChange}
                  />
                </div>

              </div>
            </div>
 
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Update Product
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