
"use client"

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, CheckCircle, Plus, Minus, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const [dialogQuantity, setDialogQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const isStockManaged = product.manageStock ?? true;
  const canPurchase = !isStockManaged || product.stock > 0;
  const isWished = isInWishlist(product.id);

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canPurchase) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `Sorry, ${product.name} is currently unavailable.`,
      });
      return;
    }
    addToCart(product, 1);
    toast({
      title: "Added to Cart",
      description: `1 x ${product.name} has been added to your cart.`,
    });
  };
  
  const handleDialogAddToCart = () => {
    addToCart(product, dialogQuantity);
    toast({
      title: "Added to Cart",
      description: `${dialogQuantity} x ${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isWished ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  return (
    <Dialog onOpenChange={(open) => {
        if (open) {
            setDialogQuantity(1);
            setSelectedImage(product.images[0]);
        }
    }}>
      <Card className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-background">
        <CardHeader className="p-0 relative border-b">
          <DialogTrigger asChild>
            <div className="block aspect-square bg-secondary/30 cursor-pointer">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={`${product.category} product`}
              />
            </div>
          </DialogTrigger>
          {product.discountPercentage && (
            <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 text-primary-foreground border-none">
              {product.discountPercentage}%
            </Badge>
          )}
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-2 right-2 z-10 h-8 w-8 text-muted-foreground hover:text-destructive rounded-full bg-background/50 hover:bg-background"
            onClick={handleWishlistClick}
            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn("h-5 w-5", isWished && "fill-destructive text-destructive")} />
          </Button>
        </CardHeader>
        <CardContent className="p-3 flex-grow flex flex-col">
          <h3 className="text-sm font-medium h-10 line-clamp-2">
            <Link href={`/products/${product.permalink || product.id}`} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
          
          <div className="mt-auto">
              <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-lg font-bold text-primary">৳{product.price.toLocaleString()}</p>
                  {product.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">৳{product.originalPrice.toLocaleString()}</p>
                  )}
              </div>
              <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < Math.round(product.rating) ? 'currentColor' : 'transparent'} />
                      ))}
                  </div>
                  <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10" onClick={handleQuickAddToCart} disabled={!canPurchase}>
                      <ShoppingCart className="h-5 w-5" />
                  </Button>
              </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-4xl p-8">
        <DialogHeader className="p-0 mb-2 sm:text-left text-center">
          <DialogTitle className="text-2xl font-bold font-headline leading-snug tracking-tight">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
          <div className="flex flex-col h-full">
            
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i < Math.round(product.rating) ? 'currentColor' : 'transparent'}
                />
              ))}
              <a href={`/products/${product.permalink || product.id}#reviews`} className="ml-2 text-sm text-muted-foreground hover:text-primary">({product.reviewCount} reviews)</a>
            </div>

            <p className="text-3xl font-bold text-primary">৳{product.price.toLocaleString()}</p>

            <ul className="space-y-2 text-sm text-foreground mb-6">
                {product.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                    </li>
                ))}
                 {product.warranty && (
                    <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{product.warranty}</span>
                    </li>
                )}
            </ul>

            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Color:</p>
              <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-2 border-primary ring-1 ring-primary ring-offset-2">
                      <div className="h-5 w-5 rounded-full bg-black" />
                  </Button>
              </div>
            </div>

             <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Quantity:</Label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setDialogQuantity(q => Math.max(1, q - 1))}
                        disabled={!canPurchase}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        className="w-16 h-9 text-center"
                        value={dialogQuantity}
                        onChange={(e) => setDialogQuantity(parseInt(e.target.value, 10) || 1)}
                        readOnly
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setDialogQuantity(q => Math.min(product.stock, q + 1))}
                        disabled={!canPurchase || (isStockManaged && dialogQuantity >= product.stock)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Button size="lg" className="flex-1" onClick={handleDialogAddToCart} disabled={!canPurchase}>Add to cart</Button>
              <Button size="lg" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href={`/products/${product.permalink || product.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
