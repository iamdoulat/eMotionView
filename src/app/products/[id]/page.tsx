

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/breadcrumb';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, getDocs, limit, doc, getDoc, type DocumentSnapshot, docToJSON } from '@/lib/db';
import { db } from '@/lib/db';
import type { Product, Review, Category, Brand } from '@/lib/placeholder-data';
import { Reviews } from '@/components/reviews';
import { ProductDetailsClient } from '@/components/product-details-client';
import { ProductNavTabs } from '@/components/product-nav-tabs';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  PhoneCall,
  CreditCard,
  Sparkles,
  Sliders,
  FileText,
  HelpCircle,
  Video as VideoIcon,
  MessageSquare
} from 'lucide-react';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const productsCollection = collection(db, 'products');
  let productSnap: DocumentSnapshot | undefined = undefined;

  // Try finding by permalink first
  const permalinkQuery = query(productsCollection, where("permalink", "==", slug), limit(1));
  const permalinkSnapshot = await getDocs(permalinkQuery);

  if (!permalinkSnapshot.empty) {
    productSnap = permalinkSnapshot.docs[0];
  } else {
    // If not found by permalink, try by document ID. This can fail if the slug is not a valid doc ID.
    try {
      const docRef = doc(db, "products", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        productSnap = docSnap;
      }
    } catch (error) {
      console.log(`Could not find product by ID '${slug}', it might not be a valid document ID.`);
    }
  }

  if (!productSnap) {
    notFound();
  }

  const product = docToJSON(productSnap) as Product;

  // Fetch ONLY approved reviews and calculate the most up-to-date rating on the server
  const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', product.id), where('status', '==', 'approved'));
  const reviewsSnapshot = await getDocs(reviewsQuery);
  const approvedReviews = reviewsSnapshot.docs.map(docToJSON) as Review[];

  const reviewCount = approvedReviews.length;
  const averageRating = reviewCount > 0
    ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
    : 0;

  // Pass the calculated rating to the client component
  const productWithCalculatedRating = {
    ...product,
    rating: averageRating,
    reviewCount,
  };

  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  const allCategories = categoriesSnapshot.docs.map(docToJSON) as Category[];

  const brandsSnapshot = await getDocs(collection(db, 'brands'));
  const allBrands = brandsSnapshot.docs.map(docToJSON) as Brand[];
  const productBrand = allBrands.find(b => b.name === product.brand);


  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            ...(productBrand ? [{ label: productBrand.name, href: `/brand/${productBrand.permalink}` }] : []),
            { label: product.name, href: `/products/${product.permalink}` },
          ]}
        />

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-9">
            <ProductDetailsClient product={productWithCalculatedRating} brand={productBrand} />
          </div>

          {/* Right Delivery & Customer Assurance Column */}
          <div className="lg:col-span-3 hidden lg:block space-y-4">
            {/* Delivery & Assurance Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <h3 className="font-headline font-bold text-sm text-foreground flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Delivery & Services
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 pb-2.5 border-b border-border/60">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Fast Delivery</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">
                      Inside Dhaka: ৳60 (24-48h)<br />
                      Outside Dhaka: ৳120 (2-4 days)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2.5 border-b border-border/60">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Cash on Delivery</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">
                      Pay upon delivery or via bKash / Cards
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pb-2.5 border-b border-border/60">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">100% Authentic Product</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">
                      Official Brand Certified with Official Warranty
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">7 Days Replacement</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">
                      Easy replacement if found defective
                    </div>
                  </div>
                </div>
              </div>

              {/* Support hotline */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-primary" />
                  Need Help?
                </span>
                <a
                  href="tel:09677460460"
                  className="font-bold text-primary hover:underline font-mono"
                >
                  09677460460
                </a>
              </div>
            </div>

            {/* Club Points & Member Perk Card */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-xs text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Earn Club Points</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Earn points on this purchase to unlock tier discounts and redeem cashback on future orders.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex flex-col gap-10">
            <ProductNavTabs />

            <section id="specification" className="scroll-mt-32 md:scroll-mt-36">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Specification</h2>
              </div>
              <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
                <CardHeader className="bg-muted/40 py-3.5 px-6 border-b">
                  <CardTitle className="text-sm font-semibold">General Information & Technical Specs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {Object.entries(product.specifications || {}).map(([key, value], idx) => (
                        <TableRow key={key} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <TableCell className="font-semibold text-xs sm:text-sm text-foreground w-1/3 py-3 px-6 border-r border-border/40">
                            {key}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-muted-foreground py-3 px-6" dangerouslySetInnerHTML={{ __html: value }} />
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            <section id="description" className="scroll-mt-32 md:scroll-mt-36">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Product Overview & Features</h2>
              </div>
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardContent className="p-6 sm:p-8">
                  <div
                    className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
            </section>

            <section id="questions" className="scroll-mt-32 md:scroll-mt-36">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Questions & Answers</h2>
              </div>
              <Card className="rounded-2xl border-border/80 shadow-xs">
                <CardHeader className="py-4 px-6 border-b bg-muted/20">
                  <CardTitle className="text-sm font-semibold">Community Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-xs sm:text-sm text-muted-foreground">Have a question about this product? Contact our support hotline or submit an inquiry to get an expert answer.</p>
                </CardContent>
              </Card>
            </section>

            <section id="video" className="scroll-mt-32 md:scroll-mt-36">
              <div className="flex items-center gap-2 mb-4">
                <VideoIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Product Video Showcase</h2>
              </div>
              <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
                <CardHeader className="py-4 px-6 border-b bg-muted/20">
                  <CardTitle className="text-sm font-semibold">Official Product Video</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xs border">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Product Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="reviews" className="scroll-mt-32 md:scroll-mt-36">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Customer Reviews</h2>
              </div>
              <Reviews productId={product.id} reviews={approvedReviews} averageRating={averageRating} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

