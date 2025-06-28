
import { RecommendationForm } from '@/components/recommendation-form';
import { collection, getDocs } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import type { Product } from '@/lib/placeholder-data';
import { enrichProductsWithReviews } from '@/lib/product-utils';

export default async function RecommendationsPage() {
  const productsSnapshot = await getDocs(collection(db, 'products'));
  let products = productsSnapshot.docs.map(docToJSON) as Product[];
  products = await enrichProductsWithReviews(products);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold text-foreground sm:text-5xl">
          AI Product Recommendations
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Describe your needs, interests, or a scenario, and let our AI find the perfect products for you from our catalog.
        </p>
      </header>
      <main>
        <RecommendationForm allProducts={products} />
      </main>
    </div>
  );
}
