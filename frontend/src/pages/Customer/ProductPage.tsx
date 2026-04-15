import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Customer/ProductPage.css";

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

    const fetchToys = async () => {
      try {
        const response = await fetch("http://localhost:3000/toys");
        const data = await response.json();
        setToys(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu đồ chơi:", error);
      }
    };

    fetchToys();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div className="product-page-container">
      <div className="header">
        <h2>Cửa Hàng Đồ Chơi</h2>
        {currentUser && (
          <div className="user-info">
            <span>Xin chào, <strong>{currentUser.name}</strong>!</span>
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
            <button className="add-to-cart-btn">Thêm vào giỏ</button>
          </div>
        ))}
        {toys.length === 0 && <p className="loading-text">Đang tải dữ liệu sản phẩm...</p>}
      </div>
    </div>
  );
};

export default ProductPage;