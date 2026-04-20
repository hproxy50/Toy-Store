import React, { useState, useEffect } from "react";

// Khai báo kiểu dữ liệu cho User
interface User {
  id: string;
  email: string;
  password?: string; // Không bắt buộc hiển thị trên bảng, nhưng cần khi tạo/sửa
  name: string;
  role: string;
}

const API_URL = "http://localhost:3000/users";

function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "customer",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const usersList = Array.isArray(data) ? data : data.data || [];
      setUsers(usersList);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editId) {
      await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setEditId(null);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    
    setFormData({ email: "", password: "", name: "", role: "customer" });
    fetchUsers();
    setShowForm(false);
  };

  const handleEditClick = (user: User) => {
    setFormData({
      email: user.email,
      password: user.password || "",
      name: user.name,
      role: user.role,
    });
    setEditId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === id) {
        alert("Bạn không thể tự xóa tài khoản đang đăng nhập!");
        return;
      }
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchUsers();
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "1000px" }}>
      <h2>Quản Lý Người Dùng</h2>

      <button
        onClick={() => {
          if (showForm) {
            setEditId(null);
            setFormData({ email: "", password: "", name: "", role: "customer" });
          }
          setShowForm(!showForm);
        }}
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          backgroundColor: showForm ? "#6c757d" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {showForm ? "- Đóng Form" : "+ Thêm Tài Khoản"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: 'white' }}>
          <h3>{editId ? "Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}</h3>
          
          <div style={{ marginBottom: "10px" }}>
            <input type="text" name="name" placeholder="Tên hiển thị" value={formData.name} onChange={handleInputChange} required style={{ width: "100%", padding: "8px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input type="text" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required style={{ width: "100%", padding: "8px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input type="text" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleInputChange} required style={{ width: "100%", padding: "8px" }} />
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Vai trò (Role):</label>
            <select name="role" value={formData.role} onChange={handleInputChange} style={{ padding: "8px", borderRadius: "4px" }}>
              <option value="customer">Customer (Khách hàng)</option>
              <option value="admin">Admin (Quản trị viên)</option>
            </select>
          </div>

          <button type="submit" style={{ padding: "10px 20px", backgroundColor: editId ? "#ff9800" : "#4CAF50", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}>
            {editId ? "Cập Nhật" : "Thêm Mới"}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setFormData({ email: "", password: "", name: "", role: "customer" }); setShowForm(false); }} style={{ padding: "10px 20px", marginLeft: "10px", backgroundColor: "#f44336", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}>
              Hủy
            </button>
          )}
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ddd", padding: "12px" }}>Tên</th>
            <th style={{ border: "1px solid #ddd", padding: "12px" }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>Vai trò</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center", width: "150px" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{user.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px" }}>{user.email}</td>
              <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>
                <span style={{ 
                  padding: "4px 8px", 
                  borderRadius: "12px", 
                  fontSize: "12px", 
                  fontWeight: "bold",
                  backgroundColor: user.role === 'admin' ? '#ffeeba' : '#d4edda',
                  color: user.role === 'admin' ? '#856404' : '#155724'
                }}>
                  {user.role.toUpperCase()}
                </span>
              </td>
              <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>
                <button onClick={() => handleEditClick(user)} style={{ marginRight: "8px", padding: "6px 12px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "4px", cursor: "pointer" }}>Sửa</button>
                <button onClick={() => handleDelete(user.id)} style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManager;