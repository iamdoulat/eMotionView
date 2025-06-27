
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/placeholder-data';
import { products } from '@/lib/placeholder-data';

export interface CartItem extends Product {
  quantity: number;
}

const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const cartJson = localStorage.getItem('cart');
    return cartJson ? JSON.parse(cartJson) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage')); // To notify other components/tabs
  } catch (error) {
    console.error("Failed to save cart to localStorage", error);
  }
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // This effect runs once on mount to initialize state from localStorage
  useEffect(() => {
    setCart(getCartFromStorage());
    setIsInitialized(true);
  }, []);

  // This effect listens for storage changes from other tabs
  const onStorageChange = useCallback(() => {
    setCart(getCartFromStorage());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, [onStorageChange]);

  const addToCart = (productId: string, quantity: number = 1) => {
    const currentCart = getCartFromStorage();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItemIndex = currentCart.findIndex(item => item.id === productId);
    let updatedCart;

    if (existingItemIndex > -1) {
      updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += quantity;
    } else {
      updatedCart = [...currentCart, { ...product, quantity }];
    }
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const currentCart = getCartFromStorage();
    const updatedCart = currentCart.filter(item => item.id !== productId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const currentCart = getCartFromStorage();
    const updatedCart = currentCart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    saveCartToStorage([]);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
    isInitialized,
  };
}
