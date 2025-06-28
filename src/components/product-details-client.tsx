
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/lib/placeholder-data';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShieldCheck, Plus, Minus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function ProductDetailsClient({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const isWished = isInWishlist(product.id);

  const isStockManaged = product.manageStock ?? true;
  const canPurchase = !isStockManaged || product.stock > 0;
  const stockStatus = isStockManaged
      ? (product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock")
      : "In Stock";
      
  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
      addToCart(product, quantity);
      router.push('/checkout');
  };

  const handleWishlistClick = () => {
    isWished ? removeFromWishlist(product.id) : addToWishlist(product);
    toast({
      title: isWished ? 'Removed from Wishlist' : 'Added to Wishlist',
      description: product.name,
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 bg-card p-6 rounded-lg border">
      {/* Image Gallery */}
      <div className="flex flex-col items-center">
          <div className="w-full max-w-md aspect-square relative">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="w-full h-full object-contain rounded-lg"
              data-ai-hint={`${product.category} product`}
            />
          </div>
          <div className="flex gap-2 mt-4">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 rounded-md border-2 p-1 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={60}
                  height={60}
                  className="w-full h-full object-contain"
                  data-ai-hint={`${product.category} product`}
                />
              </button>
            ))}
          </div>
      </div>
      
      {/* Product Info */}
      <div className="flex flex-col">
        <h1 className="font-headline text-2xl font-bold text-foreground">{product.name}</h1>
        
        <ul className="mt-4 space-y-2 text-sm text-foreground">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <span>{feature}</span>
            </li>
          ))}
           <li className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>1 Year Brand Warranty</span>
            </li>
        </ul>

        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-3xl font-bold text-primary">৳{product.price.toFixed(2)}</p>
          {product.originalPrice && (
             <p className="text-xl text-muted-foreground line-through">৳{product.originalPrice.toFixed(2)}</p>
          )}
          {product.discountPercentage && (
            <Badge variant="destructive">{product.discountPercentage}% OFF</Badge>
          )}
        </div>

        <div className="mt-4">
            <Badge variant={canPurchase ? 'default' : 'destructive'}>
               {stockStatus}
            </Badge>
        </div>


        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <button 
            className="text-muted-foreground hover:text-primary"
            onClick={handleWishlistClick}
            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn("h-6 w-6 transition-colors", isWished && "fill-destructive text-destructive")} />
          </button>
        </div>

        <div className="mt-6">
            <p className="text-sm font-medium mb-2">Color:</p>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-2 border-primary ring-1 ring-primary ring-offset-2">
                    <div className="h-5 w-5 rounded-full bg-gray-800" />
                </Button>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <div className="h-5 w-5 rounded-full bg-slate-400" />
                </Button>
            </div>
        </div>

         <div className="mt-6">
            <Label className="text-sm font-medium mb-2 block">Quantity:</Label>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={!canPurchase}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <Input
                    type="number"
                    className="w-16 h-9 text-center"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    min="1"
                    max={isStockManaged ? product.stock : undefined}
                    readOnly
                />
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={!canPurchase || (isStockManaged && quantity >= product.stock)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
        
        <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 text-primary-foreground" disabled={!canPurchase} onClick={handleAddToCart}>
            Add To Cart
          </Button>
          <Button size="lg" className="flex-1" disabled={!canPurchase} onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
