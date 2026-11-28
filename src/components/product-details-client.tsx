"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { Product, Brand } from "@/lib/placeholder-data";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCurrency } from "@/hooks/use-currency";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Heart,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  Share2,
  Tag,
  Check,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";

const COLOR_MAP: Record<string, string> = {
  black: "#111827",
  white: "#F9FAFB",
  silver: "#D1D5DB",
  grey: "#6B7280",
  gray: "#6B7280",
  "dark blue": "#1E3A8A",
  blue: "#2563EB",
  navy: "#0F172A",
  red: "#DC2626",
  green: "#16A34A",
  gold: "#D97706",
  "rose gold": "#FB7185",
  orange: "#EA580C",
  yellow: "#CA8A04",
  purple: "#7C3AED",
  pink: "#DB2777",
};

export function ProductDetailsClient({ product, brand }: { product: Product; brand?: Brand }) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(product.images[0] || "https://placehold.co/600x600.png");
  const [quantity, setQuantity] = useState(1);

  // Find color attribute or direct colors array
  const colorAttribute = product.productAttributes?.find(
    (attr) => attr.name.toLowerCase() === "color" || attr.name.toLowerCase() === "colour"
  );

  const directColors: string[] = Array.isArray((product as any).colors)
    ? (product as any).colors.map((c: any) => (typeof c === "string" ? c : c.name || c.color || c.label || String(c)))
    : [];

  const availableColorValues: string[] =
    colorAttribute?.values && colorAttribute.values.length > 0
      ? colorAttribute.values
      : directColors;

  const colorAttrName = colorAttribute ? colorAttribute.name : "Color";

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.productAttributes && product.productAttributes.length > 0) {
      product.productAttributes.forEach((attr) => {
        if (attr.values && attr.values.length > 0) {
          initial[attr.name] = attr.values[0];
        }
      });
    }
    if (!initial[colorAttrName] && availableColorValues.length > 0) {
      initial[colorAttrName] = availableColorValues[0];
    }
    return initial;
  });

  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const mainBuyBoxRef = useRef<HTMLDivElement>(null);

  const isWished = isInWishlist(product.id);
  const isStockManaged = product.manageStock ?? true;
  const canPurchase = !isStockManaged || product.stock > 0;
  const stockQuantity = isStockManaged ? product.stock : 999;

  // Monitor scroll position to show sticky bar on desktop
  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.pageYOffset ||
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      let shouldShow = false;
      if (mainBuyBoxRef.current) {
        const rect = mainBuyBoxRef.current.getBoundingClientRect();
        // Trigger as soon as user scrolls down (> 60px) OR main buy box begins scrolling out of view (rect.top < 350)
        shouldShow = scrollY > 60 || rect.top < 350;
      } else {
        shouldShow = scrollY > 60;
      }
      setIsStickyVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    const attrSummary = Object.entries(selectedAttributes)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    toast({
      title: "Added to Cart!",
      description: `${quantity} × ${product.name} ${attrSummary ? `(${attrSummary})` : ""} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleWishlistClick = () => {
    if (isWished) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from Wishlist", description: `${product.name} removed from your wishlist.` });
    } else {
      addToWishlist(product);
      toast({ title: "Saved to Wishlist", description: `${product.name} saved to your wishlist.` });
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Product link copied to clipboard." });
    }
  };

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const savingsAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  return (
    <>
      {/* Main Compact Product Card */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 p-5 sm:p-7">
          {/* LEFT: Image Gallery (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border/80 bg-secondary/15 flex items-center justify-center p-4 group">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                unoptimized
                priority
                className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="product image preview"
              />

              {/* Floating Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {Boolean(product.discountPercentage && product.discountPercentage > 0) && (
                  <Badge variant="destructive" className="font-bold text-xs shadow-xs px-2 py-0.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
                {product.warranty && (
                  <Badge variant="secondary" className="font-medium text-[11px] shadow-xs px-2 py-0.5 bg-background/80 backdrop-blur-xs text-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Official
                  </Badge>
                )}
              </div>

              {/* Wishlist & Share buttons on preview */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                <button
                  type="button"
                  onClick={handleWishlistClick}
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-xs border border-border/60 shadow-xs flex items-center justify-center text-muted-foreground hover:text-destructive transition-all active:scale-90 cursor-pointer"
                  title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                  aria-label="Wishlist toggle"
                >
                  <Heart className={cn("h-4 w-4", isWished && "fill-destructive text-destructive")} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-xs border border-border/60 shadow-xs flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90 cursor-pointer"
                  title="Share product"
                  aria-label="Share product"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Thumbnails Row */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, index) => {
                  const isCurrent = selectedImage === img;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "relative h-16 w-16 sm:h-18 sm:w-18 rounded-lg overflow-hidden border-2 bg-secondary/20 shrink-0 transition-all cursor-pointer p-1",
                        isCurrent
                          ? "border-primary ring-2 ring-primary/20 shadow-xs scale-102"
                          : "border-border hover:border-muted-foreground/60 opacity-80 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Box (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Meta Top Line: Brand, SKU, Category, Stock status */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {brand ? (
                    <Link
                      href={`/brand/${brand.permalink || brand.name.toLowerCase()}`}
                      className="font-semibold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md"
                    >
                      <Tag className="h-3 w-3" />
                      {product.brand}
                    </Link>
                  ) : (
                    <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {product.brand}
                    </span>
                  )}

                  {product.sku && (
                    <span className="font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      SKU: <strong className="text-foreground">{product.sku}</strong>
                    </span>
                  )}
                </div>

                <Badge
                  variant={canPurchase ? "outline" : "destructive"}
                  className={cn(
                    "text-[11px] font-medium flex items-center gap-1.5 py-0.5",
                    canPurchase ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : ""
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", canPurchase ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
                  {canPurchase ? (isStockManaged ? `In Stock (${product.stock} units)` : "In Stock") : "Out of Stock"}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="mt-2.5 font-headline text-xl sm:text-2xl lg:text-[26px] font-bold text-foreground tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Reviews row */}
              <div className="mt-2 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                  <span className="ml-1 font-bold text-foreground">
                    {product.rating ? product.rating.toFixed(1) : "5.0"}
                  </span>
                </div>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <a href="#reviews" className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">
                  {product.reviewCount || 0} customer reviews
                </a>
                {product.warranty && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {product.warranty}
                    </span>
                  </>
                )}
              </div>

              {/* Compact Price Card */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-headline">
                    {formatPrice(product.price)}
                  </span>
                  {Boolean(product.originalPrice && product.originalPrice > product.price) && (
                    <span className="text-sm sm:text-base text-muted-foreground line-through font-medium">
                      {formatPrice(product.originalPrice!)}
                    </span>
                  )}
                  {Boolean(product.discountPercentage && product.discountPercentage > 0) && (
                    <Badge variant="destructive" className="font-bold text-xs py-0.5 px-2">
                      {product.discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                {savingsAmount > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                    You save: {formatPrice(savingsAmount)}
                  </span>
                )}
              </div>

              {/* Key Features Bullet Points */}
              {product.features && product.features.length > 0 && (
                <div className="mt-3.5 space-y-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-foreground/90">
                    {product.features.slice(0, 6).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color & Variant Selection (If Available) */}
              {product.productAttributes && product.productAttributes.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-border/70 space-y-3">
                  {product.productAttributes.map((attr) => {
                    const isColorAttr = attr.name.toLowerCase() === "color" || attr.name.toLowerCase() === "colour";
                    const currentVal = selectedAttributes[attr.name] || attr.values[0];

                    return (
                      <div key={attr.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <Label className="font-medium text-muted-foreground">
                            {attr.name}: <strong className="text-foreground capitalize">{currentVal}</strong>
                          </Label>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          {attr.values.map((val) => {
                            const isSelected = (selectedAttributes[attr.name] || attr.values[0]) === val;

                            if (isColorAttr) {
                              const hex = COLOR_MAP[val.toLowerCase()] || "#6B7280";
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  title={`Color: ${val}`}
                                  onClick={() => handleAttributeSelect(attr.name, val)}
                                  className={cn(
                                    "group relative h-8 w-8 rounded-full border-2 p-0.5 transition-all cursor-pointer flex items-center justify-center",
                                    isSelected
                                      ? "border-primary ring-2 ring-primary/30 ring-offset-1 scale-105"
                                      : "border-muted-foreground/30 hover:border-foreground/60"
                                  )}
                                >
                                  <span
                                    className="h-full w-full rounded-full block relative shadow-xs"
                                    style={{ backgroundColor: hex }}
                                  >
                                    {isSelected && (
                                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                      </span>
                                    )}
                                  </span>
                                </button>
                              );
                            }

                            return (
                              <Button
                                key={val}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAttributeSelect(attr.name, val)}
                                className={cn(
                                  "h-8 px-3 text-xs font-medium cursor-pointer transition-all",
                                  isSelected ? "shadow-xs" : "hover:border-primary/60"
                                )}
                              >
                                {val}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Main Action Buy Box (Watched for Sticky Trigger) */}
            <div ref={mainBuyBoxRef} className="mt-5 pt-4 border-t border-border/80 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity Pill Stepper */}
                <div className="flex items-center justify-between sm:justify-start gap-2 bg-secondary/30 rounded-xl p-1 border border-border/80 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg cursor-pointer hover:bg-background"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={!canPurchase || quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-10 text-center font-bold text-sm select-none font-mono">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg cursor-pointer hover:bg-background"
                    onClick={() => setQuantity((q) => Math.min(stockQuantity, q + 1))}
                    disabled={!canPurchase || (isStockManaged && quantity >= product.stock)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Add To Cart Button */}
                <Button
                  size="lg"
                  disabled={!canPurchase}
                  onClick={handleAddToCart}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xl"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add To Cart</span>
                </Button>

                {/* Buy Now Button */}
                <Button
                  size="lg"
                  disabled={!canPurchase}
                  onClick={handleBuyNow}
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 rounded-xl"
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Buy Now</span>
                </Button>
              </div>

              {/* Quick Trust Badges Strip */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Fast Shipping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">100% Authentic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">7 Days Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP STICKY BOTTOM BAR (Triggered on scroll bottom) */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[95] bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out hidden md:block",
          isStickyVisible
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Thumbnail & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-11 w-11 rounded-lg overflow-hidden border bg-secondary/30 shrink-0">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                unoptimized
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-semibold text-sm truncate max-w-[200px] lg:max-w-[320px] text-foreground leading-tight" title={product.name}>
                {product.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-primary">{product.brand}</span>
                {product.sku && <span className="font-mono text-[11px] opacity-75">#{product.sku}</span>}
              </div>
            </div>
          </div>

          {/* Center-Left: Price Block (As highlighted in user diagram) */}
          <div className="flex items-baseline gap-2 pl-3 border-l border-border shrink-0">
            <span className="text-xl lg:text-2xl font-bold font-headline text-primary tracking-tight">
              {formatPrice(product.price)}
            </span>
            {Boolean(product.originalPrice && product.originalPrice > product.price) && (
              <span className="text-xs text-muted-foreground line-through font-medium">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            {Boolean(product.discountPercentage && product.discountPercentage > 0) && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 font-bold">
                {product.discountPercentage}% OFF
              </Badge>
            )}
          </div>

          {/* Center-Right: Color Variants (If Available, as in user diagram) */}
          {availableColorValues.length > 0 && (
            <div className="flex items-center gap-2 px-3 border-l border-border shrink-0">
              <span className="text-xs font-medium text-muted-foreground hidden lg:inline">Color:</span>
              <div className="flex items-center gap-1.5">
                {availableColorValues.map((val) => {
                  const isSelected =
                    (selectedAttributes[colorAttrName] || availableColorValues[0]) === val;
                  const hex = COLOR_MAP[val.toLowerCase()] || "#6B7280";
                  return (
                    <button
                      key={val}
                      type="button"
                      title={`Select Color: ${val}`}
                      onClick={() => handleAttributeSelect(colorAttrName, val)}
                      className={cn(
                        "h-7 w-7 rounded-full border-2 p-0.5 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center",
                        isSelected
                          ? "border-primary ring-2 ring-primary/40 ring-offset-1 scale-105"
                          : "border-muted-foreground/30 hover:border-foreground/60"
                      )}
                    >
                      <span className="h-full w-full rounded-full block relative" style={{ backgroundColor: hex }}>
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-foreground capitalize hidden xl:inline max-w-[80px] truncate">
                {selectedAttributes[colorAttrName] || availableColorValues[0]}
              </span>
            </div>
          )}

          {/* Right: Quantity Stepper, Add To Cart, Buy Now */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Compact Quantity Stepper */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 border border-border shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!canPurchase || quantity <= 1}
                className="h-7 w-7 rounded-md hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-semibold font-mono">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stockQuantity, q + 1))}
                disabled={!canPurchase || (isStockManaged && quantity >= product.stock)}
                className="h-7 w-7 rounded-md hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Add to Cart button */}
            <Button
              size="sm"
              disabled={!canPurchase}
              onClick={handleAddToCart}
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 rounded-lg"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Add To Cart</span>
            </Button>

            {/* Buy Now button */}
            <Button
              size="sm"
              disabled={!canPurchase}
              onClick={handleBuyNow}
              className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 rounded-lg"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Buy Now</span>
            </Button>

            {/* Wishlist Icon */}
            <button
              type="button"
              onClick={handleWishlistClick}
              className="h-9 w-9 rounded-lg border border-border hover:bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
              title={isWished ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={cn("h-4 w-4", isWished && "fill-destructive text-destructive")} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
