import React, { useState, useEffect } from "react";
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

  // 1. TỰ ĐỘNG ĐIỀN THÔNG TIN TỪ LOCAL STORAGE KHI LOAD TRANG
  useEffect(() => {
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      
      // Cập nhật lại form bằng thông tin của user. Nếu user không có thông tin (do tạo từ trước lúc cập nhật code), thì để chuỗi rỗng ""
      setFormData(prevData => ({
        ...prevData,
        fullName: currentUser.name || "",
        address: currentUser.address || "",
        phone: currentUser.phone || "",
      }));
    }
  }, []);

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

  const MY_BANK_ID = "BIDV";
  const MY_ACCOUNT_NO = "4661020820";
  const MY_ACCOUNT_NAME = "NGUYEN HUY HOANG LAM";

  const transferDescription = `Thanh toan don hang ${formData.phone || "moi"}`;

  const qrUrl = `https://img.vietqr.io/image/${MY_BANK_ID}-${MY_ACCOUNT_NO}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transferDescription)}&accountName=${encodeURIComponent(MY_ACCOUNT_NAME)}`;

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

        {formData.paymentMethod === "bank" && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
              padding: "20px",
              border: "2px dashed #28a745",
              borderRadius: "8px",
              backgroundColor: "#f9fff9",
            }}
          >
            <h3 style={{ color: "#28a745", marginTop: 0 }}>
              Quét mã QR để thanh toán
            </h3>
            <p>Sử dụng App Ngân hàng hoặc Momo để quét mã.</p>

            <img
              src={qrUrl}
              alt="Mã QR Thanh Toán"
              style={{
                maxWidth: "300px",
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            />

            <div style={{ marginTop: "15px", fontSize: "14px", color: "#555" }}>
              <p>
                <strong>Nội dung CK:</strong> {transferDescription}
              </p>
              <p>
                Vui lòng chuyển khoản trước, sau đó ấn <b>Xác nhận đặt hàng</b>{" "}
                bên dưới.
              </p>
            </div>
          </div>
        )}

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