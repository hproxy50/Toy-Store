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

const Header = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsDropdownOpen(false); 
    navigate("/login");
  };

  // HÀM MỚI: Tự động tìm kiếm ngay khi gõ
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchTerm(text);
    
    // Ghi đè URL ngay lập tức bằng text mới gõ (dùng replace: true để không tạo rác trong lịch sử trình duyệt)
    if (text.trim() !== "") {
      navigate(`/?search=${encodeURIComponent(text)}`, { replace: true });
    } else {
      // Nếu xóa trắng ô tìm kiếm thì quay lại trang chủ mặc định
      navigate(`/`, { replace: true });
    }
  };

  return (
    <header className="global-header">
      <div className="header-container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Logo */}
        <Link to="/" className="header-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img 
            src="https://azgundam.com/wp-content/uploads/2023/12/az-gundam-new-logo-2023-website-logo.jpg" 
            alt="AZ Gundam Logo" 
            style={{ maxHeight: '60px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
          />
        </Link>

        {/* Search Bar - Bỏ handleSearchSubmit ở onSubmit để tránh reload/lỗi */}
        <form className="header-search" onSubmit={(e) => e.preventDefault()} style={{ flexGrow: 1 }}>
          <input
            type="text"
            placeholder="Bạn cần tìm đồ chơi gì?"
            value={searchTerm}
            onChange={handleSearchChange} /* Gắn hàm auto-search vào đây */
            style={{ width: '100%' }}
          />
          {/* Nút kính lúp giờ chỉ để trang trí cho đẹp, không cần ấn nữa */}
          <button type="button"><i className="fa-solid fa-magnifying-glass"></i></button>
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
            <div 
              className="action-item user-dropdown-container" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            >
              <i className="fa-regular fa-user"></i>
              <span className="user-name-text">Hi, {currentUser.name}</span>
              
              {isDropdownOpen && (
                <div className="user-dropdown-menu">
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
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
  );
};

export default Header;