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
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
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
        console.error(error);
      }
    };

    fetchToy();
  }, [id, navigate]);

  const handleDecrease = () => {
    setQuantityToAdd((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    if (toy && quantityToAdd < toy.quantity) {
      setQuantityToAdd((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!toy || toy.quantity <= 0 || quantityToAdd <= 0) return;

    try {
      await fetch(`http://localhost:3000/toys/${toy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: toy.quantity - quantityToAdd,
        }),
      });

      addToCart({
        id: toy.id,
        name: toy.name,
        price: toy.price,
        category: toy.category,
        image: toy.image,
        stock: toy.quantity - quantityToAdd,
      });

      setToy((prev) =>
        prev ? { ...prev, quantity: prev.quantity - quantityToAdd } : prev,
      );
      setQuantityToAdd(1);

      alert(`Đã thêm ${quantityToAdd} sản phẩm "${toy.name}" vào giỏ hàng!`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!toy) {
    return (
      <div className="loading-text-detail">Đang tải dữ liệu sản phẩm...</div>
    );
  }

  return (
    <div className="product-detail-page-wrapper">
      <div className="product-detail-container">
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate("/")}>
            TRANG CHỦ
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {toy.category.toUpperCase()}
          </span>
        </div>

        <div className="product-detail-content">
          <div className="product-detail-image-wrapper">
            <img
              src={toy.image}
              alt={toy.name}
              className="product-detail-image"
            />
            {toy.quantity <= 0 && (
              <div className="out-of-stock-overlay-detail">HẾT HÀNG</div>
            )}
          </div>

          <div className="product-detail-info">
            <h1 className="product-detail-name">{toy.name}</h1>

            <div className="product-detail-price">
              {toy.price.toLocaleString("vi-VN")} <span>₫</span>
            </div>

            <div className="product-detail-desc">
              <p>
                Danh mục: <strong>{toy.category}</strong>
              </p>
            </div>

            <div className="product-detail-stock">
              {toy.quantity > 0
                ? `Còn ${toy.quantity} trong kho`
                : "Đã hết hàng"}
            </div>

            <div className="action-row">
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={handleDecrease}
                  disabled={toy.quantity <= 0}
                >
                  -
                </button>
                <input
                  type="text"
                  className="qty-input"
                  value={toy.quantity > 0 ? quantityToAdd : 0}
                  readOnly
                />
                <button
                  className="qty-btn"
                  onClick={handleIncrease}
                  disabled={toy.quantity <= 0}
                >
                  +
                </button>
              </div>

              <button
                className="add-to-cart-btn-red"
                onClick={handleAddToCart}
                disabled={toy.quantity <= 0}
              >
                {toy.quantity > 0 ? "THÊM VÀO GIỎ HÀNG" : "HẾT HÀNG"}
              </button>
            </div>

            <button className="back-btn" onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left"></i> Quay lại cửa hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
