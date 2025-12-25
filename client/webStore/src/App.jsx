import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/ProductListPage";
import Category from "./pages/Category";
import MainLayout from "./Layout/MainLayout";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutDetails from "./pages/CheckoutDetails";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import AddressPage from "./pages/AddressPage";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ContactUs from "./pages/ContactUs";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="category" element={<Category />} />
        <Route path="cart" element={<CartPage />} />
         <Route path="wishlist" element={<WishlistPage />} />
         <Route path="checkout-details" element={<CheckoutDetails />} />
         <Route path="orders" element={<OrdersPage/>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/address" element={<AddressPage />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-conditions" element={<TermsConditions />} />
        <Route path="contact-us" element={<ContactUs />} />

      </Route>
      
     
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}
