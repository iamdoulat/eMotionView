
import { ProductCard } from '@/components/product-card';
import type { Product, Supplier } from '@/lib/placeholder-data';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, docToJSON } from '@/lib/firebase';
import { enrichProductsWithReviews } from '@/lib/product-utils';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/breadcrumb';

export default async function SupplierPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const suppliersCollection = collection(db, 'suppliers');
  const supplierQuery = query(suppliersCollection, where("permalink", "==", slug), limit(1));
  const supplierSnapshot = await getDocs(supplierQuery);

  if (supplierSnapshot.empty) {
    notFound();
  }
  
  const supplier = docToJSON(supplierSnapshot.docs[0]) as Supplier;

  const productsCollection = collection(db, 'products');
  const productsQuery = query(productsCollection, where("supplier", "==", supplier.name));
  const productsSnapshot = await getDocs(productsQuery);
  let products = productsSnapshot.docs.map(docToJSON) as Product[];
  
  products = await enrichProductsWithReviews(products);
  
  return (
    <div className="container mx-auto px-4 py-8">
       <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Suppliers' },
            { label: supplier.name, href: `/supplier/${supplier.permalink}` },
          ]}
        />
      <header className="my-8">
        <h1 className="font-headline text-4xl font-bold text-foreground">{supplier.name}</h1>
        <p className="text-muted-foreground mt-2">Products supplied by {supplier.name}</p>
      </header>

      <main>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="mt-4 text-xl font-semibold">No Products Found</h2>
            <p className="mt-2 text-muted-foreground">There are currently no products from the supplier "{supplier.name}".</p>
          </div>
        )}
      </main>
    </div>
  );
}
