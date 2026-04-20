import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/az-gundam-new-logo-2023-website-logo.jpg';
import '../Css/AdminCss/AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* 1. SIDEBAR */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          Admin Panel
        </div>
        <div className="admin-nav">
          {/* Dùng NavLink để nó tự động có class "active" khi đang ở đúng trang đó */}
          <NavLink to="/admin/products" className="admin-nav-link">
            📦 Quản lý Sản phẩm
          </NavLink>
          {/* Các trang dự kiến thêm sau này */}
          <NavLink to="/admin/orders" className="admin-nav-link">
            🛒 Quản lý Đơn hàng
          </NavLink>
          <NavLink to="/admin/users" className="admin-nav-link">
            👥 Quản lý Người dùng
          </NavLink>
        </div>
      </div>

      {/* 2. CỘT PHẢI (HEADER + CONTENT) */}
      <div className="admin-main">
        {/* Header (Top bar) */}
        <div className="admin-header">
          <div className="logo">
            <img src={logo} alt="logo" style={{ height: '40px' }} />
          </div>
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Đăng Xuất
          </button>
        </div>

        {/* Nội dung thay đổi (Form/Table) sẽ hiển thị ở đây thông qua Outlet */}
        <div className="admin-content">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;