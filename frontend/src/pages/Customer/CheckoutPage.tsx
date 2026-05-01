import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import "../../components/Customer/button.css";

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
    setFormData({
      fullName: user.name || "",
      address: user.address || "",
      phone: user.phone || "",
      paymentMethod: "cod",
    });
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const MY_BANK_ID = "BIDV";
  const MY_ACCOUNT_NO = "4661020820";
  const MY_ACCOUNT_NAME = "NGUYEN HUY HOANG LAM";

  const transferDescription = `Thanh toan ${formData.phone || "donhang"}`;

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
    <CustomerLayout>
      <div style={{ maxWidth: 1100, margin: "40px auto" }}>
        <h2>Thanh toán</h2>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 30 }}>
          
          {/* FORM */}
          <form onSubmit={handleSubmit} className="card">
            <h3>Thông tin</h3>

            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ tên" className="input" />
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" className="input" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="SĐT" className="input" />

            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="input">
              <option value="cod">COD</option>
              <option value="bank">Chuyển khoản</option>
            </select>

            {formData.paymentMethod === "bank" && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <img src={qrUrl} style={{ width: 220 }} />
                <p>{transferDescription}</p>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: "100%", marginTop: 20 }}>
              Xác nhận
            </button>
          </form>

          {/* SUMMARY */}
          <div className="card">
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
    </CustomerLayout>
  );
};

export default CheckoutPage;