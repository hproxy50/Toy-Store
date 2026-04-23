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
  address?: string;
  phone?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const ProductPage = () => {
  const [toys, setToys] = useState<Toy[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const navigate = useNavigate();
  const { addToCart } = useCart();

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

    setCurrentUser(user);
    fetchToys();
  }, [navigate]);

  useEffect(() => {
    if (isHistoryOpen && currentUser) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`http://localhost:3000/orders?userId=${currentUser.id}`);
          const data = await res.json();
          const orders = Array.isArray(data) ? data : data.data || [];

          orders.sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setOrderHistory(orders);
        } catch (error) {
          console.error(error);
        }
      };
      fetchHistory();
    }
  }, [isHistoryOpen, currentUser]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "status-delivered";
      case "Đã xử lý":
        return "status-processing";
      default:
        return "status-pending";
    }
  };

  const openProfileModal = () => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        address: currentUser.address || "",
        phone: currentUser.phone || "",
      });
      setIsProfileOpen(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const response = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        alert("Cập nhật thông tin cá nhân thành công!");
        setIsProfileOpen(false);
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <div className="product-page-container">
      <div className="header">
        <h2>Cửa Hàng Đồ Chơi</h2>
        {currentUser && (
          <div className="user-info">
            <div className="user-profile-btn" onClick={openProfileModal} title="Chỉnh sửa thông tin cá nhân">
              <i className="fa-regular fa-user user-icon"></i>
              <span>Xin chào, <strong>{currentUser.name}</strong>!</span>
            </div>

            <i
              className="fa-solid fa-clock-rotate-left history-icon"
              title="Lịch sử đơn hàng"
              onClick={() => setIsHistoryOpen(true)}
            ></i>

            <a href="/cart" className="cart-icon">🛒</a>
            <button className="logout-btn" onClick={handleLogout}>Đăng Xuất</button>
          </div>
        )}
      </div>

      <div className="search-sort-bar">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm đồ chơi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
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

      {isHistoryOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-history">
            <button className="modal-close-btn" onClick={() => setIsHistoryOpen(false)}>&times;</button>
            <h2 className="modal-title">Lịch sử đặt hàng của bạn</h2>

            {orderHistory.length === 0 ? (
              <p className="modal-empty-text">Bạn chưa có đơn hàng nào.</p>
            ) : (
              <div className="order-list">
                {orderHistory.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <span className="order-id">Mã đơn: #{order.id}</span>
                        <span className="order-date">Ngày đặt: {formatDate(order.createdAt)}</span>
                      </div>
                      <span className={`order-status ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-items-container">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="order-item-img" />
                          ) : (
                            <div className="order-item-placeholder"></div>
                          )}
                          <div className="order-item-details">
                            <div className="order-item-name">{item.name}</div>
                            <div className="order-item-qty">x{item.quantity}</div>
                          </div>
                          <div className="order-item-price">
                            {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <span className="order-total-label">Thành tiền: </span>
                      <strong className="order-total-price">
                        {order.totalAmount.toLocaleString("vi-VN")} đ
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-profile">
            <button className="modal-close-btn" onClick={() => setIsProfileOpen(false)}>&times;</button>
            <h2 className="modal-title">Thông Tin Cá Nhân</h2>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Họ và tên:</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại:</label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ giao hàng mặc định:</label>
                <input
                  type="text"
                  required
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" className="submit-btn">Lưu Thay Đổi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;