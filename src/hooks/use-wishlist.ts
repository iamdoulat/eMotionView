
"use client";

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, docToJSON } from '@/lib/firebase';
import type { Product } from '@/lib/placeholder-data';
import { useToast } from './use-toast';

export function useWishlist() {
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Effect to get the current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Clear wishlist when user logs out
        setWishlistProductIds([]);
        setWishlistItems([]);
        setIsLoading(false);
        setIsInitialized(true);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Effect to fetch wishlist product IDs when user is available
  useEffect(() => {
    if (!user) return;

    const fetchWishlistIds = async () => {
      setIsLoading(true);
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const wishlistSnap = await getDoc(wishlistRef);
      if (wishlistSnap.exists()) {
        setWishlistProductIds(wishlistSnap.data().productIds || []);
      } else {
        // If wishlist doesn't exist, create it
        await setDoc(wishlistRef, { productIds: [] });
        setWishlistProductIds([]);
      }
    };

    fetchWishlistIds();
  }, [user]);

  // Effect to fetch full product details when product IDs change
  useEffect(() => {
    if (wishlistProductIds.length === 0) {
      setWishlistItems([]);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }
    
    const fetchProducts = async () => {
        try {
            const productsRef = collection(db, 'products');
            // Firestore 'in' query supports up to 30 items. For more, chunk the array.
            const productChunks = [];
            for (let i = 0; i < wishlistProductIds.length; i += 30) {
                productChunks.push(wishlistProductIds.slice(i, i + 30));
            }
            
            const productPromises = productChunks.map(chunk => 
                getDocs(query(productsRef, where('__name__', 'in', chunk)))
            );

            const productSnapshots = await Promise.all(productPromises);
            const products = productSnapshots.flatMap(snap => snap.docs.map(doc => docToJSON(doc) as Product));

            setWishlistItems(products);
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

    const wishlistRef = doc(db, 'wishlists', user.uid);
    try {
      await updateDoc(wishlistRef, {
        productIds: arrayUnion(product.id)
      });
      setWishlistProductIds(prev => [...prev, product.id]);
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
    const wishlistRef = doc(db, 'wishlists', user.uid);
    try {
      await updateDoc(wishlistRef, {
        productIds: arrayRemove(productId)
      });
      setWishlistProductIds(prev => prev.filter(id => id !== productId));
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
  }, [user, toast, wishlistItems]);
  
  const isInWishlist = useCallback((productId: string) => {
      return wishlistProductIds.includes(productId);
  }, [wishlistProductIds]);

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInitialized,
    isLoading, // Expose loading state
  };
}
