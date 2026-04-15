import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

import ProductPage from './pages/Customer/ProductPage';
import ProductDetail from './pages/Customer/ProductDetail';
import CartPage from './pages/Customer/CartPage';
import CheckoutPage from './pages/Customer/CheckoutPage';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProductManager from './pages/Admin/ProductManager';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <CartProvider>   {/* Provider must wrap ALL routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route path="/" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Admin Route */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<ProductManager />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;