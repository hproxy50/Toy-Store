import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/Customer/CustomerLayout";
import "../../components/Customer/button.css";

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
    setLocalQuantities((prev) => ({
      ...prev,
      [id]: value === "" ? "" : Number(value),
    }));
  };

  const handleQuantityBlur = async (item: any) => {
    const input = localQuantities[item.id];
    if (input === undefined) return;

    let finalQuantity = Number(input);
    if (input === "" || finalQuantity < 1) finalQuantity = 1;

    const diff = finalQuantity - item.quantity;
    if (diff === 0) return;

    try {
      const res = await fetch(`http://localhost:3000/toys/${item.id}`);
      const dbItem = await res.json();

      if (diff > 0 && dbItem.quantity < diff) {
        alert("Không đủ hàng!");
        return;
      }

      await fetch(`http://localhost:3000/toys/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: dbItem.quantity - diff }),
      });

      updateCartQuantity(item.id, finalQuantity);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CustomerLayout>
      <div style={{ maxWidth: "1200px", margin: "40px auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
          <h2>Giỏ hàng</h2>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            ← Tiếp tục mua
          </button>
        </div>

        {cart.length === 0 ? (
          <h3 style={{ textAlign: "center", marginTop: 100 }}>
            Giỏ hàng trống
          </h3>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 30 }}>
            
            {/* TABLE */}
            <div className="card">
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style={{ textAlign: "center" }}>Giá</th>
                    <th style={{ textAlign: "center" }}>SL</th>
                    <th style={{ textAlign: "center" }}>Tổng</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td style={{ display: "flex", gap: 10, padding: 10 }}>
                        <img src={item.image} style={{ width: 60 }} />
                        <div>
                          <strong>{item.name}</strong>
                          <p style={{ margin: 0 }}>{item.category}</p>
                        </div>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {item.price.toLocaleString("vi-VN")} đ
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <input
                          type="number"
                          min="1"
                          value={localQuantities[item.id] ?? item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          onBlur={() => handleQuantityBlur(item)}
                          style={{ width: 60 }}
                        />
                      </td>

                      <td style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
                        {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn btn-text"
                          onClick={() => handleRemoveItem(item)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY */}
            <div className="card">
              <h3>Tổng đơn</h3>

              <p style={{ fontSize: 20, fontWeight: "bold" }}>
                {totalAmount.toLocaleString("vi-VN")} đ
              </p>

              <button
                className="btn btn-primary"
                style={{ width: "100%", marginBottom: 10 }}
                onClick={() => navigate("/checkout")}
              >
                Thanh toán
              </button>

              <button
                className="btn btn-danger"
                style={{ width: "100%" }}
                onClick={clearCart}
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CartPage;