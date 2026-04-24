import React, { useState, useEffect } from "react";
import "../../Css/AdminCss/ProductManager.css";

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

  // SỬA: Cho phép price và quantity nhận chuỗi rỗng lúc ban đầu thay vì luôn ép số 0
  const [formData, setFormData] = useState({
    name: "",
    price: "" as number | string,
    category: "",
    image: "",
    quantity: "" as number | string,
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
      // SỬA: Loại bỏ các ký tự không phải là số (vd: dấu chấm). Nếu xóa hết thì gán chuỗi rỗng.
      const rawValue = value.replace(/\D/g, "");
      parsedValue = rawValue === "" ? "" : Number(rawValue);
    } else if (name === "quantity") {
      // SỬA: Cho phép xóa rỗng, nếu có số thì phân tích thành số nguyên
      parsedValue = value === "" ? "" : Math.max(0, parseInt(value, 10));
    }

    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // SỬA: Đảm bảo format gửi đi lên API chắc chắn là số nguyên
    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      quantity: Number(formData.quantity) || 0,
    };

    if (editId) {
      await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditId(null);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    // SỬA: Đặt lại chuỗi rỗng thay vì số 0
    setFormData({ name: "", price: "", category: "", image: "", quantity: "" });
    fetchToys();
    setShowForm(false);
  };

  const handleEditClick = (toy: Toy) => {
    setFormData({
      name: toy.name,
      price: toy.price,
      category: toy.category,
      image: toy.image || "",
      quantity: toy.quantity || 0, // Lúc edit thì hiển thị số thực tế
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
    <div className="product-manager-container">
      <h2>Quản Lý Sản Phẩm</h2>

      <div className="controls-wrapper">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="filter-select"
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
              price: "",
              category: "",
              image: "",
              quantity: "",
            });
          }
          setShowForm(!showForm);
        }}
        className={`btn btn-toggle ${showForm ? "close" : ""}`}
      >
        {showForm ? "- Đóng Form" : "+ Thêm Mới"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <h3>{editId ? "Sửa Đồ Chơi" : "Thêm Đồ Chơi Mới"}</h3>

          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Tên đồ chơi"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="url"
              name="image"
              placeholder="Link ảnh (URL)"
              value={formData.image}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="quantity"
              placeholder="Số lượng"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="0"
              step="1"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="price"
              placeholder="Giá tiền"
              value={
                formData.price !== ""
                  ? Number(formData.price).toLocaleString("vi-VN")
                  : ""
              }
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="category"
              placeholder="Danh mục (Ví dụ: Lego, Xe cộ...)"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="form-input"
            />
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
                  name: "",
                  price: "",
                  category: "",
                  image: "",
                  quantity: "",
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

      <table className="products-table">
        <thead>
          <tr className="table-header-row">
            <th className="th-image">Hình ảnh</th>
            <th>Tên</th>
            <th>Số lượng</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th className="td-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedToys.length > 0 ? (
            filteredAndSortedToys.map((toy) => (
              <tr key={toy.id}>
                <td className="td-center">
                  {toy.image ? (
                    <img
                      src={toy.image}
                      alt={toy.name}
                      className="product-img"
                    />
                  ) : (
                    <span className="no-img-text">Chưa có ảnh</span>
                  )}
                </td>
                <td>{toy.name}</td>
                <td>
                  <span
                    className={`quantity-text ${
                      toy.quantity === 0 ? "out-of-stock" : ""
                    }`}
                  >
                    {toy.quantity}
                  </span>
                </td>
                <td>{toy.price.toLocaleString("vi-VN")} đ</td>
                <td>{toy.category}</td>
                <td className="td-center">
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditClick(toy)}
                      className="btn btn-edit"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(toy.id)}
                      className="btn btn-delete"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="td-empty">
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
