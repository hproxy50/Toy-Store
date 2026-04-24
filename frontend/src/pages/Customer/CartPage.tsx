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
      console.error(error);
    }
  };

  const handleQuantityChange = (id: string, value: string) => {
    if (value === "") {
      setLocalQuantities((prev) => ({ ...prev, [id]: "" }));
    } else {
      setLocalQuantities((prev) => ({ ...prev, [id]: Number(value) }));
    }
  };

  const handleQuantityBlur = async (item: any) => {
    const currentInput = localQuantities[item.id];
    if (currentInput === undefined) return;

    let finalQuantity = Number(currentInput);

    if (currentInput === "" || finalQuantity < 1) {
      finalQuantity = 1;
    }

    const diff = finalQuantity - item.quantity;

    if (diff === 0) {
      cleanup(item.id);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/toys/${item.id}`);
      const dbItem = await res.json();

      if (diff > 0 && dbItem.quantity < diff) {
        alert("Không đủ hàng!");
        cleanup(item.id);
        return;
      }

      await fetch(`http://localhost:3000/toys/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: dbItem.quantity - diff }),
      });

      updateCartQuantity(item.id, finalQuantity);
      cleanup(item.id);
    } catch (err) {
      console.error(err);
    }
  };

  const cleanup = (id: string) => {
    setLocalQuantities((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={logo} style={{ height: "50px" }} />
          <h2>Giỏ hàng</h2>
        </div>

        <button style={blueBtn} onClick={() => navigate("/")}>
          ← Tiếp tục mua
        </button>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h3>Giỏ hàng trống</h3>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
          
          {/* TABLE */}
          <div style={card}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={th}>Sản phẩm</th>
                  <th style={thCenter}>Giá</th>
                  <th style={thCenter}>Số lượng</th>
                  <th style={thCenter}>Tổng</th>
                  <th style={thCenter}></th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdFlex}>
                      <img src={item.image} style={{ width: "60px" }} />
                      <div>
                        <strong>{item.name}</strong>
                        <p style={{ margin: 0, color: "#777" }}>{item.category}</p>
                      </div>
                    </td>

                    <td style={tdCenter}>
                      {item.price.toLocaleString("vi-VN")} đ
                    </td>

                    <td style={tdCenter}>
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
                        style={qtyInput}
                      />
                    </td>

                    <td style={{ ...tdCenter, color: "#d32f2f", fontWeight: "bold" }}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                    </td>

                    <td style={tdCenter}>
                      <button style={removeBtn} onClick={() => handleRemoveItem(item)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div style={card}>
            <h3>Tổng đơn hàng</h3>

            <div style={{ display: "flex", justifyContent: "space-between", margin: "15px 0" }}>
              <span>Tổng tiền:</span>
              <strong>{totalAmount.toLocaleString("vi-VN")} đ</strong>
            </div>

            <button style={greenBtn} onClick={() => navigate("/checkout")}>
              Thanh toán
            </button>

            <button style={redBtn} onClick={clearCart}>
              Xóa tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== STYLE ===== */

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #eee",
};

const th = { padding: "12px", textAlign: "left" as const };
const thCenter = { ...th, textAlign: "center" as const };

const tdCenter = { padding: "12px", textAlign: "center" as const };
const tdFlex = {
  padding: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const qtyInput = {
  width: "70px",
  padding: "6px",
  textAlign: "center" as const,
};

const blueBtn = {
  padding: "10px 16px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const greenBtn = {
  width: "100%",
  padding: "14px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "10px",
};

const redBtn = {
  width: "100%",
  padding: "12px",
  background: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const removeBtn = {
  background: "none",
  border: "none",
  color: "red",
  cursor: "pointer",
  fontWeight: "bold",
};

export default CartPage;