import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";
import AddToCartButton from "./AddToCartButton";
import { CiHeart } from "react-icons/ci";
import { useWishlist } from "../context/WishlistContext";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ProductCard({ product, onAdd }) {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const productId = product?._id;
  const inWishlist = productId ? isInWishlist(productId) : false;

  const goToDetails = () => {
    if (!product?._id) return;
    navigate(`/products/${product._id}`);
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    if (!productId) return;

    inWishlist ? removeFromWishlist(productId) : addToWishlist(product);
  };

  return (
    <div className="product-card card h-100 shadow-sm" style={{ cursor: "pointer" }}>
      <div className="img-wrap position-relative" onClick={goToDetails}>
        <img
        src={`${BASE_URL}${product.imageUrl}`} 
          alt={product.name}
          className="card-img-top product-img"
        />

        {product.tag && (
          <span className="badge product-badge">{product.tag}</span>
        )}

        <span className="wishlist-heart" onClick={toggleWishlist}>
          <CiHeart size={26} className={inWishlist ? "heart-active" : ""} />
        </span>
      </div>

      <div className="card-body d-flex flex-column">
        <h4 className="product-name" onClick={goToDetails}>
          {product.name}
        </h4>
        <p className="text-muted small mb-1">
          {product.category?.name || ""}
        </p>
 
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">
                ₹{Number(product.price || 0).toFixed(2)}
              </div>

              {product.oldPrice && (
                <small className="text-muted text-decoration-line-through">
                  ₹{Number(product.oldPrice).toFixed(2)}
                </small>
              )}
            </div>
 
            <div className="d-none d-md-block">
              <AddToCartButton product={product} onAdd={onAdd} />
            </div>
          </div>
 
          <div className="d-block d-md-none mt-2">
            <AddToCartButton product={product} onAdd={onAdd} />
          </div>
        </div>
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onAdd: PropTypes.func,
};

ProductCard.defaultProps = {
  onAdd: null,
};
