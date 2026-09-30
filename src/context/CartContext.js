import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addServerCartItem,
  clearServerCart,
  getServerCart,
  removeServerCartItem,
  updateServerCartItem,
} from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const getCartKey = (product) =>
  String(product.cartKey || product.variantId || product.id);

const clampQuantity = (item, quantity) => {
  const normalized = Math.max(1, Math.floor(Number(quantity) || 1));
  const stock = Number(item.stockQuantity);
  return Number.isFinite(stock) ? Math.min(normalized, Math.max(stock, 0)) : normalized;
};

export function CartProvider({ children }) {
  const { user, isAuthenticated, isRestoring } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const previousUserId = useRef(null);

  const reloadCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsCartLoading(true);
    setCartError(null);
    try {
      setCart(await getServerCart());
    } catch (error) {
      setCartError(error);
    } finally {
      setIsCartLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isRestoring) return undefined;
    let active = true;

    async function handleSessionCart() {
      if (!user) {
        if (previousUserId.current) setCart([]);
        previousUserId.current = null;
        return;
      }

      const guestItems = cart.filter((item) => !item.cartItemId);
      previousUserId.current = user.id;
      setIsCartLoading(true);
      setCartError(null);
      try {
        let mergeError = null;
        for (const item of guestItems) {
          try {
          await addServerCartItem(
            item.variantId,
            item.quantity,
            item.serverConfiguration
          );
          } catch (error) {
            mergeError = error;
          }
        }
        const serverCart = await getServerCart();
        if (active) {
          setCart(serverCart);
          setCartError(mergeError);
        }
      } catch (error) {
        if (active) setCartError(error);
      } finally {
        if (active) setIsCartLoading(false);
      }
    }

    handleSessionCart();
    return () => {
      active = false;
    };
  }, [user?.id, isRestoring]);

  const addToCart = useCallback(async (product, quantity = 1, configured = null) => {
    const safeQuantity = clampQuantity(product, quantity);
    if (safeQuantity <= 0) return;
    setCartError(null);

    if (isAuthenticated) {
      try {
        setCart(
          await addServerCartItem(product.variantId, safeQuantity, configured)
        );
        return true;
      } catch (error) {
        setCartError(error);
        return false;
      }
    }

    const cartKey = getCartKey(product);
    setCart((current) => {
      const existing = current.find((item) => item.cartKey === cartKey);
      if (existing) {
        return current.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: clampQuantity(item, item.quantity + safeQuantity) }
            : item
        );
      }
      return [
        ...current,
        {
          ...product,
          cartKey,
          quantity: safeQuantity,
          serverConfiguration: configured,
        },
      ];
    });
    return true;
  }, [isAuthenticated]);

  const setItemQuantity = useCallback(async (cartKey, quantity) => {
    const item = cart.find((entry) => entry.cartKey === cartKey);
    if (!item) return;
    const safeQuantity = clampQuantity(item, quantity);
    setCartError(null);

    if (isAuthenticated && item.cartItemId) {
      try {
        setCart(await updateServerCartItem(item.cartItemId, safeQuantity));
      } catch (error) {
        setCartError(error);
      }
      return;
    }
    setCart((current) =>
      current.map((entry) =>
        entry.cartKey === cartKey ? { ...entry, quantity: safeQuantity } : entry
      )
    );
  }, [cart, isAuthenticated]);

  const removeFromCart = useCallback(async (cartKey) => {
    const item = cart.find((entry) => entry.cartKey === cartKey);
    if (!item) return;
    setCartError(null);
    if (isAuthenticated && item.cartItemId) {
      try {
        await removeServerCartItem(item.cartItemId);
      } catch (error) {
        setCartError(error);
        return;
      }
    }
    setCart((current) => current.filter((entry) => entry.cartKey !== cartKey));
  }, [cart, isAuthenticated]);

  const clearCart = useCallback(async () => {
    setCartError(null);
    if (isAuthenticated) {
      try {
        await clearServerCart();
      } catch (error) {
        setCartError(error);
        return;
      }
    }
    setCart([]);
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    cart,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    cartTotal: cart.reduce((total, item) => total + item.price * item.quantity, 0),
    isCartLoading,
    cartError,
    addToCart,
    increaseQuantity: (cartKey) => {
      const item = cart.find((entry) => entry.cartKey === cartKey);
      return item ? setItemQuantity(cartKey, item.quantity + 1) : undefined;
    },
    decreaseQuantity: (cartKey) => {
      const item = cart.find((entry) => entry.cartKey === cartKey);
      if (!item) return undefined;
      return item.quantity <= 1
        ? removeFromCart(cartKey)
        : setItemQuantity(cartKey, item.quantity - 1);
    },
    removeFromCart,
    clearCart,
    reloadCart,
  }), [
    cart,
    isCartLoading,
    cartError,
    addToCart,
    setItemQuantity,
    removeFromCart,
    clearCart,
    reloadCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart phải được sử dụng bên trong CartProvider");
  return context;
}
