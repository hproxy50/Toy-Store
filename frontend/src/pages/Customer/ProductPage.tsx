import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../Css/Customer/ProductPage.css";

interface Toy {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const ProductPage = () => {
  const [toys, setToys] = useState<Toy[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Extract fetch function so we can call it after updating stock
  const fetchToys = async () => {
    try {
      const response = await fetch("http://localhost:3000/toys");
      const data = await response.json();
      setToys(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu đồ chơi:", error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    
    if (!userStr) {
      navigate("/login");
      return; 
    }

    const user = JSON.parse(userStr);
    
    if (user.role !== "customer") {
      navigate(user.role === "admin" ? "/admin" : "/login");
      return;
    }

    setCurrentUser(user);
    fetchToys();           // ← initial load
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/login");
  };


  const handleAddToCart = async (toy: Toy) => {
  if (toy.quantity <= 0) return;

  try {
    // ✅ UPDATE BACKEND
    await fetch(`http://localhost:3000/toys/${toy.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: toy.quantity - 1
      }),
    });

    // ✅ UPDATE CART
    addToCart({
      id: toy.id,
      name: toy.name,
      price: toy.price,
      category: toy.category,
      image: toy.image,
      stock: toy.quantity - 1,
    });

    // ✅ UPDATE UI
    setToys(prev =>
      prev.map(t =>
        t.id === toy.id ? { ...t, quantity: t.quantity - 1 } : t
      )
    );

    alert(`${toy.name} đã được thêm vào giỏ hàng!`);
  } catch (error) {
    console.error("Lỗi thêm vào giỏ:", error);
  }
};

  return (
    <div className="product-page-container">
      <div className="header">
        <h2>Cửa Hàng Đồ Chơi</h2>
        {currentUser && (
          <div className="user-info">
            <span>Xin chào, <strong>{currentUser.name}</strong>!</span>
            <a href="/cart" style={{ fontSize: '28px', marginLeft: '20px', textDecoration: 'none' }}>🛒</a>
            <button className="logout-btn" onClick={handleLogout}>Đăng Xuất</button>
          </div>
        )}
      </div>

      <div className="product-list">
        {toys.map((toy) => (
          <div key={toy.id} className="product-card">
            <img 
              src={toy.image} 
              alt={toy.name} 
              className="product-image clickable" 
              onClick={() => navigate(`/product/${toy.id}`)}
            />
            <h3 
              className="product-name clickable"
              onClick={() => navigate(`/product/${toy.id}`)}
            >
              {toy.name}
            </h3>
            <p className="product-category">Danh mục: {toy.category}</p>
            <p className="product-price">{toy.price.toLocaleString("vi-VN")} VNĐ</p>
            <p className="product-quantity">Kho: {toy.quantity}</p>
            
            <button 
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(toy)}
              disabled={toy.quantity <= 0}
            >
              {toy.quantity > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
            </button>
          </div>
        ))}
        {toys.length === 0 && <p className="loading-text">Đang tải dữ liệu sản phẩm...</p>}
      </div>
    </div>
  );
};

export default ProductPage;