import React, { useState, useEffect } from "react";

interface Toy {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");

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

    setFormData({ ...formData, [name]: parsedValue });
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

  const filteredAndSortedToys = toys
    .filter((toy) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        toy.name.toLowerCase().includes(lowerSearchTerm) ||
        toy.category.toLowerCase().includes(lowerSearchTerm)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "price_asc") return a.price - b.price;
      if (sortOrder === "price_desc") return b.price - a.price;
      if (sortOrder === "name_asc") return a.name.localeCompare(b.name);
      if (sortOrder === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "1000px" }}>
      <h2>Quản Lý Sản Phẩm</h2>

      <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="price_asc">Giá: thấp đến cao</option>
          <option value="price_desc">Giá: cao đến thấp</option>
          <option value="name_asc">Tên: Từ A đến Z</option>
          <option value="name_desc">Tên: Từ Z đến A</option>
        </select>
      </div>

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
            backgroundColor: "white",
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
          backgroundColor: "white",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px", width: "80px", textAlign: "center" }}>Hình ảnh</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tên</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Số lượng</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Giá</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Danh mục</th>
            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedToys.length > 0 ? (
            filteredAndSortedToys.map((toy) => (
              <tr key={toy.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
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
                    <span style={{ fontSize: "12px", color: "gray" }}>Chưa có ảnh</span>
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{toy.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <span style={{ fontWeight: "bold", color: toy.quantity === 0 ? "red" : "black" }}>
                    {toy.quantity}
                  </span>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {toy.price.toLocaleString("vi-VN")} đ
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{toy.category}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                  <button
                    onClick={() => handleEditClick(toy)}
                    style={{ marginRight: "10px", padding: "5px 10px", cursor: "pointer" }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(toy.id)}
                    style={{ padding: "5px 10px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ border: "1px solid #ddd", padding: "20px", textAlign: "center", color: "gray" }}>
                Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductManager;