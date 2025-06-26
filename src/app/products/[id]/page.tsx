import Image from 'next/image';
import { products, reviews } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShoppingCart, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Reviews } from '@/components/reviews';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);
  
  if (!product) {
    notFound();
  }

  const productReviews = reviews.filter(r => r.productId === params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={img}
                    alt={`${product.name} image ${index + 1}`}
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover rounded-lg border"
                    data-ai-hint={`${product.category} product`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
        
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit mb-2">{product.category}</Badge>
          <h1 className="font-headline text-3xl lg:text-4xl font-bold text-foreground">{product.name}</h1>
          <div className="flex items-center mt-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <a href="#reviews" className="ml-3 text-sm font-medium text-primary hover:text-primary/80">
              {product.reviewCount} reviews
            </a>
          </div>
          
          <p className="mt-4 text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
          
          <p className="mt-6 text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold font-headline">Key Features</h3>
            <ul className="mt-4 space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-auto pt-8 flex gap-4">
            <Button size="lg" className="flex-1">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              <Heart className="mr-2 h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>
        </div>
      </div>
      
      <Separator className="my-12" />
      
      <div id="reviews">
        <Reviews productId={product.id} reviews={productReviews} averageRating={product.rating} />
      </div>
    </div>
  );
}
