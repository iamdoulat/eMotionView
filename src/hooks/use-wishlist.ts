
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '@/lib/placeholder-data';
import { products } from '@/lib/placeholder-data';

const getWishlistFromStorage = (): string[] => {
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

const saveWishlistToStorage = (wishlist: string[]) => {
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
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setWishlist(getWishlistFromStorage());
    setIsInitialized(true);
  }, []);

  const onStorageChange = useCallback(() => {
    setWishlist(getWishlistFromStorage());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, [onStorageChange]);

  const wishlistItems = useMemo(() => {
    return wishlist.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
  }, [wishlist]);

  const addToWishlist = (productId: string) => {
    const currentWishlist = getWishlistFromStorage();
    if (!currentWishlist.includes(productId)) {
      const updatedWishlist = [...currentWishlist, productId];
      setWishlist(updatedWishlist);
      saveWishlistToStorage(updatedWishlist);
    }
  };

  const removeFromWishlist = (productId: string) => {
    const currentWishlist = getWishlistFromStorage();
    const updatedWishlist = currentWishlist.filter(id => id !== productId);
    setWishlist(updatedWishlist);
    saveWishlistToStorage(updatedWishlist);
  };
  
  const isInWishlist = (productId: string) => {
      return wishlist.includes(productId);
  }

  return {
    wishlist,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInitialized,
  };
}
