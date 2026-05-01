import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/az-gundam-new-logo-2023-website-logo.jpg";

const HeaderBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="logo" onClick={() => navigate("/")}>
        <img src={logo} alt="logo" />
        <span>AZ Gundam Store</span>
      </div>

      <div className="nav">
        <button onClick={() => navigate("/")}>Trang chủ</button>
        <button onClick={() => navigate("/cart")}>Giỏ hàng</button>
        <button onClick={() => navigate("/orders")}>Đơn hàng</button>
      </div>
    </div>
  );
};

export default HeaderBar;