import type { Product, Category } from '@/lib/placeholder-data';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import { enrichProductsWithReviews } from '@/lib/product-utils';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryPageClient } from '@/components/category-page-client';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categoriesCollection = collection(db, 'categories');
  const categoryQuery = query(categoriesCollection, where("permalink", "==", params.slug), limit(1));
  const categorySnapshot = await getDocs(categoryQuery);

  if (categorySnapshot.empty) {
    notFound();
  }
  
  const category = docToJSON(categorySnapshot.docs[0]) as Category;

  const productsCollection = collection(db, 'products');
  const productsQuery = query(productsCollection, where("categories", "array-contains", category.name));
  const productsSnapshot = await getDocs(productsQuery);
  let products = productsSnapshot.docs.map(docToJSON) as Product[];
  
  products = await enrichProductsWithReviews(products);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Categories' },
          { label: category.name, href: `/category/${category.permalink}` },
        ]}
      />
      <header className="my-8">
        <h1 className="font-headline text-4xl font-bold text-foreground">{category.name}</h1>
        <p className="text-muted-foreground mt-2">{category.description}</p>
      </header>
      <CategoryPageClient initialProducts={products} category={category} />
    </div>
  );
}