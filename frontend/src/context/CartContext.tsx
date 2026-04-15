import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  quantity: number;        // quantity in cart
  stock: number;           // available stock from backend
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (toy: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, newQuantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (toy: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === toy.id);
      if (existing) {
        // Increase quantity if stock allows
        if (existing.quantity < toy.stock) {
          return prev.map(item =>
            item.id === toy.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prev;
      }
      return [...prev, { ...toy, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stock) } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getTotalAmount = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getTotalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};