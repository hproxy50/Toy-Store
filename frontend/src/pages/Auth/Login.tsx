import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import thêm Link ở đây
import "../../Css/AuthCss/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3000/users`);
      const result = await response.json();

      console.log("Toàn bộ Users lấy được:", result);
      const usersList = Array.isArray(result) ? result : result.data || [];
      const matchedUser = usersList.find(
        (u: any) => u.email === email.trim() && u.password === password.trim(),
      );

      if (matchedUser) {
        localStorage.setItem("currentUser", JSON.stringify(matchedUser));
        alert(`Đăng nhập thành công với vai trò: ${matchedUser.name}`);

        if (matchedUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        alert("Sai email hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Đăng Nhập</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>
          <button type="submit" className="login-button">
            Đăng Nhập
          </button>

          <div className="login-redirect">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
