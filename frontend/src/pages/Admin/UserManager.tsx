import React, { useState, useEffect } from "react";
import "../../Css/AdminCss/UserManager.css";

interface User {
  id: string;
  email: string;
  password?: string;
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

  const [searchTerm, setSearchTerm] = useState("");
  const [sortRole, setSortRole] = useState("");

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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

  const filteredAndSortedUsers = users
    .filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortRole === "admin_first") {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
      }
      if (sortRole === "customer_first") {
        if (a.role === "customer" && b.role !== "customer") return -1;
        if (a.role !== "customer" && b.role === "customer") return 1;
      }
      return 0;
    });

  return (
    <div className="user-manager-container">
      <h2>Quản Lý Người Dùng</h2>

      <div className="controls-wrapper">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortRole}
          onChange={(e) => setSortRole(e.target.value)}
          className="filter-select"
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="admin_first">Vai trò: Admin xếp trước</option>
          <option value="customer_first">Vai trò: Khách hàng xếp trước</option>
        </select>
      </div>

      <button
        onClick={() => {
          if (showForm) {
            setEditId(null);
            setFormData({
              email: "",
              password: "",
              name: "",
              role: "customer",
            });
          }
          setShowForm(!showForm);
        }}
        className={`btn btn-toggle ${showForm ? "close" : ""}`}
      >
        {showForm ? "- Đóng Form" : "+ Thêm Tài Khoản"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="user-form">
          <h3>{editId ? "Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}</h3>

          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Tên hiển thị"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="text" // Có thể đổi thành type="password" nếu muốn ẩn mật khẩu
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group-spaced">
            <label className="form-label">Vai trò (Role):</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="customer">Customer (Khách hàng)</option>
              <option value="admin">Admin (Quản trị viên)</option>
            </select>
          </div>

          <button
            type="submit"
            className={`btn btn-submit ${editId ? "update" : ""}`}
          >
            {editId ? "Cập Nhật" : "Thêm Mới"}
          </button>
          
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setFormData({
                  email: "",
                  password: "",
                  name: "",
                  role: "customer",
                });
                setShowForm(false);
              }}
              className="btn btn-cancel"
            >
              Hủy
            </button>
          )}
        </form>
      )}

      <table className="users-table">
        <thead>
          <tr className="table-header-row">
            <th>Tên</th>
            <th>Email</th>
            <th className="th-center">Vai trò</th>
            <th className="th-action">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedUsers.length > 0 ? (
            filteredAndSortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="td-center">
                  <span
                    className={`role-badge ${
                      user.role === "admin" ? "admin" : "customer"
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="td-center">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="btn btn-edit"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="btn btn-delete"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="td-empty">
                Không tìm thấy người dùng nào phù hợp!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserManager;