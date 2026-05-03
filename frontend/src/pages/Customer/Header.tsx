import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../Css/Customer/Header.css";

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

const Header = () => {
  const navigate = useNavigate();
  const { cart } = useCart(); // Lấy giỏ hàng từ context
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", address: "", phone: "" });

  // Tính tổng số lượng sản phẩm trong giỏ
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (isHistoryOpen && currentUser) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`http://localhost:3000/orders?userId=${currentUser.id}`);
          const data = await res.json();
          const orders = Array.isArray(data) ? data : data.data || [];
          orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Đẩy keyword lên URL để ProductPage đọc và lọc
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
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
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <header className="global-header">
        <div className="header-container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Logo */}
          <Link to="/" className="header-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src="https://azgundam.com/wp-content/uploads/2023/12/az-gundam-new-logo-2023-website-logo.jpg" 
              alt="AZ Gundam Logo" 
              // 2. THÊM mixBlendMode ĐỂ XÓA NỀN TRẮNG CỦA ẢNH LOGO JPG
              style={{ maxHeight: '60px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
            />
          </Link>

          {/* Search Bar kéo dài ra chiếm chỗ trống - Style giữ nguyên, CSS handle giao diện */}
          <form className="header-search" onSubmit={handleSearchSubmit} style={{ flexGrow: 1 }}>
            <input
              type="text"
              placeholder="Bạn cần tìm đồ chơi gì?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
            <button type="submit"><i className="fa-solid fa-magnifying-glass"></i></button>
          </form>

          {/* Contact / Info */}
          <div className="header-info-group">
            <div className="info-item hidden-mobile">
              <i className="fa-solid fa-headset"></i>
              <div>
                <span className="info-title">Hotline</span>
                <strong className="info-desc">6677.1508</strong>
              </div>
            </div>
            <div className="info-item hidden-mobile">
              <i className="fa-solid fa-location-dot"></i>
              <div>
                <span className="info-title">Hệ thống</span>
                <a href="https://maps.app.goo.gl/KsvWuKL3qSkiphzX6" target="_blank" rel="noopener noreferrer" className="info-desc">
                  <strong>Showroom</strong>
                </a>
              </div>
            </div>
          </div>

          <div className="header-actions">  

            <Link to="/cart" className="action-item cart-action">
              <div className="cart-icon-wrapper">
                <i className="fa-solid fa-cart-shopping"></i>
                <span className="cart-badge">{cartCount}</span>
              </div>
              <span>Giỏ hàng</span>
            </Link>

            {currentUser ? (
              <div className="action-item user-dropdown-container">
                <i className="fa-regular fa-user"></i>
                <span className="user-name-text">Hi, {currentUser.name}</span>
                <div className="user-dropdown-menu">
                  <button onClick={openProfileModal}>Thông tin</button>
                  <button onClick={() => setIsHistoryOpen(true)}>Lịch sử mua hàng</button>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="action-item login-btn-red">
                <i className="fa-regular fa-user"></i>
                <span>Đăng<br/>nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --- PHẦN MODAL GIỮ NGUYÊN --- */}
      {isHistoryOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-history">
            <button className="modal-close-btn" onClick={() => setIsHistoryOpen(false)}>×</button>
            <h2 className="modal-title">Lịch sử đặt hàng</h2>
            {orderHistory.length === 0 ? (
              <p>Bạn chưa có đơn hàng nào.</p>
            ) : (
              <div className="order-list">
                 {orderHistory.map((order) => (
                    <div key={order.id} className="order-card" style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '10px' }}>
                        <p><strong>Mã đơn:</strong> {order.id} | <strong>Ngày:</strong> {formatDate(order.createdAt)} | <strong>Trạng thái:</strong> {order.status}</p>
                        <p><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString("vi-VN")} đ</p>
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
             <button className="modal-close-btn" onClick={() => setIsProfileOpen(false)}>×</button>
             <h2 className="modal-title">Thông Tin Cá Nhân</h2>
             <form onSubmit={handleUpdateProfile}>
               <div className="form-group">
                 <label>Họ và tên:</label>
                 <input type="text" required value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="form-input"/>
               </div>
               <div className="form-group">
                 <label>Số điện thoại:</label>
                 <input type="tel" required value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="form-input"/>
               </div>
               <div className="form-group">
                 <label>Địa chỉ:</label>
                 <input type="text" required value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="form-input"/>
               </div>
               <button type="submit" className="submit-btn" style={{ background: '#e30019', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Lưu Thay Đổi</button>
             </form>
           </div>
         </div>
      )}
    </>
  );
};

export default Header;