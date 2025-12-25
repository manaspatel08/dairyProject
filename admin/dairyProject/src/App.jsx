
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/admin/Dashboard";
import CreateStorePage from "./pages/admin/CreateStorePage";
import CategoryPage from "./pages/admin/CategoryPage";
import ProductListPage from "./pages/admin/ProductListPage";
import CreateProductPage from "./pages/admin/CreateProductPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import DeliveryPartnersPage from "./pages/admin/DeliveryPartnersPage"




export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="store" element={<CreateStorePage />} />
        <Route path="category" element={<CategoryPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage/>} />
        <Route path="create-product" element={<CreateProductPage />} />
       <Route path="delivery-partners" element={<DeliveryPartnersPage/>} />
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
