import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/az-gundam-new-logo-2023-website-logo.jpg";
import "../Css/AdminCss/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.name) {
        setAdminName(currentUser.name);
      }
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <i className="fa-solid fa-shield-halved brand-icon"></i>
          <span>AZ Admin Panel</span>
        </div>

        <div className="admin-sidebar-profile">
          <div className="profile-avatar">
            <i className="fa-solid fa-user-tie"></i>
          </div>
          <div className="profile-info">
            <span className="profile-name">{adminName}</span>
            <span className="profile-role">Quản trị viên</span>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-group-title">QUẢN LÝ CỬA HÀNG</div>

          <NavLink to="/admin/products" className="admin-nav-link">
            <i className="fa-solid fa-box-open nav-icon"></i>
            <span>Sản phẩm</span>
          </NavLink>

          <NavLink to="/admin/orders" className="admin-nav-link">
            <i className="fa-solid fa-cart-shopping nav-icon"></i>
            <span>Đơn hàng</span>
          </NavLink>

          <NavLink to="/admin/users" className="admin-nav-link">
            <i className="fa-solid fa-users nav-icon"></i>
            <span>Người dùng</span>
          </NavLink>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <img src={logo} alt="AZ Gundam Logo" className="header-logo" />
          </div>

          <div className="header-right">
            <div className="header-divider"></div>
            <div className="header-greeting">
              Xin chào, <strong>{adminName}</strong>!
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Khu vực hiển thị component con */}
        <div className="admin-content-wrapper">
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
