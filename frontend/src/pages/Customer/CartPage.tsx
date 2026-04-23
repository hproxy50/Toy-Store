import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/az-gundam-new-logo-2023-website-logo.jpg";
import "../../Css/Customer/ProductPage.css";

const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getTotalAmount,
  } = useCart();
  const navigate = useNavigate();

  const totalAmount = getTotalAmount();

  const handleRemoveItem = async (item: any) => {
    try {
      const res = await fetch(`http://localhost:3000/toys/${item.id}`);
      const dbItem = await res.json();

      await fetch(`http://localhost:3000/toys/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: dbItem.quantity + item.quantity }),
      });

      removeFromCart(item.id);
    } catch (error) {
      console.error("Lỗi khi hoàn trả sản phẩm về kho:", error);
    }
  };

  const handleUpdateQuantity = async (item: any, newQuantityStr: string) => {
    const newQuantity = Number(newQuantityStr);
    if (newQuantity < 1) return;

    const diff = newQuantity - item.quantity;

    if (diff === 0) return;

    try {
      const res = await fetch(`http://localhost:3000/toys/${item.id}`);
      const dbItem = await res.json();

      if (diff > 0 && dbItem.quantity < diff) {
        alert("Số lượng trong kho không đủ để thêm!");
        return;
      }

      await fetch(`http://localhost:3000/toys/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: dbItem.quantity - diff }),
      });

      updateCartQuantity(item.id, newQuantity);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  // 3. HOÀN TRẢ KHO KHI XÓA TOÀN BỘ GIỎ HÀNG
  const handleClearCart = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng? Sản phẩm sẽ được trả lại kho.",
      )
    ) {
      try {
        await Promise.all(
          cart.map(async (item) => {
            const res = await fetch(`http://localhost:3000/toys/${item.id}`);
            const dbItem = await res.json();

            return fetch(`http://localhost:3000/toys/${item.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quantity: dbItem.quantity + item.quantity,
              }),
            });
          }),
        );

        clearCart();
      } catch (error) {
        console.error("Lỗi khi hoàn trả toàn bộ giỏ hàng:", error);
      }
    }
  };

  return (
    <div className="product-page-container">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img src={logo} alt="logo" style={{ height: "50px" }} />
          <h2>Trang Giỏ Hàng</h2>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Tiếp tục mua sắm
        </button>
      </div>

      {cart.length === 0 ? (
        <p
          style={{ textAlign: "center", fontSize: "1.2rem", marginTop: "50px" }}
        >
          Giỏ hàng của bạn đang trống.
        </p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Sản phẩm</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Giá</th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Số lượng
                </th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Thành tiền
                </th>
                <th style={{ padding: "12px", textAlign: "center" }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "contain",
                      }}
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <p
                        style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}
                      >
                        {item.category}
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {item.price.toLocaleString("vi-VN")} đ
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(item, e.target.value)
                      }
                      style={{
                        width: "80px",
                        padding: "6px",
                        textAlign: "center",
                      }}
                    />
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "#d32f2f",
                    }}
                  >
                    {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      style={{
                        color: "red",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "40px", textAlign: "right" }}>
            <h2>
              Tổng cộng:{" "}
              <strong style={{ color: "#28a745" }}>
                {totalAmount.toLocaleString("vi-VN")} đ
              </strong>
            </h2>
            <button
              onClick={() => navigate("/checkout")}
              style={{
                marginTop: "20px",
                padding: "14px 40px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Tiến hành thanh toán
            </button>

            <button
              onClick={handleClearCart}
              style={{
                marginLeft: "15px",
                padding: "14px 30px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              Xóa giỏ hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
