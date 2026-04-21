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
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          Admin Panel
        </div>
        <div className="admin-nav">
          <NavLink to="/admin/products" className="admin-nav-link">
            Quản lý Sản phẩm
          </NavLink>
          <NavLink to="/admin/orders" className="admin-nav-link">
            Quản lý Đơn hàng
          </NavLink>
          <NavLink to="/admin/users" className="admin-nav-link">
            Quản lý Người dùng
          </NavLink>
        </div>
      </div>
      <div className="admin-main">
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
        <div className="admin-content">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;