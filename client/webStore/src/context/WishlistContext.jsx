// import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
// import axios from "../api";
// import { toast } from "react-toastify";
// import { useAuth } from "./AuthContext";

// const WishlistContext = createContext();

// export const useWishlist = () => useContext(WishlistContext);

// export const WishlistProvider = ({ children }) => {
//   const [wishlist, setWishlist] = useState({ items: [] });
//   const [loading, setLoading] = useState(false);
//   const { isAuthenticated } = useAuth();
 
//   useEffect(() => {
//     const savedWishlist = localStorage.getItem('guestWishlist');
//     if (savedWishlist) {
//       try {
//         setWishlist(JSON.parse(savedWishlist));
//       } catch (e) {
//         console.error('Failed to parse saved wishlist', e);
//         localStorage.removeItem('guestWishlist');
//       }
//     }
//   }, []);
 
//   useEffect(() => {
//     if (!isAuthenticated()) {
//       localStorage.setItem('guestWishlist', JSON.stringify(wishlist));
//     }
//   }, [wishlist, isAuthenticated]);

//   const fetchWishlist = useCallback(async () => {
 
//     if (isAuthenticated()) {
//       try {
//         setLoading(true);
//         const res = await axios.get("/wishlist");
//         const data = res.data?.data || res.data || { items: [] };
//         setWishlist(data);
//       } catch (err) {
//         console.warn("fetchWishlist:", err?.response?.data || err.message);
//         setWishlist({ items: [] });
//       } finally {
//         setLoading(false);
//       }
//     }
 
//   }, [isAuthenticated]);

//   useEffect(() => {
//     fetchWishlist();
//   }, [fetchWishlist]);

//   const addToWishlist = async (product) => {
//     const productId = product._id || product.id;
//     if (!productId) {
//       throw new Error("Product ID is required");
//     }
 
//     if (isAuthenticated()) {
//       try {
//         const res = await axios.post("/wishlist/add", { productId });
//         const data = res.data?.data || res.data;
        
//         if (data && !data.items) {
//           data.items = [];
//         }
        
//         setWishlist({
//           items: Array.isArray(data.items) ? data.items : []
//         });
        
//         toast.success("Added to wishlist");
//         return data;
//       } catch (err) {
//         console.error("Error adding to wishlist:", err);
//         toast.error(err.response?.data?.message || "Failed to add to wishlist");
//         throw err;
//       }
//     } 
  
//     else {
//       setWishlist(prev => {
 
//         const exists = prev.items.some(item => 
//           (item.product?._id === productId) || 
//           (item.product?.id === productId) ||
//           (item._id === productId) ||
//           (item.id === productId)
//         );
        
//         if (exists) {
//           toast.info("Product already in wishlist");
//           return prev;
//         }
        
//         const newItem = {
//           product: product,
//           _id: productId,
//           id: productId,
//           createdAt: new Date().toISOString()
//         };
        
//         const newWishlist = {
//           ...prev,
//           items: [...prev.items, newItem]
//         };
        
//         toast.success("Added to wishlist");
//         return newWishlist;
//       });
//       return { items: [...wishlist.items, { product, _id: productId }] };
//     }
//   };

//   const removeFromWishlist = async (productId) => {
//     if (!productId) {
//       throw new Error("Product ID is required");
//     }
 
//     if (isAuthenticated()) {
//       try {
//         const res = await axios.delete(`/wishlist/remove/${productId}`);
//         const data = res.data?.data || res.data;

//         if (data && !data.items) {
//           data.items = [];
//         }
         
//         setWishlist({
//           items: Array.isArray(data.items) ? data.items : []
//         });
        
//         toast.success("Removed from wishlist");
//         return data;
//       } catch (err) {
//         console.error("Error removing from wishlist:", err);
//         toast.error(err.response?.data?.message || "Failed to remove from wishlist");
//         throw err;
//       }
//     } 
    
//     else {
//       setWishlist(prev => {
//         const newItems = prev.items.filter(item => 
//           (item.product?._id !== productId) && 
//           (item.product?.id !== productId) &&
//           (item._id !== productId) &&
//           (item.id !== productId)
//         );
        
//         const newWishlist = {
//           ...prev,
//           items: newItems
//         };
        
//         toast.success("Removed from wishlist");
//         return newWishlist;
//       });
//       return { items: wishlist.items.filter(item => (item.product?._id !== productId) && (item._id !== productId)) };
//     }
//   };

//   const isInWishlist = useCallback((productId) => {
//     if (!wishlist?.items || !productId) return false;
 
//     const productIdStr = String(productId);
    
//     return wishlist.items.some((item) => {
  
//       if (item.product) {
   
//         if (item.product._id) {
//           return String(item.product._id) === productIdStr;
//         }
 
//         if (typeof item.product === 'string') {
//           return item.product === productIdStr;
//         } 
//         if (item.product.toString) {
//           return item.product.toString() === productIdStr;
//         }
//       }
     
//       if (item._id) return String(item._id) === productIdStr;
//       if (item.id) return String(item.id) === productIdStr;
//       if (typeof item === 'string') return item === productIdStr;
      
//       return false;
//     });
//   }, [wishlist?.items]);

//   const countItems = useMemo(() => wishlist?.items?.length || 0, [wishlist?.items]);

//   const contextValue = useMemo(() => ({
//     wishlist,
//     loading,
//     fetchWishlist,
//     addToWishlist,
//     removeFromWishlist,
//     isInWishlist,
//     countItems,
//   }), [wishlist, loading, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist, countItems]);


//   return (
//     <WishlistContext.Provider value={contextValue}>
//       {children}
//     </WishlistContext.Provider>
//   );
// };

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "../api";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  /* ------------------ HELPERS ------------------ */

  const normalizeItems = (items = []) =>
    items.map((item) => ({
      ...item,
      product:
        typeof item.product === "object"
          ? item.product
          : item.productDetails || null,
    }));

  /* ------------------ LOAD GUEST WISHLIST ------------------ */

  useEffect(() => {
    const saved = localStorage.getItem("guestWishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {
        localStorage.removeItem("guestWishlist");
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem("guestWishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  /* ------------------ FETCH WISHLIST ------------------ */

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      const res = await axios.get("/wishlist");
      const data = res.data?.data || res.data;

      setWishlist({
        items: normalizeItems(data?.items || []),
      });
    } catch (err) {
      console.error("fetchWishlist:", err);
      setWishlist({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /* ------------------ ADD ------------------ */

  const addToWishlist = async (product) => {
    const productId = product?._id;
    if (!productId) return;

    if (isAuthenticated()) {
      const res = await axios.post("/wishlist/add", { productId });
      const data = res.data?.data || res.data;

      setWishlist({
        items: normalizeItems(data?.items || []),
      });

      toast.success("Added to wishlist");
      return;
    }

    setWishlist((prev) => {
      const exists = prev.items.some(
        (i) => i.product?._id === productId
      );
      if (exists) return prev;

      return {
        items: [...prev.items, { product }],
      };
    });

    toast.success("Added to wishlist");
  };

  /* ------------------ REMOVE ------------------ */

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated()) {
      const res = await axios.delete(`/wishlist/remove/${productId}`);
      const data = res.data?.data || res.data;

      setWishlist({
        items: normalizeItems(data?.items || []),
      });

      toast.success("Removed from wishlist");
      return;
    }

    setWishlist((prev) => ({
      items: prev.items.filter(
        (i) => i.product?._id !== productId
      ),
    }));

    toast.success("Removed from wishlist");
  };

  /* ------------------ CHECK ------------------ */

  const isInWishlist = useCallback(
    (productId) =>
      wishlist.items.some(
        (i) => i.product?._id === productId
      ),
    [wishlist.items]
  );

  const countItems = useMemo(
    () => wishlist.items.length,
    [wishlist.items]
  );

  const value = {
    wishlist,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    countItems,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
