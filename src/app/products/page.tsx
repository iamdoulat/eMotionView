
import type { Product } from '@/lib/placeholder-data';
import { collection, getDocs } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import { enrichProductsWithReviews } from '@/lib/product-utils';
import { ProductsPageClient } from '@/components/products-page-client';

export default async function ProductsPage() {
  const productsSnapshot = await getDocs(collection(db, 'products'));
  let products = productsSnapshot.docs.map(docToJSON) as Product[];
  products = await enrichProductsWithReviews(products);

  return (
    <ProductsPageClient initialProducts={products} />
  );
}
