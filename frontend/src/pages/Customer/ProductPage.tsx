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

// 1. CẬP NHẬT: Thêm address và phone vào User
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

  // 2. THÊM MỚI: State cho Modal Hồ sơ cá nhân
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

  useEffect(() => {
    if (isHistoryOpen && currentUser) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(
            `http://localhost:3000/orders?userId=${currentUser.id}`,
          );
          const data = await res.json();
          const orders = Array.isArray(data) ? data : data.data || [];

          orders.sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          setOrderHistory(orders);
        } catch (error) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", error);
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
          t.id === toy.id ? { ...t, quantity: t.quantity - 1 } : t,
        ),
      );

      alert(`${toy.name} đã được thêm vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi thêm vào giỏ:", error);
    }
  };

  const availableCategories = Array.from(
    new Set(toys.map((toy) => toy.category)),
  );

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const filteredAndSortedToys = toys
    .filter((toy) => toy.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((toy) =>
      selectedCategories.length === 0
        ? true
        : selectedCategories.includes(toy.category),
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Đã giao":
        return { bg: "#d4edda", color: "#155724" };
      case "Đã xử lý":
        return { bg: "#cce5ff", color: "#004085" };
      default:
        return { bg: "#fff3cd", color: "#856404" };
    }
  };

  // 3. THÊM MỚI: Hàm mở Modal Profile
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

  // 4. THÊM MỚI: Hàm lưu thông tin cá nhân
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      // Dùng PATCH để chỉ cập nhật các trường được thay đổi
      const response = await fetch(
        `http://localhost:3000/users/${currentUser.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData),
        },
      );

      if (response.ok) {
        const updatedUser = await response.json();

        // Cập nhật state và localStorage
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        alert("Cập nhật thông tin cá nhân thành công!");
        setIsProfileOpen(false);
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      alert("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <div className="product-page-container">
      <div className="header">
        <h2>Cửa Hàng Đồ Chơi</h2>
        {currentUser && (
          <div className="user-info">
            {/* CẬP NHẬT: Cho phép bấm vào tên để mở Modal Profile */}
            <div
              onClick={openProfileModal}
              title="Chỉnh sửa thông tin cá nhân"
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                color: "#007bff",
              }}
            >
              <i
                className="fa-regular fa-user"
                style={{ marginRight: "5px" }}
              ></i>
              <span>
                Xin chào, <strong>{currentUser.name}</strong>!
              </span>
            </div>

            <i
              className="fa-solid fa-clock-rotate-left"
              title="Lịch sử đơn hàng"
              onClick={() => setIsHistoryOpen(true)}
              style={{
                fontSize: "24px",
                marginLeft: "15px",
                cursor: "pointer",
                color: "#007bff",
              }}
            ></i>

            <a
              href="/cart"
              style={{
                fontSize: "28px",
                marginLeft: "20px",
                textDecoration: "none",
              }}
            >
              🛒
            </a>
            <button className="logout-btn" onClick={handleLogout}>
              Đăng Xuất
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm đồ chơi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="price_asc">Giá: thấp đến cao</option>
          <option value="price_desc">Giá: cao đến thấp</option>
          <option value="name_asc">Tên: Từ A đến Z</option>
          <option value="name_desc">Tên: Từ Z đến A</option>
        </select>
      </div>

      {availableCategories.length > 0 && (
        <div
          style={{
            marginBottom: "25px",
            padding: "10px",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        >
          <strong style={{ display: "block", marginBottom: "10px" }}>
            Lọc theo danh mục:
          </strong>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            {availableCategories.map((category) => (
              <label
                key={category}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
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
            <p className="product-price">
              {toy.price.toLocaleString("vi-VN")} VNĐ
            </p>
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

        {toys.length === 0 && (
          <p className="loading-text">Đang tải dữ liệu sản phẩm...</p>
        )}
        {toys.length > 0 && filteredAndSortedToys.length === 0 && (
          <p
            className="loading-text"
            style={{ gridColumn: "1 / -1", textAlign: "center" }}
          >
            Không tìm thấy sản phẩm nào phù hợp!
          </p>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: LỊCH SỬ ĐƠN HÀNG */}
      {/* ======================================================== */}
      {isHistoryOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 30px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => setIsHistoryOpen(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#888",
              }}
            >
              &times;
            </button>

            <h2
              style={{
                borderBottom: "2px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Lịch sử đặt hàng của bạn
            </h2>

            {orderHistory.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: "16px",
                  padding: "30px 0",
                }}
              >
                Bạn chưa có đơn hàng nào.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {orderHistory.map((order) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <div
                      key={order.id}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#f8f9fa",
                          padding: "12px 15px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <div>
                          <span
                            style={{ fontWeight: "bold", marginRight: "15px" }}
                          >
                            Mã đơn: #{order.id}
                          </span>
                          <span style={{ color: "#666", fontSize: "14px" }}>
                            Ngày đặt: {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <span
                          style={{
                            padding: "5px 12px",
                            borderRadius: "15px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div style={{ padding: "15px" }}>
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "15px",
                              marginBottom:
                                index === order.items.length - 1 ? 0 : "15px",
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  border: "1px solid #eee",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  backgroundColor: "#eee",
                                  borderRadius: "4px",
                                }}
                              ></div>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: "500" }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: "13px", color: "#666" }}>
                                x{item.quantity}
                              </div>
                            </div>
                            <div
                              style={{ fontWeight: "bold", color: "#d32f2f" }}
                            >
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN",
                              )}{" "}
                              đ
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          padding: "12px 15px",
                          borderTop: "1px solid #ddd",
                          textAlign: "right",
                          backgroundColor: "#fff",
                        }}
                      >
                        <span style={{ fontSize: "15px" }}>Thành tiền: </span>
                        <strong style={{ fontSize: "18px", color: "#d32f2f" }}>
                          {order.totalAmount.toLocaleString("vi-VN")} đ
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CHỈNH SỬA THÔNG TIN CÁ NHÂN */}
      {/* ======================================================== */}
      {isProfileOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
              position: "relative",
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => setIsProfileOpen(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#888",
              }}
            >
              &times;
            </button>

            <h2
              style={{
                borderBottom: "2px solid #eee",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Thông Tin Cá Nhân
            </h2>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Họ và tên:
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Số điện thoại:
                </label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Địa chỉ giao hàng mặc định:
                </label>
                <input
                  type="text"
                  required
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Lưu Thay Đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
