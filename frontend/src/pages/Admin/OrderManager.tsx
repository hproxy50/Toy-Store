import React, { useState, useEffect } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Khai báo thêm thuộc tính ảnh
}

interface CustomerInfo {
  fullName: string;
  address: string;
  phone: string;
  paymentMethod: string;
}

interface Order {
  id: string;
  userId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const API_URL = "http://localhost:3000/orders";

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const ordersList = Array.isArray(data) ? data : data.data || [];
      setOrders(ordersList);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    currentOrder: Order,
    newStatus: string,
  ) => {
    try {
      const updatedOrder = { ...currentOrder, status: newStatus };

      await fetch(`${API_URL}/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedOrder),
      });

      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      alert("Đã xảy ra lỗi khi cập nhật đơn hàng.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa đơn hàng này? Thao tác này không thể hoàn tác.",
      )
    ) {
      try {
        await fetch(`${API_URL}/${orderId}`, {
          method: "DELETE",
        });

        fetchOrders();
      } catch (error) {
        console.error("Lỗi khi xóa đơn hàng:", error);
        alert("Đã xảy ra lỗi khi xóa đơn hàng.");
      }
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = order.customerInfo?.fullName || "";
      const matchesSearch = fullName.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "date_desc") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortOrder === "date_asc") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortOrder === "price_desc") {
        return b.totalAmount - a.totalAmount;
      }
      if (sortOrder === "price_asc") {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return { bg: "#cce5ff", text: "#004085" };
      case "Đã xử lý":
        return { bg: "#d4edda", text: "#155724" };
      case "Đang xử lý":
      default:
        return { bg: "#fff3cd", text: "#856404" };
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "1200px" }}>
      <h2>Quản Lý Đơn Hàng</h2>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Tìm kiếm theo tên người đặt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đã xử lý">Đã xử lý</option>
          <option value="Đã giao">Đã giao</option>
        </select>

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
          <option value="date_desc">Ngày: Mới nhất đến cũ nhất</option>
          <option value="date_asc">Ngày: Cũ nhất đến mới nhất</option>
          <option value="price_desc">Tổng tiền: Cao đến thấp</option>
          <option value="price_asc">Tổng tiền: Thấp đến cao</option>
        </select>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ddd", padding: "12px", width: "80px" }}>Mã Đơn</th>
            {/* Gộp chung Thông tin KH và Sản phẩm vào một cột lớn cho thoáng */}
            <th style={{ border: "1px solid #ddd", padding: "12px", width: "45%" }}>Thông Tin Đơn Hàng</th>
            <th style={{ border: "1px solid #ddd", padding: "12px" }}>Ngày Đặt</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>Tổng Tiền</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>Trạng Thái</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedOrders.length > 0 ? (
            filteredAndSortedOrders.map((order) => {
              const statusColors = getStatusColor(order.status);
              return (
                <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ border: "1px solid #ddd", padding: "12px", fontSize: "12px", color: "#666", verticalAlign: "top" }}>
                    {order.id}
                  </td>
                  
                  {/* CỘT THÔNG TIN ĐƠN HÀNG (KHÁCH HÀNG + SẢN PHẨM) */}
                  <td style={{ border: "1px solid #ddd", padding: "12px", verticalAlign: "top" }}>
                    
                    {/* Phần 1: Thông tin người mua */}
                    <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px dashed #ddd" }}>
                      <strong style={{ fontSize: "15px" }}>{order.customerInfo?.fullName}</strong>
                      <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>
                        <span style={{ display: "inline-block", marginRight: "15px" }}>
                          <i className="fa-solid fa-phone" style={{ marginRight: "4px" }}></i> 
                          {order.customerInfo?.phone}
                        </span>
                        <span>
                          <i className="fa-solid fa-location-dot" style={{ marginRight: "4px" }}></i> 
                          {order.customerInfo?.address}
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>
                         <span style={{ fontWeight: "500" }}>Thanh toán:</span> {order.customerInfo?.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}
                      </div>
                    </div>

                    {/* Phần 2: Danh sách sản phẩm */}
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "bold", color: "#888", marginBottom: "8px", textTransform: "uppercase" }}>
                        Sản phẩm đã đặt ({order.items?.length || 0})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {order.items?.map((item, index) => (
                          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#f8f9fa", padding: "6px", borderRadius: "6px" }}>
                            {/* Ảnh thu nhỏ */}
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid #eee" }} 
                              />
                            ) : (
                              <div style={{ width: "40px", height: "40px", backgroundColor: "#e9ecef", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#aaa" }}>No Img</div>
                            )}
                            
                            {/* Tên và Số lượng */}
                            <div style={{ flex: 1, fontSize: "13px" }}>
                              <div style={{ fontWeight: "500", color: "#333", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {item.name}
                              </div>
                              <div style={{ color: "#e83e8c", fontWeight: "bold", marginTop: "2px" }}>
                                {item.price?.toLocaleString("vi-VN")} đ <span style={{ color: "#666", fontWeight: "normal", fontSize: "12px" }}>x{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </td>
                  
                  <td style={{ border: "1px solid #ddd", padding: "12px", verticalAlign: "top" }}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right", fontWeight: "bold", verticalAlign: "top", color: "#d32f2f", fontSize: "16px" }}>
                    {order.totalAmount?.toLocaleString("vi-VN")} đ
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center", verticalAlign: "top" }}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        display: "inline-block",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center", verticalAlign: "top" }}>
                    {order.status === "Đang xử lý" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, order, "Đã xử lý")}
                        style={{
                          width: "100%",
                          marginBottom: "8px",
                          padding: "8px 12px",
                          backgroundColor: "#ffc107",
                          color: "black",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        Xử lý đơn
                      </button>
                    )}
                    {(order.status === "Đang xử lý" || order.status === "Đã xử lý") && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, order, "Đã giao")}
                        style={{
                          width: "100%",
                          marginBottom: "8px",
                          padding: "8px 12px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        Đã giao hàng
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Xóa đơn
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#888",
                  fontSize: "16px"
                }}
              >
                Không tìm thấy đơn hàng nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderManager;