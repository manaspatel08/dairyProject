import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import AddToCartButton from "../components/AddToCartButton";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");

    axios
      .get(`/products/${id}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        setProduct(data || null);

        return axios.get("/products");
      })
      .then((res) => {
        const list = res.data?.data || res.data;
        setRelated(
          Array.isArray(list)
            ? list.filter((p) => p._id !== id).slice(0, 4)
            : []
        );
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load product details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product, 1);
    } catch (err) {
      console.error("Add to cart failed", err?.response?.data || err.message);
    }
  };

  const handleRelatedAdd = async (p) => {
    try {
      await addToCart(p, 1);
    } catch (err) {
      console.error("Add to cart failed", err?.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger mb-0">{error || "Product not found."}</div>
      </div>
    );
  }

  const price = Number(product.price || 0);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const rating = product.rating || 0;
  const brand = product.brand;
  const stock = typeof product.stock === "number" ? product.stock : null;
  const categoryName = product.category?.name || product.category || "";

  return (
    <div className="container my-4 my-lg-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div className="small text-muted">
          Home <span className="mx-1">/</span> Product{" "}
          <span className="mx-1">/</span> <span className="text-dark">{product.name}</span>
        </div>

        <div className="mt-2 mt-md-0 small text-muted">
          <span className="me-3">📞 +123 (456) 7890</span>
          <span>Need help? 24/7 Support</span>
        </div>
      </div>

      <div className="row g-4">
        <section className="col-12">
          <div className="row g-4">
            <div className="col-12 col-md-5">
              <div className="border rounded-3 bg-white p-3 h-100 d-flex flex-column">
                <img
               
                   src={`${BASE_URL}${product.imageUrl}`}
                  alt={product.name}
                  className="img-fluid mx-auto mb-3"
                  style={{ maxHeight: 320, objectFit: "contain" }}
                />

                {/* <div className="d-flex justify-content-center gap-2 flex-wrap">
                  {[product.imageUrl, product.imageUrl, product.imageUrl, product.imageUrl]
                    .filter(Boolean)
                    .map((img, idx) => (
                      <div
                        key={idx}
                        className="border rounded-3 "
                        style={{ width: 56, height: 56 }}
                      >
                        <img
                          src={`${BASE_URL}${img}`}
                          alt={`${product.name} ${idx + 1}`}
                          className="img-fluid h-100 w-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ))}
                </div> */}
              </div>
            </div>

            <div className="col-12 col-md-7">
              <div className="border rounded-3 bg-white p-3 p-md-4 h-100 d-flex flex-column">
                <h3 className="h5 mb-2">{product.name}</h3>
                {product.description && (
                  <p className="small text-muted mb-5">{product.description}</p>
                )}

                {(rating || brand || categoryName || stock !== null) && (
                  <dl className="row small text-muted mb-5">
                    {brand && (
                      <>
                        <dt className="col-4 col-sm-3">Brand</dt>
                        <dd className="col-8 col-sm-9">{brand}</dd>
                      </>
                    )}

                    {categoryName && (
                      <>
                        <dt className="col-4 col-sm-3">Category</dt>
                        <dd className="col-8 col-sm-9">{categoryName}</dd>
                      </>
                    )}

                    {rating ? (
                      <>
                        <dt className="col-4 col-sm-3">Rating</dt>
                        <dd className="col-8 col-sm-9">
                          {rating.toFixed(1)} / 5
                        </dd>
                      </>
                    ) : null}

                    {stock !== null && (
                      <>
                        <dt className="col-4 col-sm-3">In Stock</dt>
                        <dd className="col-8 col-sm-9">{stock}</dd>
                      </>
                    )}
                  </dl>
                )}

                <div className="d-flex align-items-end flex-wrap gap-4 mb-3">
                  <div className="me-3">
                    <div className="fs-4 fw-bold text-danger">₹{price.toFixed(2)}</div>
                    {oldPrice && (
                      <div className="small text-muted text-decoration-line-through">
                        ₹{oldPrice.toFixed(2)}
                      </div>
                    )}
                  </div>

                   <AddToCartButton  product={product} onAdd={handleAddToCart} />
                </div>

              </div>
            </div>
          </div>

      
          {related.length > 0 && (
            <div className="mt-5">
              <h4 className="h5 text-center mb-3">Popular Products</h4>
              <p className="text-muted small text-center mb-4">
                Explore more fresh and tasty picks that our customers love.
              </p>
              <div className="row g-3 g-md-4">
                {related.map((p) => (
                  <div
                    key={p._id}
                    className="col-6 col-sm-6 col-md-3 d-flex"
                  >
                    <ProductCard
                      product={p}
                      onAdd={handleRelatedAdd}
                      viewMode="full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


