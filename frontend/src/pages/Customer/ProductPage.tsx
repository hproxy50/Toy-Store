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

  // Lấy từ khóa tìm kiếm từ URL do Header truyền sang
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
    // Kiểm tra quyền truy cập trang khách hàng
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
      {/* Search Input đã chuyển lên Header, chỉ giữ lại Sort Select ở góc phải */}
      <div className="search-sort-bar" style={{ justifyContent: "flex-end" }}>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-select"
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="price_asc">Giá: thấp đến cao</option>
          <option value="price_desc">Giá: cao đến thấp</option>
          <option value="name_asc">Tên: Từ A đến Z</option>
          <option value="name_desc">Tên: Từ Z đến A</option>
        </select>
      </div>

      {availableCategories.length > 0 && (
        <div className="category-filter-container">
          <strong className="category-title">Lọc theo danh mục:</strong>
          <div className="category-list">
            {availableCategories.map((category) => (
              <label key={category} className="category-label">
                <input
                  type="checkbox"
                  className="category-checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="product-list">
        {filteredAndSortedToys.map((toy) => (
          <div key={toy.id} className={`product-card ${toy.quantity <= 0 ? 'out-of-stock' : ''}`}>
            <div className="product-image-wrapper" onClick={() => navigate(`/product/${toy.id}`)}>
              <img src={toy.image} alt={toy.name} className="product-image clickable" />
              {toy.quantity <= 0 && <div className="out-of-stock-overlay">Hết hàng</div>}
            </div>
            <h3 className="product-name clickable" onClick={() => navigate(`/product/${toy.id}`)}>
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
        {toys.length > 0 && filteredAndSortedToys.length === 0 && (
          <p className="loading-text no-results">Không tìm thấy sản phẩm nào phù hợp!</p>
        )}
      </div>
    </div>
  );
};

export default ProductPage;