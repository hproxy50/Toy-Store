import React, { useState, useEffect } from "react";
import "../../Css/AdminCss/OrderManager.css";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
    <div className="order-manager-container">
      <h2>Quản Lý Đơn Hàng</h2>

      <div className="controls-wrapper">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên người đặt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đã xử lý">Đã xử lý</option>
          <option value="Đã giao">Đã giao</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="filter-select"
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="date_desc">Ngày: Mới nhất đến cũ nhất</option>
          <option value="date_asc">Ngày: Cũ nhất đến mới nhất</option>
          <option value="price_desc">Tổng tiền: Cao đến thấp</option>
          <option value="price_asc">Tổng tiền: Thấp đến cao</option>
        </select>
      </div>

      <table className="orders-table">
        <thead>
          <tr className="table-header-row">
            <th className="th-id">Mã Đơn</th>
            <th className="th-info">Thông Tin Đơn Hàng</th>
            <th>Ngày Đặt</th>
            <th className="th-total">Tổng Tiền</th>
            <th className="th-status">Trạng Thái</th>
            <th className="th-action">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedOrders.length > 0 ? (
            filteredAndSortedOrders.map((order) => {
              const statusColors = getStatusColor(order.status);
              return (
                <tr key={order.id} className="table-row">
                  <td className="td-id">{order.id}</td>

                  <td>
                    <div className="customer-info-wrapper">
                      <strong className="customer-name">
                        {order.customerInfo?.fullName}
                      </strong>
                      <div className="customer-details">
                        <span className="customer-details-item">
                          <i className="fa-solid fa-phone customer-details-icon"></i>
                          {order.customerInfo?.phone}
                        </span>
                        <span>
                          <i className="fa-solid fa-location-dot customer-details-icon"></i>
                          {order.customerInfo?.address}
                        </span>
                      </div>
                      <div className="customer-payment">
                        <span>Thanh toán:</span>{" "}
                        {order.customerInfo?.paymentMethod === "bank"
                          ? "Chuyển khoản"
                          : "COD"}
                      </div>
                    </div>
                    <div>
                      <div className="products-title">
                        Sản phẩm đã đặt ({order.items?.length || 0})
                      </div>
                      <div className="products-list">
                        {order.items?.map((item, index) => (
                          <div key={index} className="product-item">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="product-image"
                              />
                            ) : (
                              <div className="product-no-image">No Img</div>
                            )}

                            <div className="product-info">
                              <div className="product-name">{item.name}</div>
                              <div className="product-price-wrapper">
                                {item.price?.toLocaleString("vi-VN")} đ{" "}
                                <span className="product-quantity">
                                  x{item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>

                  <td>{formatDate(order.createdAt)}</td>

                  <td className="td-total">
                    {order.totalAmount?.toLocaleString("vi-VN")} đ
                  </td>

                  <td className="td-status">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                      }}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="td-action">
                    {order.status === "Đang xử lý" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(order.id, order, "Đã xử lý")
                        }
                        className="action-btn btn-process"
                      >
                        Xử lý đơn
                      </button>
                    )}
                    {(order.status === "Đang xử lý" ||
                      order.status === "Đã xử lý") && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(order.id, order, "Đã giao")
                        }
                        className="action-btn btn-deliver"
                      >
                        Đã giao hàng
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="action-btn btn-delete"
                    >
                      Xóa đơn
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="td-empty">
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
