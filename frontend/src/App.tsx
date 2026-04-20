import { Routes, Route, Navigate } from "react-router-dom"; // Thêm Navigate
import { CartProvider } from "./context/CartContext";

import ProductPage from "./pages/Customer/ProductPage";
import ProductDetail from "./pages/Customer/ProductDetail";
import CartPage from "./pages/Customer/CartPage";
import CheckoutPage from "./pages/Customer/CheckoutPage";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProductManager from "./pages/Admin/ProductManager";
import UserManager from './pages/Admin/UserManager';
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route path="/" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="users" element={<UserManager />} />
            {/* <Route path="orders" element={<OrderManager />} /> */}
          </Route>
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
