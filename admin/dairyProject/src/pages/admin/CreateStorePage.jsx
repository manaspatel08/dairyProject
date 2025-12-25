import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CreateStorePage() {
  const token = localStorage.getItem("token");
  
  const [form, setForm] = useState({
    Store_Name: "",
    Store_Adress: "",
    Store_contactNo: "",
    Store_bank_account_no: "",
    store_ifsc_code: "",
  });

  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState(null);
  

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "", description: "", categoryId: "",tag:"",rating:"",oldPrice:"",brand:"",stock:"" });
  const [productFormImage, setProductFormImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryMessage, setCategoryMessage] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [categoryErr, setCategoryErr] = useState("");
  const [productErr, setProductErr] = useState("");
 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const savedStoreId = localStorage.getItem("storeId");
    if (savedStoreId) {
      setStoreId(savedStoreId);
      fetchCategories(savedStoreId);
      fetchProducts(savedStoreId);
    }
  }, []);

  const fetchCategories = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/categories/${id}`);
      const json = await res.json();
      if (json.data) {
        setCategories(json.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/products`);
      const json = await res.json();
      if (json.data) {
        const storeProducts = json.data.filter(p => {
          const storeId = p.store?._id || p.store;
          return storeId === id || storeId?.toString() === id;
        });
        setProducts(storeProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onCategoryChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const onProductChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setProductFormImage(files[0]);
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/stores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Something went wrong");
      }

      const store = json.data?.store;
      const newStoreId = store?._id;

      if (newStoreId) {
        localStorage.setItem("storeId", newStoreId);
        setStoreId(newStoreId);
        setStoreData(store);
        fetchCategories(newStoreId);
      }

      setMessage("Store created successfully!");
    } catch (err) {
      setErr(err.message);
    }
    
    setLoading(false);
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setCategoryMessage("");
    setCategoryErr("");

    try {
      const res = await fetch(`${BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description,
          storeId: storeId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Something went wrong");
      }

      setCategoryMessage("Category created successfully!");
      setCategoryForm({ name: "", description: "" });
      setShowAddCategory(false);
      fetchCategories(storeId);
    } catch (err) {
      setCategoryErr(err.message);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setProductMessage("");
    setProductErr("");

    if (!productForm.categoryId) {
      setProductErr("Please select a category");
      return;
    }

    if (!productFormImage) {
      setProductErr("Please select a product image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("imageUrl", productFormImage);
      formData.append("name", productForm.name);
      formData.append("price", productForm.price);
      formData.append("description", productForm.description);
      formData.append("storeId", storeId);
      formData.append("categoryId", productForm.categoryId);
      formData.append("tag", productForm.tag);
      formData.append("rating", productForm.rating);
      formData.append("oldPrice", productForm.oldPrice);
      formData.append("brand", productForm.brand);
      formData.append("stock", productForm.stock);

      const res = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Something went wrong");
      }

      setProductMessage("Product created successfully!");
      setProductForm({ name: "", price: "", description: "", categoryId: "" , tag:"",rating:"",oldPrice:"",brand:"",stock:""});
      setProductFormImage(null);
      fetchProducts(storeId);
    } catch (err) {
      setProductErr(err.message);
    }
  };
 
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container-fluid mt-2 mt-md-4">
      <div className="card shadow p-3 p-md-4 mx-auto">
        <h3 className="h4 h-md-3 text-center mb-3">Create Store</h3>

        {!storeId ? (
          <form onSubmit={submit} className="mt-3">
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Store Name</label>
                <input 
                  name="Store_Name" 
                  className="form-control" 
                  onChange={onChange}
                  value={form.Store_Name}
                  required
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Store Address</label>
                <input 
                  name="Store_Adress" 
                  className="form-control" 
                  onChange={onChange}
                  value={form.Store_Adress}
                  required
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Store Contact Number</label>
                <input 
                  name="Store_contactNo" 
                  className="form-control" 
                  onChange={onChange}
                  value={form.Store_contactNo}
                  required
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Bank Account Number</label>
                <input 
                  name="Store_bank_account_no" 
                  className="form-control" 
                  onChange={onChange}
                  value={form.Store_bank_account_no}
                  required
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">IFSC Code</label>
                <input 
                  name="store_ifsc_code" 
                  className="form-control" 
                  onChange={onChange}
                  value={form.store_ifsc_code}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Creating..." : "Create Store"}
            </button>
          </form>
        ) : (
          <div>
            <div className="alert alert-success">
              <h5>Store Created Successfully!</h5>
              <p>Store ID: {storeId}</p>
            </div>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Add Products to Your Store</h5>
               <button
  className="btn btn-success"
  onClick={() => setShowAddProduct(true)}
>
  Add Product
</button>

              </div>

              {currentProducts.length > 0 && (
                <div className="mt-4">
                  <h5 className="h6 h-md-5 mb-3">Products in Store</h5>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Price</th>
                          <th className="d-none d-lg-table-cell">Description</th>
                          <th className="d-none d-md-table-cell">Category</th>
                          <th className="d-none d-xl-table-cell">Tag</th>
                          <th className="d-none d-xl-table-cell">Rating</th>
                          <th className="d-none d-lg-table-cell">Brand</th>
                          <th className="d-none d-xl-table-cell">Old Price</th>
                          <th className="d-none d-md-table-cell">Stock</th>
                          <th>Image</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProducts.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <div className="fw-bold small">{product.name}</div>
                              <div className="d-md-none small text-muted">Cat: {product.category?.name || "-"}</div>
                            </td>
                            <td>₹{product.price}</td>
                            <td className="d-none d-lg-table-cell">{product.description ? (product.description.length > 30 ? product.description.substring(0, 30) + "..." : product.description) : "-"}</td>
                            <td className="d-none d-md-table-cell">{product.category?.name || "-"}</td>
                            <td className="d-none d-xl-table-cell">{product.tag || "-"}</td>
                            <td className="d-none d-xl-table-cell">{product.rating || "-"}</td>
                            <td className="d-none d-lg-table-cell">{product.brand || "-"}</td>
                            <td className="d-none d-xl-table-cell">{product.oldPrice || "-"}</td>
                            <td className="d-none d-md-table-cell">{product.stock || "-"}</td>
                            <td>
                              {product.imageUrl ? (
                                <img 
                                  src={`${BASE_URL}${product.imageUrl}`} 
                                  alt={product.name} 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                  className="rounded"
                                />
                              ) : (
                                "-"
                              )}
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
                </div>
              )}
            </div>
          </div>
        )}

        {message && <p className="text-success mt-3">{message}</p>}
        {err && <p className="text-danger mt-3">{err}</p>}
      </div>
      {showAddProduct && (
  <>
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
 
          <div className="modal-header">
            <h5 className="modal-title">Create Product</h5>
            <button
              className="btn-close"
              onClick={() => setShowAddProduct(false)}
            />
          </div>
 
          <div className="modal-body">
 
            {categories.length === 0 ? (
              <div className="alert alert-warning">
                No categories found. Please create one first.
                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                  >
                    {showAddCategory ? "Cancel" : "Create Category"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-sm btn-outline-primary mb-3"
                onClick={() => setShowAddCategory(!showAddCategory)}
              >
                {showAddCategory ? "Cancel Category" : "Add New Category"}
              </button>
            )}
 
            {showAddCategory && (
              <form onSubmit={createCategory} className="border rounded p-3 mb-3">
                <h6>Create Category</h6>
                <input
                  name="name"
                  className="form-control mb-2"
                  placeholder="Category name"
                  value={categoryForm.name}
                  onChange={onCategoryChange}
                  required
                />
                <textarea
                  name="description"
                  className="form-control mb-2"
                  placeholder="Description"
                  value={categoryForm.description}
                  onChange={onCategoryChange}
                />
                <button className="btn btn-sm btn-primary">Create</button>
                {categoryMessage && <div className="text-success mt-2">{categoryMessage}</div>}
                {categoryErr && <div className="text-danger mt-2">{categoryErr}</div>}
              </form>
            )}
 
            <form onSubmit={createProduct}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label">Product Name</label>
                  <input
                    name="name"
                    className="form-control"
                    value={productForm.name}
                    onChange={onProductChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Price</label>
                  <input
                    name="price"
                    type="number"
                    className="form-control"
                    value={productForm.price}
                    onChange={onProductChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Brand</label>
                  <input
                    name="brand"
                    className="form-control"
                    value={productForm.brand}
                    onChange={onProductChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    className="form-control"
                    value={productForm.stock}
                    onChange={onProductChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Old Price</label>
                  <input
                    name="oldPrice"
                    type="number"
                    className="form-control"
                    value={productForm.oldPrice}
                    onChange={onProductChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Rating</label>
                  <input
                    name="rating"
                    type="number"
                    className="form-control"
                    value={productForm.rating}
                    onChange={onProductChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Tag</label>
                  <input
                    name="tag"
                    className="form-control"
                    value={productForm.tag}
                    onChange={onProductChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={productForm.description}
                    onChange={onProductChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select
                    name="categoryId"
                    className="form-select"
                    value={productForm.categoryId}
                    onChange={onProductChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Product Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={onProductChange}
                    required
                  />
                </div>

              </div>

              {productErr && <div className="text-danger mt-2">{productErr}</div>}
              {productMessage && <div className="text-success mt-2">{productMessage}</div>}

              <div className="modal-footer mt-3 px-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddProduct(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
 
    <div className="modal-backdrop fade show"></div>
  </>
)}

    </div>
  );
}