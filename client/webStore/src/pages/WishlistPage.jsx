import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaTrash, FaShoppingCart, FaSpinner } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import axios from "../api";
import AddToCartButton from "../components/AddToCartButton";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    wishlist, 
    loading: wishlistLoading, 
    fetchWishlist, 
    removeFromWishlist 
  } = useWishlist();
  
  const { addToCart } = useCart();

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        await fetchWishlist();
      } catch (error) {
        console.error('Error loading wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    const updateProducts = async () => {
      
      if (!wishlist?.items || wishlist.items.length === 0) {
        setProducts([]);
        return;
      }

      try {
        setIsLoading(true);
       
        const firstItem = wishlist.items[0];

        if (firstItem && firstItem._id) {
          setProducts(wishlist.items);
        }
        else if (firstItem && firstItem.product?._id) {
          setProducts(wishlist.items.map(item => item.product));
        }
        else if (typeof firstItem === 'string' || firstItem.id) {
          const productPromises = wishlist.items.map(item => {
            const productId = typeof item === 'string' ? item : item.id;
            return axios.get(`/products/${productId}`).then(res => res.data.data || res.data);
          });
          const productsData = await Promise.all(productPromises);
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error updating products:', error);
        toast.error('Failed to update wishlist items');
      } finally {
        setIsLoading(false);
      }
    };

    updateProducts();
  }, [wishlist?.items]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setProducts(products.filter(p => (p._id || p.id) !== productId));
      //toast.success('Product removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      console.log('Adding to cart:', product);
      const productId = product._id || product.id;
      
      if (!productId) {
        console.error('Product ID is missing in product:', product);
        throw new Error("Cannot add to cart: Product ID is missing");
      }
      
      const cartProduct = {
        _id: productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || product.image
      };
      
      console.log('Adding to cart with data:', cartProduct);
      await addToCart(cartProduct, 1);
      
      console.log('Removing from wishlist:', productId);
      await removeFromWishlist(productId);
      
      toast.success("Product moved to cart");
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
      if (!error.response) {
        toast.error(error.message || "Failed to add to cart");
      }
    }
  };
  console.log("Products",products);
  

  if (isLoading || wishlistLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <h2 className="mb-4">My Wishlist</h2>
      
      {!products || products.length === 0 ? (
        <div className="text-center py-5">
          <FaHeart size={48} className="text-muted mb-3" />
          <h4>Your wishlist is empty</h4>
          <p className="text-muted">You haven't added any products to your wishlist yet.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {products.map((product) => {
            const productId = product._id || product.id;
            if (!productId) return null;
            
            return (
              <div key={`wishlist-item-${productId}`} className="col">
                <div className="card h-100">
                  <div className="position-relative ">
                    <img 
                      
                      src={`${product.imageUrl}`} 
                      className="card-img-top"
                      alt={product.name}
                      style={{ height:160, objectFit: 'contain' }}
                      onClick={() => navigate(`/products/${productId}`)}
                      role="button"
                    />
                  </div>
                  
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title h6 mb-2">{product.name}</h5>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="h5 mb-0">₹{product.price?.toFixed(2)}</span>
                        {/* <div className="text-warning">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>★</span>
                          ))}
                        </div> */}
                      </div>
                      <div className="d-flex align-item-center justify-content-between">
                      <AddToCartButton  product={product} onAdd={handleAddToCart} />
                      <button
                      className="btn btn-outline-danger  w-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(productId);
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash  className=""/>
                      Remove
                    </button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
