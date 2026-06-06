"use client";

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { Product } from '@/lib/placeholder-data';
import { useToast } from './use-toast';

export function useWishlist() {
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setWishlistProductIds([]);
        setWishlistItems([]);
        setIsLoading(false);
        setIsInitialized(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchWishlistIds = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/data/wishlists?id=${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const data = await res.json();
          setWishlistProductIds(data.productIds || []);
        } else {
          await fetch('/api/data/wishlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: user.uid, productIds: [] }),
          });
          setWishlistProductIds([]);
        }
      } catch {
        setWishlistProductIds([]);
      }
    };

    fetchWishlistIds();
  }, [user]);

  useEffect(() => {
    if (wishlistProductIds.length === 0) {
      setWishlistItems([]);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/data/products');
        const allProducts: Product[] = await res.json();
        const filtered = allProducts.filter(p => wishlistProductIds.includes(p.id || p._id));
        setWishlistItems(filtered);
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
        toast({
          variant: 'destructive',
          title: 'Error loading wishlist',
          description: 'Could not load your wishlist items.',
        });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    fetchProducts();
  }, [wishlistProductIds, toast]);

  const addToWishlist = useCallback(async (product: Product) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You need to be logged in to add items to your wishlist.',
      });
      return;
    }
    if (wishlistProductIds.includes(product.id)) return;

    const newIds = [...wishlistProductIds, product.id];
    try {
      await fetch(`/api/data/wishlists/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: newIds }),
      });
      setWishlistProductIds(newIds);
      setWishlistItems(prev => [...prev, product]);
      toast({
        title: "Added to Wishlist",
        description: product.name,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add item to wishlist.',
      });
    }
  }, [user, toast, wishlistProductIds]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You need to be logged in to modify your wishlist.',
      });
      return;
    }
    const newIds = wishlistProductIds.filter(id => id !== productId);
    try {
      await fetch(`/api/data/wishlists/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: newIds }),
      });
      setWishlistProductIds(newIds);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      const removedProduct = wishlistItems.find(item => item.id === productId);
      if (removedProduct) {
        toast({
          title: "Removed from Wishlist",
          description: removedProduct.name,
        });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not remove item from wishlist.',
      });
    }
  }, [user, toast, wishlistItems, wishlistProductIds]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistProductIds.includes(productId);
  }, [wishlistProductIds]);

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInitialized,
    isLoading,
  };
}
