
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
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
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

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
        ...prev,
        [attributeName]: value,
    }));
  };
  
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    silver: '#C0C0C0',
    blue: '#3b82f6',
    red: '#ef4444',
    green: '#22c55e',
  };

  return (
    <Dialog onOpenChange={(open) => {
        if (open) {
            setDialogQuantity(1);
            setSelectedImage(product.images[0]);
            setSelectedAttributes({});
        }
    }}>
      <Card className="group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-background">
        <CardHeader className="p-0 relative border-b">
          <DialogTrigger asChild>
            <div className="block aspect-square bg-secondary/30 cursor-pointer overflow-hidden">
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
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'transparent'} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
                </div>
                <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10" onClick={handleQuickAddToCart} disabled={!canPurchase}>
                    <ShoppingCart className="h-5 w-5" />
                </Button>
              </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-4xl p-8">
        <DialogHeader>
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
                  className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'transparent'}
                />
              ))}
              <a href={`/products/${product.permalink || product.id}#reviews`} className="ml-2 text-sm text-muted-foreground hover:text-primary">({product.reviewCount || 0} reviews)</a>
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

            {product.productAttributes && product.productAttributes.length > 0 && (
                <div className="space-y-4 mb-6">
                    {product.productAttributes.map((attr) => {
                        const isColorAttr = attr.name.toLowerCase() === 'color';
                        return (
                            <div key={attr.name}>
                                <Label className="text-sm font-medium mb-2 block">{attr.name}:</Label>
                                <div className="flex flex-wrap gap-2">
                                    {attr.values.map((value) => {
                                        const isSelected = selectedAttributes[attr.name] === value;
                                        if (isColorAttr) {
                                            const bgColor = colorMap[value.toLowerCase()] || '#CCCCCC';
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    title={value}
                                                    onClick={() => handleAttributeSelect(attr.name, value)}
                                                    className={cn(
                                                        "h-8 w-8 rounded-full border-2 p-0.5 flex items-center justify-center",
                                                        isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-200'
                                                    )}
                                                >
                                                    <span
                                                        className="h-full w-full rounded-full block"
                                                        style={{ backgroundColor: bgColor }}
                                                    />
                                                </button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={value}
                                                type="button"
                                                variant={isSelected ? 'default' : 'outline'}
                                                onClick={() => handleAttributeSelect(attr.name, value)}
                                                size="sm"
                                            >
                                                {value}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
