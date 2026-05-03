import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const ProductPage = () => {
  const [toys, setToys] = useState<Toy[]>([]);
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("search") || "";

  const fetchToys = async () => {
    try {
      const response = await fetch("http://localhost:3000/toys");
      const data = await response.json();
      setToys(data);
    } catch (error) {
      console.error(error);
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

    fetchToys();
  }, [navigate]);

  const handleAddToCart = async (toy: Toy) => {
    if (toy.quantity <= 0) return;

    try {
      await fetch(`http://localhost:3000/toys/${toy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: toy.quantity - 1,
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

      setToys((prev) =>
        prev.map((t) =>
          t.id === toy.id ? { ...t, quantity: t.quantity - 1 } : t
        )
      );

      alert(`${toy.name} đã được thêm vào giỏ hàng!`);
    } catch (error) {
      console.error(error);
    }
  };

  const availableCategories = Array.from(new Set(toys.map((toy) => toy.category)));

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredAndSortedToys = toys
    .filter((toy) => toy.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((toy) =>
      selectedCategories.length === 0
        ? true
        : selectedCategories.includes(toy.category)
    )
    .sort((a, b) => {
      if (sortOrder === "price_asc") return a.price - b.price;
      if (sortOrder === "price_desc") return b.price - a.price;
      if (sortOrder === "name_asc") return a.name.localeCompare(b.name);
      if (sortOrder === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className="product-page-container">
      
      <div className="filter-sort-bar">
        <div className="filter-left">
          <h2 className="filter-title">ĐỒ CHƠI NỔI BẬT</h2>
          
          {availableCategories.length > 0 && (
            <div className="category-links">
              {availableCategories.map((category, index) => (
                <React.Fragment key={category}>
                  <span
                    className={`category-link ${selectedCategories.includes(category) ? "active" : ""}`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </span>
                  {index < availableCategories.length - 1 && (
                    <span className="separator">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="filter-right">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="">Lọc theo giá</option>
            <option value="price_asc">Giá: thấp đến cao</option>
            <option value="price_desc">Giá: cao đến thấp</option>
            <option value="name_asc">Tên: Từ A đến Z</option>
            <option value="name_desc">Tên: Từ Z đến A</option>
          </select>
        </div>
      </div>

      <div className="product-list">
        {filteredAndSortedToys.map((toy) => (
          <div key={toy.id} className="product-card">
            
            {/* Wrapper chứa ảnh và nhãn trạng thái đè lên ảnh */}
            <div className="product-image-wrapper" onClick={() => navigate(`/product/${toy.id}`)}>
              <img src={toy.image} alt={toy.name} className="product-image clickable" />
              
              <div className={`stock-badge ${toy.quantity > 0 ? "in-stock" : "out-stock"}`}>
                <i className="fa-solid fa-bolt"></i> 
                {toy.quantity > 0 ? "Đang sẵn hàng" : "Hết hàng"}
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="product-info">
              <h3 className="product-name clickable" onClick={() => navigate(`/product/${toy.id}`)}>
                {toy.name}
              </h3>
              
              <p className="product-price">
                {toy.price.toLocaleString("vi-VN")} <u>đ</u>
              </p>

              <p className="product-category">{toy.category}</p>

              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(toy)}
                disabled={toy.quantity <= 0}
              >
                {toy.quantity > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
              </button>
            </div>
            
          </div>
        ))}

        {toys.length === 0 && <p className="loading-text">Đang tải dữ liệu sản phẩm...</p>}
        {toys.length > 0 && filteredAndSortedToys.length === 0 && (
          <p className="loading-text no-results">Không tìm thấy sản phẩm nào phù hợp!</p>
        )}
      </div>
    </div>
  );
};

export default ProductPage;