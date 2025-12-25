// import React, { createContext, useContext, useEffect, useState } from "react";
// import axios from "../api";
// import { toast } from "react-toastify";
// import { useAuth } from "./AuthContext";

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState({ items: [] });
//   const [loading, setLoading] = useState(false);
//   const { isAuthenticated } = useAuth();

  
//   useEffect(() => {
//     const savedCart = localStorage.getItem('guestCart');
//     if (savedCart) {
//       try {
//         setCart(JSON.parse(savedCart));
//       } catch (e) {
//         console.error('Failed to parse saved cart', e);
//         localStorage.removeItem('guestCart');
//       }
//     }
//   }, []);
 
//   useEffect(() => {
//     if (!isAuthenticated()) {
//       localStorage.setItem('guestCart', JSON.stringify(cart));
//     }
//   }, [cart, isAuthenticated]);

//   const fetchCart = async () => {
 
//     if (isAuthenticated()) {
//       try {
//         setLoading(true);
//         const res = await axios.get("/cart"); 
//         const data = res.data?.data || res.data || { items: [] };
//         setCart(data);
//       } catch (err) {
//         console.warn("fetchCart:", err?.response?.data || err.message);
//         setCart({ items: [] });
//       } finally {
//         setLoading(false);
//       }
//     }
    
//   };

//   useEffect(() => {
//     fetchCart();
//   }, [isAuthenticated]);

//   const addToCart = async (product, qty = 1) => {
//     const productId = product._id || product.id;
//     if (!productId) {
//       throw new Error("Product ID is required");
//     }
 
//     if (isAuthenticated()) {
//       try {
//         const response = await axios.post("/cart/addtocart", { 
//           productId, 
//           quantity: Number(qty) || 1 
//         });
        
//         const data = response.data?.data || response.data;
//         setCart(data);
//         toast.success("Product added to cart");
      
//         return data;
//       } catch (error) {
//         console.error("Error adding to cart:", error);
//         const errorMessage = error.response?.data?.message || "Failed to add to cart";
//         toast.error(errorMessage);
//         throw error;
//       }
//     } 
 
//     else {
//       setCart(prev => {
 
//         const existingItemIndex = prev.items.findIndex(item => 
//           (item.product?._id === productId) || 
//           (item.product?.id === productId) ||
//           (item._id === productId) ||
//           (item.id === productId)
//         );
        
//         let newItems;
//         if (existingItemIndex >= 0) {
 
//           newItems = [...prev.items];
//           const newQuantity = (newItems[existingItemIndex].quantity || 1) + (Number(qty) || 1);
//           newItems[existingItemIndex] = {
//             ...newItems[existingItemIndex],
//             quantity: newQuantity
//           };
//           toast.info("Updated quantity in cart");
//         } else {
 
//           const newItem = {
//             product: product,
//             _id: productId,
//             id: productId,
//             quantity: Number(qty) || 1,
//             price: product.price || 0
//           };
//           newItems = [...prev.items, newItem];
//           //toast.success("Product added to cart");
//         }
        
//         return {
//           ...prev,
//           items: newItems
//         };
//       });
//       return cart;
//     }
//   };

//   const deleteFromCart = async (productId) => {
 
//     if (isAuthenticated()) {
//       const res = await axios.delete(`/cart/deletefromcart/${productId}`);
//       const data = res.data?.data || res.data;
//       setCart(data);
//       return data;
//     } 
 
//     else {
//       setCart(prev => {
//         const newItems = prev.items.filter(item => 
//           (item.product?._id !== productId) && 
//           (item.product?.id !== productId) &&
//           (item._id !== productId) &&
//           (item.id !== productId)
//         );
        
//         return {
//           ...prev,
//           items: newItems
//         };
//       });
//       return cart;
//     }
//   };

//   const incrementProduct = async (productId) => {
 
//     if (isAuthenticated()) {
//       const res = await axios.post("/cart/incrementproduct", { productId });
//       const data = res.data?.data || res.data;
//       setCart(data);
//       return data;
//     } 
 
//     else {
//       setCart(prev => {
//         const itemIndex = prev.items.findIndex(item => 
//           (item.product?._id === productId) || 
//           (item.product?.id === productId) ||
//           (item._id === productId) ||
//           (item.id === productId)
//         );
        
//         if (itemIndex >= 0) {
//           const newItems = [...prev.items];
//           newItems[itemIndex] = {
//             ...newItems[itemIndex],
//             quantity: (newItems[itemIndex].quantity || 1) + 1
//           };
          
//           return {
//             ...prev,
//             items: newItems
//           };
//         }
        
//         return prev;
//       });
//       return cart;
//     }
//   };

//   const decrementProduct = async (productId) => {
    
//     if (isAuthenticated()) {
//       const res = await axios.post("/cart/decrementproduct", { productId });
//       const data = res.data?.data || res.data;
//       setCart(data);
//       return data;
//     } 
 
//     else {
//       setCart(prev => {
//         const itemIndex = prev.items.findIndex(item => 
//           (item.product?._id === productId) || 
//           (item.product?.id === productId) ||
//           (item._id === productId) ||
//           (item.id === productId)
//         );
        
        
//         if (itemIndex >= 0) {
//           const currentItem = prev.items[itemIndex];
//           const newQuantity = (currentItem.quantity || 1) - 1;
          
//           let newItems;
//           if (newQuantity <= 0) {
    
//             newItems = prev.items.filter((_, index) => index !== itemIndex);
//           } else {
 
//             const updatedItem = {
//               ...currentItem,
//               quantity: newQuantity
//             };
//             newItems = [...prev.items];
//             newItems[itemIndex] = updatedItem;
//           }
          
//           return {
//             ...prev,
//             items: newItems
//           };
//         }
        
//         return prev;
//       });
//       return cart;
//     }
//   };

//   const isProductInCart = (productId)=>{
//     return(cart.items || []).some(item=> 
//       (item.product?._id === productId) || 
//       (item.product?.id === productId) ||
//       (item._id === productId) ||
//       (item.id === productId)
//     );
//   };

//   const countItems = (cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
//   const subtotal = (cart.items || []).reduce((s, i) => s + (i.quantity || 0) * (i.price || i.product?.price || 0), 0);

//   return (
//     <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, deleteFromCart, incrementProduct, decrementProduct, countItems, subtotal, isProductInCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../api";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  /* -------------------- LOAD GUEST CART -------------------- */

  useEffect(() => {
    const savedCart = localStorage.getItem("guestCart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);

        // 🔥 REHYDRATE GUEST CART ITEMS
        const fixedItems = (parsed.items || []).map((item) => ({
          ...item,
          product: item.product || item.productDetails || null,
          imageUrl:
            item.imageUrl ||
            item.product?.imageUrl ||
            "",
          price: item.price || item.product?.price || 0,
          quantity: item.quantity || 1,
        }));

        setCart({ items: fixedItems });
      } catch (e) {
        console.error("Failed to parse guest cart", e);
        localStorage.removeItem("guestCart");
      }
    }
  }, []);

  /* -------------------- SAVE GUEST CART -------------------- */

  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  /* -------------------- FETCH CART (AUTH) -------------------- */

  const fetchCart = async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      const res = await axios.get("/cart");
      const data = res.data?.data || res.data || { items: [] };

      const fixedItems = (data.items || []).map((item) => ({
        ...item,
        product:
          typeof item.product === "object"
            ? item.product
            : item.productDetails || null,
        imageUrl:
          item.product?.imageUrl ||
          "",
        price: item.price || item.product?.price || 0,
        quantity: item.quantity || 1,
      }));

      setCart({ items: fixedItems });
    } catch (err) {
      console.warn("fetchCart:", err?.response?.data || err.message);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  /* -------------------- ADD TO CART -------------------- */

  const addToCart = async (product, qty = 1) => {
    const productId = product?._id || product?.id;
    if (!productId) return;

    if (isAuthenticated()) {
      const res = await axios.post("/cart/addtocart", {
        productId,
        quantity: Number(qty) || 1,
      });

      const data = res.data?.data || res.data;

      setCart({
        items: (data.items || []).map((item) => ({
          ...item,
          product:
            typeof item.product === "object"
              ? item.product
              : item.productDetails || null,
          imageUrl: item.product?.imageUrl || "",
          price: item.price || item.product?.price || 0,
          quantity: item.quantity || 1,
        })),
      });

      //toast.success("Product added to cart");
      return;
    }

    // 🔥 GUEST
    setCart((prev) => {
      const index = prev.items.findIndex(
        (i) => i.product?._id === productId
      );

      let items = [...prev.items];

      if (index >= 0) {
        items[index] = {
          ...items[index],
          quantity: items[index].quantity + Number(qty),
        };
      } else {
        items.push({
          product,
          imageUrl: product.imageUrl || "",
          price: product.price || 0,
          quantity: Number(qty),
        });
      }

      return { items };
    });

    //toast.success("Product added to cart");
  };

  /* -------------------- DELETE -------------------- */

  const deleteFromCart = async (productId) => {
    if (isAuthenticated()) {
      const res = await axios.delete(`/cart/deletefromcart/${productId}`);
      const data = res.data?.data || res.data;
      setCart({ items: data.items || [] });
      return;
    }

    setCart((prev) => ({
      items: prev.items.filter(
        (i) => i.product?._id !== productId
      ),
    }));
  };

  /* -------------------- QTY -------------------- */

  const incrementProduct = async (productId) => {
    if (isAuthenticated()) {
      const res = await axios.post("/cart/incrementproduct", { productId });
      setCart(res.data?.data || res.data);
      return;
    }

    setCart((prev) => ({
      items: prev.items.map((i) =>
        i.product?._id === productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    }));
  };

  const decrementProduct = async (productId) => {
    if (isAuthenticated()) {
      const res = await axios.post("/cart/decrementproduct", { productId });
      setCart(res.data?.data || res.data);
      return;
    }

    setCart((prev) => ({
      items: prev.items
        .map((i) =>
          i.product?._id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    }));
  };

  /* -------------------- HELPERS -------------------- */

  const isProductInCart = (productId) =>
    cart.items.some((i) => i.product?._id === productId);

  const countItems = cart.items.reduce(
    (s, i) => s + (i.quantity || 0),
    0
  );

  const subtotal = cart.items.reduce(
    (s, i) => s + i.quantity * i.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        deleteFromCart,
        incrementProduct,
        decrementProduct,
        countItems,
        subtotal,
        isProductInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

