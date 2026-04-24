import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/az-gundam-new-logo-2023-website-logo.jpg";

const CheckoutPage: React.FC = () => {
  const { cart, getTotalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const totalAmount = getTotalAmount();

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phone: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setFormData((prev) => ({
      ...prev,
      fullName: user.name || "",
      address: user.address || "",
      phone: user.phone || "",
    }));
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const MY_BANK_ID = "BIDV";
  const MY_ACCOUNT_NO = "4661020820";
  const MY_ACCOUNT_NAME = "NGUYEN HUY HOANG LAM";

  const transferDescription = `Thanh toan don hang ${formData.phone || "moi"}`;

  const qrUrl = `https://img.vietqr.io/image/${MY_BANK_ID}-${MY_ACCOUNT_NO}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    transferDescription
  )}&accountName=${encodeURIComponent(MY_ACCOUNT_NAME)}`;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert("Đặt hàng thành công!");
    clearCart();
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "20px" }}>
      
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img src={logo} style={{ height: "60px" }} />
        <h2>Thanh toán</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
        
        {/* FORM */}
        <form onSubmit={handleSubmit} style={card}>
          <h3>Thông tin giao hàng</h3>

          <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ tên" style={input} />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" style={input} />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="SĐT" style={input} />

          <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} style={input}>
            <option value="cod">COD</option>
            <option value="bank">Chuyển khoản</option>
          </select>

          {formData.paymentMethod === "bank" && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img src={qrUrl} style={{ width: "200px" }} />
              <p>{transferDescription}</p>
            </div>
          )}

          <button style={greenBtn}>Xác nhận</button>
        </form>

        {/* SUMMARY */}
        <div style={card}>
          <h3>Đơn hàng</h3>

          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{item.name} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString("vi-VN")} đ</span>
            </div>
          ))}

          <hr />

          <h3 style={{ textAlign: "right" }}>
            {totalAmount.toLocaleString("vi-VN")} đ
          </h3>
        </div>
      </div>
    </div>
  );
};

const card = {
  padding: "20px",
  border: "1px solid #eee",
  borderRadius: "10px",
};

const input = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const greenBtn = {
  marginTop: "20px",
  width: "100%",
  padding: "14px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default CheckoutPage;