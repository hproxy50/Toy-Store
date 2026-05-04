import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Css/AuthCss/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    address: "",
    phone: "",
  });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUser = {
      ...formData,
      role: "customer",
    };

    try {
      const checkRes = await fetch(
        `http://localhost:3000/users?email=${formData.email}`
      );
      const existUser = await checkRes.json();

      if (existUser.length > 0) {
        alert("Email đã được sử dụng!");
        return;
      }

      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      alert("Đăng ký thành công! Chuyển hướng đến Đăng nhập...");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    }
  };

  return (
    <div className="login-page"> {/* Dùng lại nền ảnh từ Login */}
      <div className="login-card"> {/* Dùng lại thẻ kính mờ */}
        <h2 className="login-title">Đăng Ký Khách Hàng</h2>
        
        <form className="login-form" onSubmit={handleRegister}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="login-input"
            />
          </div>
          
          <div className="input-group">
            <input
              type="text" // Khuyên dùng type="email" ở đây để form tự validate
              placeholder="Tên tài khoản (Email)"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="login-input"
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="login-input"
            />
          </div>
          
          <div className="input-group">
            <input
              type="tel"
              placeholder="Số điện thoại"
              required
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Địa chỉ giao hàng mặc định"
              required
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="login-input"
            />
          </div>

          <button type="submit" className="login-button">
            Đăng Ký
          </button>
        </form>

        {/* Thêm link điều hướng ngược lại trang đăng nhập cho chuẩn UX */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px" }}>
            Đã có tài khoản?{" "}
          </span>
          <Link 
            to="/login" 
            style={{ color: "#fff", fontWeight: "bold", textDecoration: "none" }}
          >
            Đăng nhập ngay
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;