import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/az-gundam-new-logo-2023-website-logo.jpg';
import '../../Css/Customer/ProductPage.css';   // Reuse existing styles where possible

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, getTotalAmount } = useCart();
  console.log("Current cart items:", cart);
  const navigate = useNavigate();

  const totalAmount = getTotalAmount();

  return (
    <div className="product-page-container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={logo} alt="logo" style={{ height: '50px' }} />
          <h2>Trang Giỏ Hàng</h2>
        </div>
        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Tiếp tục mua sắm
        </button>
      </div>

      {cart.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '50px' }}>
          Giỏ hàng của bạn đang trống.
        </p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Sản phẩm</th>
                <th style={{ padding: '12px' }}>Giá</th>
                <th style={{ padding: '12px' }}>Số lượng</th>
                <th style={{ padding: '12px' }}>Thành tiền</th>
                <th style={{ padding: '12px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div>
                      <strong>{item.name}</strong>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{item.category}</p>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{item.price.toLocaleString('vi-VN')} đ</td>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.id, Number(e.target.value))}
                      style={{ width: '80px', padding: '6px' }}
                    />
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '40px', textAlign: 'right' }}>
            <h2>Tổng cộng: <strong>{totalAmount.toLocaleString('vi-VN')} đ</strong></h2>
            <button
              onClick={() => navigate('/checkout')}
              style={{
                marginTop: '20px',
                padding: '14px 40px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              Tiến hành thanh toán
            </button>
            <button
              onClick={clearCart}
              style={{
                marginLeft: '15px',
                padding: '14px 30px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
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