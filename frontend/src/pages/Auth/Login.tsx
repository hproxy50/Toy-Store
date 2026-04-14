import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        (u: any) => u.email === email.trim() && u.password === password.trim()
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
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "green",
            color: "white",
          }}
        >
          Đăng Nhập
        </button>
      </form>
    </div>
  );
};

export default Login;
