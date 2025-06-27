
"use client";

import Image from 'next/image';
import { products, reviews as allReviews } from '@/lib/placeholder-data';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShieldCheck, Plus, Minus } from 'lucide-react';
import { Reviews } from '@/components/reviews';
import { Breadcrumb } from '@/components/breadcrumb';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const product = products.find(p => p.id === params.id);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const router = useRouter();
  
  if (!product) {
    notFound();
  }

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const productReviews = allReviews.filter(r => r.productId === params.id);

  const isStockManaged = product.manageStock ?? true;
  const canPurchase = !isStockManaged || product.stock > 0;
  const stockStatus = isStockManaged
      ? (product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock")
      : "In Stock";
      
  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
      addToCart(product.id, quantity);
      router.push('/checkout');
  };


  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.category, href: `/products?category=${product.category}` },
            { label: product.name, href: `/products/${product.id}` },
          ]}
        />
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
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
                   <button className="text-muted-foreground hover:text-primary">
                      <Heart className="h-6 w-6" />
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
          </div>
          
          {/* Right Ad */}
          <div className="lg:col-span-3 hidden lg:block">
            <Link href="#">
               <Image
                  src="https://placehold.co/300x500.png"
                  alt="Advertisement"
                  width={300}
                  height={500}
                  className="w-full h-auto object-cover rounded-lg"
                  data-ai-hint="product advertisement"
                />
            </Link>
          </div>
        </div>
        
        <div className="mt-12">
          <Tabs defaultValue="specification" className="w-full">
            <TabsList className="border-b-2 border-border rounded-none bg-transparent p-0 h-auto justify-start">
              <TabsTrigger value="specification" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none bg-transparent text-lg font-semibold py-3 mr-4">Specification</TabsTrigger>
              <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none bg-transparent text-lg font-semibold py-3 mr-4">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none bg-transparent text-lg font-semibold py-3 mr-4">Reviews</TabsTrigger>
              <TabsTrigger value="questions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none bg-transparent text-lg font-semibold py-3 mr-4">Questions</TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none bg-transparent text-lg font-semibold py-3 mr-4">Video</TabsTrigger>
            </TabsList>
            <TabsContent value="specification" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium w-1/3">{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="description" className="mt-6">
               <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">{product.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Reviews productId={product.id} reviews={productReviews} averageRating={product.rating} />
            </TabsContent>
            <TabsContent value="questions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Questions & Answers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No questions have been asked yet. Be the first!</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="video" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Product Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
