import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    address: "", // Thêm trường địa chỉ
    phone: "",   // Thêm trường số điện thoại
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
        `http://localhost:3000/users?email=${formData.email}`,
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
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Đăng Ký Khách Hàng</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Họ và tên của bạn"
          required
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Tên tài khoản(email)"
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="Password"
          placeholder="Mật khẩu"
          required
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        
        <input
          type="tel"
          placeholder="Số điện thoại"
          required
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <input
          type="text"
          placeholder="Địa chỉ giao hàng mặc định"
          required
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "blue",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Đăng Ký
        </button>
      </form>
    </div>
  );
};

export default Register;