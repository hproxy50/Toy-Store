import React, { useState } from "react";
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

  // THÊM MỚI: State lưu trữ tạm thời giá trị người dùng đang gõ cho từng item
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, string | number>
  >({});

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

  // THÊM MỚI: Hàm xử lý khi người dùng đang gõ (chưa gọi API)
  const handleQuantityChange = (id: string, value: string) => {
    if (value === "") {
      // Cho phép xóa rỗng ô input
      setLocalQuantities((prev) => ({ ...prev, [id]: "" }));
    } else {
      setLocalQuantities((prev) => ({ ...prev, [id]: Number(value) }));
    }
  };

  // THÊM MỚI: Hàm xử lý Validate và gọi API khi người dùng nhập xong (click ra ngoài hoặc Enter)
  const handleQuantityBlur = async (item: any) => {
    const currentInput = localQuantities[item.id];

    // Nếu người dùng chưa tương tác với ô input này thì bỏ qua
    if (currentInput === undefined) return;

    let finalQuantity = Number(currentInput);

    // KIỂM TRA QUAN TRỌNG: Nếu để trống ("") hoặc nhập <= 0, ép về 1
    if (currentInput === "" || finalQuantity < 1) {
      finalQuantity = 1;
    }

    const diff = finalQuantity - item.quantity;

    // Nếu không có thay đổi so với giỏ hàng thì xóa state tạm và dừng lại
    if (diff === 0) {
      setLocalQuantities((prev) => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/toys/${item.id}`);
      const dbItem = await res.json();

      if (diff > 0 && dbItem.quantity < diff) {
        alert("Số lượng trong kho không đủ để thêm!");
        // Nếu lỗi, xóa state tạm để UI tự động hoàn tác về số lượng cũ từ `cart`
        setLocalQuantities((prev) => {
          const newState = { ...prev };
          delete newState[item.id];
          return newState;
        });
        return;
      }

      await fetch(`http://localhost:3000/toys/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: dbItem.quantity - diff }),
      });

      // Cập nhật Context chính thức
      updateCartQuantity(item.id, finalQuantity);

      // Cập nhật thành công thì dọn dẹp state tạm
      setLocalQuantities((prev) => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  // THÊM MỚI: Nhấn Enter để kết thúc việc nhập số
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleClearCart = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng? Sản phẩm sẽ được trả lại kho."
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
          })
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
                    {/* Đã chỉnh sửa lại Input */}
                    <input
                      type="number"
                      min="1"
                      value={
                        localQuantities[item.id] !== undefined
                          ? localQuantities[item.id]
                          : item.quantity
                      }
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      onBlur={() => handleQuantityBlur(item)}
                      onKeyDown={handleKeyDown}
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