
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/placeholder-data';

const getWishlistFromStorage = (): Product[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const wishlistJson = localStorage.getItem('wishlist');
    return wishlistJson ? JSON.parse(wishlistJson) : [];
  } catch (error) {
    console.error("Failed to parse wishlist from localStorage", error);
    return [];
  }
};

const saveWishlistToStorage = (wishlist: Product[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('storage')); // To notify other components/tabs
  } catch (error) {
    console.error("Failed to save wishlist to localStorage", error);
  }
};

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setWishlistItems(getWishlistFromStorage());
    setIsInitialized(true);
  }, []);

  const onStorageChange = useCallback(() => {
    setWishlistItems(getWishlistFromStorage());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, [onStorageChange]);

  const addToWishlist = (product: Product) => {
    const currentWishlist = getWishlistFromStorage();
    if (!currentWishlist.some(p => p.id === product.id)) {
      const updatedWishlist = [...currentWishlist, product];
      setWishlistItems(updatedWishlist);
      saveWishlistToStorage(updatedWishlist);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const currentWishlist = getWishlistFromStorage();
    const updatedWishlist = currentWishlist.filter(p => p.id !== productId);
    setWishlistItems(updatedWishlist);
    saveWishlistToStorage(updatedWishlist);
  };
  
  const isInWishlist = (productId: string) => {
      return wishlistItems.some(p => p.id === productId);
  }

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInitialized,
  };
}
