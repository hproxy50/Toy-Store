import { Routes, Route } from 'react-router-dom';
import ProductManager from './pages/Admin/ProductManager';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProductPage from './pages/Customer/ProductPage';
import ProductDetail from './pages/Customer/ProductDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<ProductManager />} />
      </Route>
    </Routes>
  );
}

export default App;