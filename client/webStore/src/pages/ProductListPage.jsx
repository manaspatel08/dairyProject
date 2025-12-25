import React, { useEffect, useState } from "react";
import axios from "../api";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [selectedStores, setSelectedStores] = useState([]);  
  const [priceBounds, setPriceBounds] = useState([0, 0]);
  const [priceRange, setPriceRange] = useState([0, 0]); 

  const [selectedPriceBuckets, setSelectedPriceBuckets] = useState([]);  

  const [appliedCategories, setAppliedCategories] = useState([]);
  const [appliedStores, setAppliedStores] = useState([]);
  const [appliedPriceBuckets, setAppliedPriceBuckets] = useState([]); 

  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 12; 

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const location = useLocation();
  const { addToCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const category = params.get("category") || "";

    const fetchData = async () => {
      try {
        let res;
        if (q || category) {
          res = await axios.get("/products/search", {
            params: { q, category },
          });
        } else {
          res = await axios.get("/products");
        }

        const data = res.data?.data || res.data;
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
 
        const catSet = new Set(
          list
            .map((p) => p.category?.name || p.category)
            .filter(Boolean)
        );
        setCategories([...catSet]);
 
        const storeMap = new Map();
        list.forEach((p) => {
          if (p.store && typeof p.store === "object") {
            const id = p.store._id;
            const name =
              p.store.Store_Name || p.store.name || p.store.storeName || "Store";
            if (id && !storeMap.has(id)) {
              storeMap.set(id, { id, name });
            }
          } else if (typeof p.brand === "string" && p.brand.trim() !== "") {
            const id = p.brand;
            const name = p.brand;
            if (!storeMap.has(id)) {
              storeMap.set(id, { id, name });
            }
          }
        });
        setStores([...storeMap.values()]);
 
        const prices = list.map((p) => Number(p.price || 0)).filter((n) => !isNaN(n));
        if (prices.length) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceBounds([min, max]);
          setPriceRange([min, max]);
        } else {
          setPriceBounds([0, 0]);
          setPriceRange([0, 0]);
        }

        setCurrentPage(1); 
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [location.search]);
 
  useEffect(() => {
    let list = [...products];

    if (appliedCategories.length > 0) {
      list = list.filter((p) => {
        const cat = p.category?.name || p.category;
        return cat && appliedCategories.includes(cat);
      });
    }

    if (appliedStores.length > 0) {
      list = list.filter((p) => {
        const storeId =
          (p.store && typeof p.store === "object" && p.store._id) ||
          (typeof p.brand === "string" && p.brand) ||
          null;
        return storeId && appliedStores.includes(storeId);
      });
    }

    if (appliedPriceBuckets.length > 0) {
      const [minBound, maxBound] = priceBounds;
      const priceBuckets = [
        { id: "0-50", label: "₹0 - ₹50", min: 0, max: 50 },
        { id: "50-100", label: "₹50 - ₹100", min: 50, max: 100 },
        { id: "100-200", label: "₹100 - ₹200", min: 100, max: 200 },
        {
          id: "200-plus",
          label: "₹200+",
          min: 200,
          max: maxBound || 999999,
        },
      ];

      list = list.filter((p) => {
        const price = Number(p.price || 0);
        return appliedPriceBuckets.some((bid) => {
          const bucket = priceBuckets.find((b) => b.id === bid);
          if (!bucket) return false;
          return price >= bucket.min && price <= bucket.max;
        });
      });
    }

    setFiltered(list);
    setCurrentPage(1);
  }, [products, appliedCategories, appliedStores, appliedPriceBuckets, priceBounds]);

  const handleAdd = async (p) => {
    try {
      await addToCart(p, 1);
      toast.success("Product added to cart");
    } catch (err) {
      console.error("Add to cart failed", err?.response?.data || err.message);
    }
  };

  const [minBound, maxBound] = priceBounds;

  const PRICE_BUCKETS = [
    { id: "0-50", label: "₹0 - ₹50", min: 0, max: 50 },
    { id: "50-100", label: "₹50 - ₹100", min: 50, max: 100 },
    { id: "100-200", label: "₹100 - ₹200", min: 100, max: 200 },
    {
      id: "200-plus",
      label: "₹200+",
      min: 200,
      max: maxBound || 999999,
    },
  ];

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleStore = (id) => {
    setSelectedStores((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const togglePriceBucket = (id) => {
    setSelectedPriceBuckets((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleApplyFilters = () => {
    setAppliedCategories(selectedCategories);
    setAppliedStores(selectedStores);
    setAppliedPriceBuckets(selectedPriceBuckets);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedStores([]);
    setSelectedPriceBuckets([]);
    setPriceRange(priceBounds);
    setAppliedCategories([]);
    setAppliedStores([]);
    setAppliedPriceBuckets([]);
    setIsFilterOpen(false);
  };

  const renderFilterContent = (options = {}) => {
    const { showApplyButton = false } = options;

    return (
      <>
        <div className="mb-3">
          <h6 className="small text-uppercase text-muted mb-2">Category</h6>
          <div className="d-flex flex-column gap-1">
            <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => setSelectedCategories([])}
                style={{ width: 18, height: 18 }}
              />
              <span>All</span>
            </label>

            {categories.map((cat) => (
              <label key={cat} className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  style={{ width: 18, height: 18 }}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h6 className="small text-uppercase text-muted mb-2">Store</h6>
          <div className="d-flex flex-column gap-1">
            <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={selectedStores.length === 0}
                onChange={() => setSelectedStores([])}
                style={{ width: 18, height: 18 }}
              />
              <span>All</span>
            </label>

            {stores.map((store) => (
              <label key={store.id} className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedStores.includes(store.id)}
                  onChange={() => toggleStore(store.id)}
                  style={{ width: 18, height: 18 }}
                />
                <span>{store.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <h6 className="small text-uppercase text-muted mb-2">Price</h6>
          <div className="d-flex flex-column gap-1">
            <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={selectedPriceBuckets.length === 0}
                onChange={() => setSelectedPriceBuckets([])}
                style={{ width: 18, height: 18 }}
              />
              <span>All</span>
            </label>

            {PRICE_BUCKETS.map((bucket) => (
              <label key={bucket.id} className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedPriceBuckets.includes(bucket.id)}
                  onChange={() => togglePriceBucket(bucket.id)}
                  style={{ width: 18, height: 18 }}
                />
                <span>{bucket.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-3 d-flex flex-column gap-2">
          {showApplyButton && (
            <button className="btn btn-danger w-100" type="button" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          )}

          <button className="btn btn-sm btn-outline-secondary w-100" type="button" onClick={handleClearFilters}>
            Clear filters
          </button>
        </div>
      </>
    );
  };

  const renderFilterCard = () => (
    <div className="card shadow-sm">
      <div className="card-body bg-light">
        <h5 className="h6 mb-3">Filter</h5>
        {renderFilterContent({ showApplyButton: true })}
      </div>
    </div>
  );
 
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filtered.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mt-1">
      <ToastContainer />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="section-title mb-0">All Products</h2>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
          </small>
          <button 
            className="btn btn-sm btn-outline-secondary d-lg-none" 
            type="button" 
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading products...</div>
      ) : (
        <div className="row">
 
          {isFilterOpen && (
            <>
              <div className="modal fade show d-block d-lg-none" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Filters</h5>
                      <button type="button" className="btn-close" onClick={() => setIsFilterOpen(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="bg-light rounded-3 p-3">{renderFilterContent({ showApplyButton: true })}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show d-lg-none"></div>
            </>
          )}
 
          <div className="col-12 col-lg-3 mb-4 d-none d-lg-block">
            {renderFilterCard()}
          </div>
 
          <div className="col-12 col-lg-9">
            {filtered.length === 0 ? (
              <div className="text-center py-5">No products found for selected filters.</div>
            ) : (
              <>
                <div className="row ">
                  {currentProducts.map((p) => (
                    <div
                      className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4"
                      key={p._id}
                    >
                      <ProductCard product={p} onAdd={handleAdd} viewMode="full" />
                    </div>
                  ))}
                </div>
 
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
