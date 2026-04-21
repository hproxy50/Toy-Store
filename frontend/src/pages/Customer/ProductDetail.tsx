import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../Css/Customer/ProductDetail.css";

interface Toy {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [toy, setToy] = useState<Toy | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

    const fetchToy = async () => {
      try {
        const response = await fetch(`http://localhost:3000/toys/${id}`);
        const data = await response.json();
        setToy(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu đồ chơi:", error);
      }
    };

    fetchToy();
  }, [id, navigate]);

  const handleAddToCart = async () => {
  if (!toy || toy.quantity <= 0) return;

  try {
    await fetch(`http://localhost:3000/toys/${toy.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: toy.quantity - 1
      }),
    });

    addToCart({
      id: toy.id,
      name: toy.name,
      price: toy.price,
      category: toy.category,
      image: toy.image,
      stock: toy.quantity - 1,
    });

    setToy(prev => prev ? { ...prev, quantity: prev.quantity - 1 } : prev);

    alert(`${toy.name} đã được thêm vào giỏ hàng!`);
  } catch (error) {
    console.error("Lỗi thêm vào giỏ:", error);
  }
};

  if (!toy) {
    return <div className="loading-text">Đang tải dữ liệu sản phẩm...</div>;
  }

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>
      
      <div className="product-detail-content">
        <img 
          src={toy.image} 
          alt={toy.name} 
          className="product-detail-image" 
        />
        
        <div className="product-detail-info">
          <h2 className="product-detail-name">{toy.name}</h2>
          <p className="product-detail-category">Danh mục: {toy.category}</p>
          <p className="product-detail-price">{toy.price.toLocaleString("vi-VN")} VNĐ</p>
          <p className="product-detail-quantity">Còn lại: {toy.quantity} sản phẩm</p>
          
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            disabled={toy.quantity <= 0}
          >
            {toy.quantity > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;