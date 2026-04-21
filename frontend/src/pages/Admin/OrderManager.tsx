import React, { useState, useEffect } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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

  const handleUpdateStatus = async (orderId: string, currentOrder: Order) => {
    try {
      const updatedOrder = { ...currentOrder, status: "Đã xử lý" };

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
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này? Thao tác này không thể hoàn tác.")) {
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
      return fullName.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      if (sortOrder === "date_desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOrder === "date_asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "1200px" }}>
      <h2>Quản Lý Đơn Hàng</h2>

      <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên người đặt..."
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
            minWidth: "200px"
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
            <th style={{ border: "1px solid #ddd", padding: "12px" }}>Mã Đơn</th>
            <th style={{ border: "1px solid #ddd", padding: "12px" }}>Thông tin Khách Hàng</th>
            <th style={{ border: "1px solid #ddd", padding: "12px" }}>Ngày Đặt</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right" }}>Tổng Tiền</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>Trạng Thái</th>
            <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedOrders.length > 0 ? (
            filteredAndSortedOrders.map((order) => (
              <tr key={order.id}>
                <td style={{ border: "1px solid #ddd", padding: "12px", fontSize: "12px", color: "#666" }}>
                  {order.id}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                  <strong>{order.customerInfo?.fullName}</strong><br />
                  <span style={{ fontSize: "13px", color: "#555" }}>SĐT: {order.customerInfo?.phone}</span><br />
                  <span style={{ fontSize: "13px", color: "#555" }}>Đ/C: {order.customerInfo?.address}</span>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                  {formatDate(order.createdAt)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "right", fontWeight: "bold" }}>
                  {order.totalAmount?.toLocaleString("vi-VN")} đ
                </td>
                <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor: order.status === "Đã xử lý" ? "#d4edda" : "#fff3cd",
                      color: order.status === "Đã xử lý" ? "#155724" : "#856404",
                      display: "inline-block"
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center" }}>
                  {order.status === "Đang xử lý" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order)}
                      style={{
                        marginRight: "8px",
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Xử lý
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "gray",
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