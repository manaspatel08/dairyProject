import React, { useEffect, useState } from "react";
import axios from "../api";
import banner from "../assets/bannerimg1.png";
import banner2 from "../assets/banner.png";
import banner3 from "../assets/banner3.png";
import card1 from "../assets/card1.png";
import card2 from "../assets/card2.png";
import card3 from "../assets/card3.png";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import "../components/ProductCard.css";
import { useCart } from "../context/CartContext";

export const Home = () => {
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
  const PAGE_ROWS = 3;  
  const COLS_ON_LG = 3;  
  const PAGE_SIZE = PAGE_ROWS * COLS_ON_LG;   
 
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    let mounted = true;

    axios
      .get("/products")
      .then((res) => {
        if (!mounted) return;

        const data = res.data?.data || res.data || [];
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
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
      list = list.filter((p) => {
        const price = Number(p.price || 0);
        return appliedPriceBuckets.some((bid) => {
          const bucket = PRICE_BUCKETS.find((b) => b.id === bid);
          if (!bucket) return false;
          return price >= bucket.min && price <= bucket.max;
        });
      });
    }

    setFiltered(list);
    setCurrentPage(1); 
  }, [products, appliedCategories, appliedStores, appliedPriceBuckets]);

  const handleAdd = async (product) => {
    try {
      await addToCart(product, 1);
    } catch (err) {
      console.error("Failed to add to cart:", err?.response?.data || err.message);
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

  
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (p) => {
    const page = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <>
    
      <div id="carouselExampleIndicators" className="carousel slide mt-3" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-label="Slide 1" />
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2" />
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3" />
        </div>

        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={banner3} className="d-block w-100" alt="banner" />
          </div>
          <div className="carousel-item">
            <img src={banner2} className="d-block w-100" alt="banner-2" />
          </div>
          <div className="carousel-item">
            <img src={banner} className="d-block w-100" alt="banner-3" />
          </div>
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Previous</span>
        </button>

        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Next</span>
        </button>
      </div>

 
      <div className="row mt-4 g-3">
        <div className="col-12 col-md-4">
          <div className="card position-relative overflow-hidden h-100">
            <img src={card1} className="card-img img-fluid" alt="Card" />
            <div className="card-img-overlay text-white d-flex flex-column justify-content-start">
              <h5 className="mt-3 ms-3">Everyday fresh &</h5>
              <h5 className="ms-3">Clean With Our</h5>
              <h5 className="ms-3">Products</h5>
              <a href="#" className="btn btn-danger mt-1 ms-3 align-self-start">
                Shop Now
              </a>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card position-relative overflow-hidden h-100">
            <img src={card2} className="card-img img-fluid" alt="Card" />
            <div className="card-img-overlay text-white d-flex flex-column justify-content-start">
              <h5 className="mt-3 ms-3">Make Your Breakfast</h5>
              <h5 className="ms-3">Healthy & Easy</h5>
              <a href="#" className="btn btn-danger mt-4 ms-3 align-self-start">
                Shop Now
              </a>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card position-relative overflow-hidden h-100">
            <img src={card3} className="card-img img-fluid" alt="Card" />
            <div className="card-img-overlay text-white d-flex flex-column justify-content-start">
              <h5 className="mt-3 ms-3">The Best Organic</h5>
              <h5 className="ms-3">Products Online</h5>
              <a href="#" className="btn btn-danger mt-4 ms-3 align-self-start">
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </div>

     
      <div className="container mt-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h2 className="section-title mb-0">Popular Products</h2>

          <div className="d-flex align-items-center gap-2 ms-auto d-none d-md-block">
            <small className="text-muted mb-0">We found {filtered.length} items for you</small>
            <Link to="/products">
            <button className="btn btn-outline-danger me-2 ms-4 btn-sm "
            
            >
              All products
              </button>
              </Link>

            <button className="btn btn-sm btn-outline-secondary d-lg-none" type="button" onClick={() => setIsFilterOpen(true)}>
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

           
            <div className="col-12 col-lg-3 mb-4 d-none d-lg-block">{renderFilterCard()}</div>

         
            <div className="col-12 col-lg-9">
              {filtered.length === 0 ? (
                <div className="text-center py-5">No products found for selected filters.</div>
              ) : (
                <>
                  <div className="row">
                    {paginated.map((p) => (
                      <div className="col-6 col-sm-6 col-md-4 col-lg-4 mb-4" key={p._id || p.id}>
                        <ProductCard product={p} onAdd={handleAdd} viewMode="compact" />
                      </div>
                    ))}
                  </div>

                  
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                      Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      const isVisible =
                        totalPages <= 7 ||
                        Math.abs(page - currentPage) <= 2 ||
                        page === 1 ||
                        page === totalPages;
                      if (!isVisible) {
                        const shouldRenderEllipsis =
                          page > 1 &&
                          (page === 2 || page === totalPages - 1) &&
                          (Math.abs(page - currentPage) > 2);
                        return shouldRenderEllipsis ? <span key={`ell-${page}`}>...</span> : null;
                      }
                      return (
                        <button
                          key={page}
                          className={`btn btn-sm ${page === currentPage ? "btn-danger" : "btn-outline-secondary"}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button className="btn btn-sm btn-outline-secondary" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
