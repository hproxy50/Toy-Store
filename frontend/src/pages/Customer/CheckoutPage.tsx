import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/az-gundam-new-logo-2023-website-logo.jpg";

const CheckoutPage: React.FC = () => {
  const { cart, getTotalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phone: "",
    paymentMethod: "cod",
  });

  const totalAmount = getTotalAmount();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.address || !formData.phone) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const newOrder = {
      userId: currentUser ? currentUser.id : "guest", 
      customerInfo: formData, 
      items: cart, 
      totalAmount: totalAmount, 
      status: "Đang xử lý", 
      createdAt: new Date().toISOString(), 
    };

    try {
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        alert(
          `Đặt hàng thành công!\n\nTổng tiền: ${totalAmount.toLocaleString("vi-VN")} đ\nCảm ơn quý khách đã mua hàng!`,
        );
        clearCart();
        navigate("/");
      } else {
        alert("Có lỗi xảy ra khi đặt hàng, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối khi lưu đơn hàng:", error);
      alert("Lỗi kết nối đến máy chủ!");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img src={logo} alt="logo" style={{ height: "70px" }} />
        <h1>Trang Thanh Toán</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label>Họ và tên người nhận:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Địa chỉ giao hàng:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Số điện thoại:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label>Phương thức thanh toán:</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          >
            <option value="cod">Thanh toán khi nhận hàng (COD)</option>
            <option value="bank">Chuyển khoản ngân hàng</option>
          </select>
        </div>

        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "right",
            marginBottom: "30px",
          }}
        >
          Tổng thanh toán: {totalAmount.toLocaleString("vi-VN")} đ
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "18px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          Xác nhận đặt hàng
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
