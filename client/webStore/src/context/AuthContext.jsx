import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("userData");

    if (token && role === "customer" && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const mergeGuestData = async () => {
    try {
 
      const guestCart = localStorage.getItem('guestCart');
      const guestWishlist = localStorage.getItem('guestWishlist');
      const guestSubscription = localStorage.getItem('guestSubscriptionDraft');
       
      if (guestCart) {
        const cartData = JSON.parse(guestCart);
        if (cartData.items && Array.isArray(cartData.items)) {
          for (const item of cartData.items) {
            try {
  
              await axios.post("/cart/addtocart", { 
                productId: item.product?._id || item.product?.id || item._id || item.id, 
                quantity: item.quantity || 1 
              });
            } catch (error) {
              console.warn("Failed to merge cart item:", error);
            }
          }
        }
 
        localStorage.removeItem('guestCart');
      }
   
      if (guestWishlist) {
        const wishlistData = JSON.parse(guestWishlist);
        if (wishlistData.items && Array.isArray(wishlistData.items)) {
          for (const item of wishlistData.items) {
            try {
  
              const productId = item.product?._id || item.product?.id || item._id || item.id;
              if (productId) {
                await axios.post("/wishlist/add", { productId });
              }
            } catch (error) {
              console.warn("Failed to merge wishlist item:", error);
            }
          }
        }
 
        localStorage.removeItem('guestWishlist');
      }
 
      if (guestSubscription) {
        try {
          const subscriptionData = JSON.parse(guestSubscription);
          await axios.post("/subscription-draft/save", { 
            subscriptions: Array.isArray(subscriptionData) ? subscriptionData : [subscriptionData]
          });
 
          localStorage.removeItem('guestSubscriptionDraft');
        } catch (error) {
          console.warn("Failed to merge subscription draft:", error);
        }
      }
    } catch (error) {
      console.error("Error merging guest data:", error);
    }
  };

  const login = async (token, role, userData) => {
    if (role === "customer") {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      
       
      await mergeGuestData();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null && localStorage.getItem("role") === "customer";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};