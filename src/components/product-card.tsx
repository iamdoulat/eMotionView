import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-background">
      <CardHeader className="p-0 relative border-b">
        <Link href={`/products/${product.id}`} className="block aspect-square bg-secondary/30">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={`${product.category} product`}
          />
        </Link>
        {product.discountPercentage && (
          <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700 text-primary-foreground border-none">
            {product.discountPercentage}%
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col">
        <h3 className="text-sm font-medium h-10 line-clamp-2">
          <Link href={`/products/${product.id}`} className="hover:text-primary">
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
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
                <Button size="icon" variant="ghost" className="w-8 h-8 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10">
                    <ShoppingCart className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
