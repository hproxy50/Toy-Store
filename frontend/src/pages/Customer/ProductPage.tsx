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
  
  // State cho Tìm kiếm, Sắp xếp và Lọc danh mục
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const navigate = useNavigate();
  const { addToCart } = useCart();

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
    fetchToys();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/login");
  };

  const handleAddToCart = async (toy: Toy) => {
    if (toy.quantity <= 0) return;

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

  // ✅ 1. Lấy danh sách các danh mục duy nhất từ dữ liệu đồ chơi để tạo Checkbox
  const availableCategories = Array.from(new Set(toys.map(toy => toy.category)));

  // ✅ 2. Hàm xử lý khi người dùng tích/bỏ tích danh mục
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) // Bỏ tích thì xóa khỏi mảng
        : [...prev, category]              // Tích vào thì thêm vào mảng
    );
  };

  // ✅ 3. Xử lý logic Lọc (Tên + Danh mục) và Sắp xếp (Giá + Tên)
  const filteredAndSortedToys = toys
    .filter((toy) => 
      // Lọc theo tên
      toy.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((toy) => 
      // Lọc theo danh mục (nếu mảng rỗng thì hiển thị tất cả, ngược lại chỉ hiện đồ chơi thuộc danh mục được chọn)
      selectedCategories.length === 0 ? true : selectedCategories.includes(toy.category)
    )
    .sort((a, b) => {
      // Sắp xếp
      if (sortOrder === "price_asc") return a.price - b.price;
      if (sortOrder === "price_desc") return b.price - a.price;
      if (sortOrder === "name_asc") return a.name.localeCompare(b.name);
      if (sortOrder === "name_desc") return b.name.localeCompare(a.name);
      return 0; 
    });

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

      {/* ✅ Giao diện Thanh công cụ Tìm kiếm & Sắp xếp */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm đồ chơi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="price_asc">Giá: Từ rẻ đến đắt</option>
          <option value="price_desc">Giá: Từ đắt đến rẻ</option>
          <option value="name_asc">Tên: Từ A đến Z</option>
          <option value="name_desc">Tên: Từ Z đến A</option>
        </select>
      </div>

      {/* ✅ Giao diện Lọc theo Danh mục (Checkbox) */}
      {availableCategories.length > 0 && (
        <div style={{ marginBottom: "25px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #eee" }}>
          <strong style={{ display: "block", marginBottom: "10px" }}>Lọc theo danh mục:</strong>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            {availableCategories.map(category => (
              <label key={category} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="product-list">
        {filteredAndSortedToys.map((toy) => (
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
        {toys.length > 0 && filteredAndSortedToys.length === 0 && (
          <p className="loading-text" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            Không tìm thấy sản phẩm nào phù hợp!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductPage;