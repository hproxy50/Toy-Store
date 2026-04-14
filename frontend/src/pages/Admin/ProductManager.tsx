import React, { useState, useEffect } from "react";
import logo from "../../assets/az-gundam-new-logo-2023-website-logo.jpg";
import "../../Css/App.css";

interface Toy {
  id: string;
  name: string;
  price: number;
  category: string;
}

const API_URL = "http://localhost:3000/toys";

function App() {
  const [toys, setToys] = useState<Toy[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "",
  });

  const [editId, setEditId] = useState<string | null>(null);

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
    setFormData({
      ...formData,
      [name]: name === "price" ? Number(value) : value, 
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

    setFormData({ name: "", price: 0, category: "" });
    fetchToys();
  };

  const handleEditClick = (toy: Toy) => {
    setFormData({ name: toy.name, price: toy.price, category: toy.category });
    setEditId(toy.id);
  };


  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đồ chơi này?")) {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      fetchToys(); 
    }
  };

  return (
    <div>
      <div className="upper">
        <div className="search-bar">
          <input type="text" placeholder="Tìm kiếm sản phẩm" />
        </div>
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="user">
          <i className="fa-solid fa-circle-user"></i>
          <i className="fa-solid fa-cart-shopping"></i>
        </div>
      </div>
      <div className="middle">
        <div
          style={{
            padding: "20px",
            fontFamily: "sans-serif",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1>Quản Lý Đồ Chơi</h1>

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
                  setFormData({ name: "", price: 0, category: "" });
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

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Tên
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
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {toy.name}
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

export default App;
