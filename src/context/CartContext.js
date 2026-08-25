import React, {
  createContext,
  useContext,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Thêm món vào giỏ
  const addToCart = (food, quantity = 1) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === food.id
      );

      // Nếu món đã có trong giỏ
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === food.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );
      }

      // Nếu món chưa có
      return [
        ...currentCart,
        {
          ...food,
          quantity,
        },
      ];
    });
  };

  // Tăng số lượng
  const increaseQuantity = (foodId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === foodId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // Giảm số lượng
  const decreaseQuantity = (foodId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === foodId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Xóa món
  const removeFromCart = (foodId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== foodId
      )
    );
  };

  // Xóa toàn bộ giỏ
  const clearCart = () => {
    setCart([]);
  };

  // Tổng số lượng sản phẩm
  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  // Tổng tiền
  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const value = {
    cart,
    cartCount,
    cartTotal,

    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart phải được sử dụng bên trong CartProvider"
    );
  }

  return context;
}