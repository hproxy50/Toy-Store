import { Routes, Route, Navigate, Outlet } from "react-router-dom"; // Thêm Outlet
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
import OrderManager from './pages/Admin/OrderManager';

import Header from "./pages/Customer/Header";
import Footer from "./pages/Customer/Footer";

// Tạo một Layout riêng cho Customer để chứa Footer
const CustomerLayout = () => {
  return (
    <>
      <Header /> {/* Header chỉ xuất hiện trong layout này */}
      <div style={{ flex: 1 }}>
        <Outlet /> {/* Các trang Product, Cart, Checkout sẽ render ở đây */}
      </div>
      <Footer /> {/* Footer chỉ xuất hiện trong layout này */}
    </>
  );
};

function App() {
  return (
    <CartProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        <main style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Nhóm Customer Routes vào trong CustomerLayout */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<ProductPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<ProductManager />} />
                <Route path="users" element={<UserManager />} />
                <Route path="orders" element={<OrderManager />} />
              </Route>
            </Route>
          </Routes>
        </main>
        
      </div>
    </CartProvider>
  );
}

export default App;