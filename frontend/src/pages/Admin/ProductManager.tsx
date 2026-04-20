import React, { useState, useEffect } from "react";
import logo from "../../assets/az-gundam-new-logo-2023-website-logo.jpg";
import { useNavigate } from "react-router-dom";
import "../../Css/AdminCss/ProductPage.css";

interface Toy {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const API_URL = "http://localhost:3000/toys";

function ProductManager() {
  const [toys, setToys] = useState<Toy[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "",
    image: "",
    quantity: 0,
  });

  const [editId, setEditId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const fetchToys = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setToys(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchToys();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let parsedValue: string | number = value;

    if (name === "price") {
      parsedValue = Number(value);
    } else if (name === "quantity") {
      parsedValue = Math.max(0, parseInt(value || "0", 10));
    }

    setFormData({
      ...formData,
      [name]: parsedValue,
    });
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

    setFormData({ name: "", price: 0, category: "", image: "", quantity: 0 });
    fetchToys();

    setShowForm(false);
  };

  const handleEditClick = (toy: Toy) => {
    setFormData({
      name: toy.name,
      price: toy.price,
      category: toy.category,
      image: toy.image || "",
      quantity: toy.quantity || 0,
    });
    setEditId(toy.id);

    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đồ chơi này?")) {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchToys();
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");

    if (!userStr) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userStr);

    if (user.role !== "customer") {
      navigate(user.role === "admin" ? "/admin" : "/login");
      return;
    }

    setCurrentUser(user);
    fetchToys();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div>
      <div className="upper">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>Đăng Xuất</button>
        </div>
      </div>
      <div className="middle">
        <div
          style={{
            padding: "20px",
            fontFamily: "sans-serif",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1>Quản Lý Đồ Chơi</h1>

          <button
            onClick={() => {
              if (showForm) {
                setEditId(null);
                setFormData({
                  name: "",
                  price: 0,
                  category: "",
                  image: "",
                  quantity: 0,
                });
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
            {showForm ? "- Đóng Form" : "+ Thêm Mới"}
          </button>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{
                marginBottom: "30px",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h3>{editId ? "Sửa Đồ Chơi" : "Thêm Đồ Chơi Mới"}</h3>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Tên đồ chơi"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="url"
                  name="image"
                  placeholder="Link ảnh (URL)"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Số lượng"
                  value={
                    formData.quantity === 0 && !editId ? "" : formData.quantity
                  }
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1"
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="number"
                  name="price"
                  placeholder="Giá tiền"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  name="category"
                  placeholder="Danh mục (Ví dụ: Lego, Xe cộ...)"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: editId ? "#ff9800" : "#4CAF50",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {editId ? "Cập Nhật" : "Thêm Mới"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setFormData({
                      name: "",
                      price: 0,
                      category: "",
                      image: "",
                      quantity: 0,
                    });
                    setShowForm(false);
                  }}
                  style={{
                    padding: "10px 20px",
                    marginLeft: "10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
              )}
            </form>
          )}

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    width: "80px",
                    textAlign: "center",
                  }}
                >
                  Hình ảnh
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Tên
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Số lượng
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Giá
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Danh mục
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {toys.map((toy) => (
                <tr key={toy.id}>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {toy.image ? (
                      <img
                        src={toy.image}
                        alt={toy.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "12px", color: "gray" }}>
                        Chưa có ảnh
                      </span>
                    )}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {toy.name}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: toy.quantity === 0 ? "red" : "black",
                      }}
                    >
                      {toy.quantity}
                    </span>
                  </td>

                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {toy.price.toLocaleString("vi-VN")} đ
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {toy.category}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => handleEditClick(toy)}
                      style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(toy.id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lower"></div>
    </div>
  );
}

export default ProductManager;
