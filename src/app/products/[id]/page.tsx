
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import type { Product, Review } from '@/lib/placeholder-data';
import { Reviews } from '@/components/reviews';
import { ProductDetailsClient } from '@/components/product-details-client';

export default async function ProductDetailPage({ params }: { params: { id: string } }) { // The `id` param is now the permalink
  const permalink = params.id;
  const productsCollection = collection(db, 'products');
  const q = query(productsCollection, where("permalink", "==", permalink), limit(1));
  const productQuerySnapshot = await getDocs(q);

  if (productQuerySnapshot.empty) {
    notFound();
  }

  const productSnap = productQuerySnapshot.docs[0];
  const product = docToJSON(productSnap) as Product;

  // The product ID is still needed for fetching reviews.
  const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', product.id));
  const reviewsSnapshot = await getDocs(reviewsQuery);
  const productReviews = reviewsSnapshot.docs.map(docToJSON) as Review[];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.category, href: `/products?category=${product.category}` },
            { label: product.name, href: `/products/${product.permalink}` },
          ]}
        />
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <ProductDetailsClient product={product} />
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
