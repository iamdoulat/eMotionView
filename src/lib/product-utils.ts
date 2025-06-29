
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, docToJSON } from './firebase';
import type { Product, Review } from './placeholder-data';

// Fetches all approved reviews and maps them by productId
async function getAllApprovedReviewsByProduct() {
  const reviewsCollection = collection(db, 'reviews');
  // Only fetch reviews that have been approved to be publicly visible.
  const q = query(reviewsCollection, where('status', '==', 'approved'));
  const reviewsSnapshot = await getDocs(q);
  const allApprovedReviews = reviewsSnapshot.docs.map(docToJSON) as Review[];
  
  const reviewsByProduct: Record<string, Review[]> = {};
  for (const review of allApprovedReviews) {
    if (!reviewsByProduct[review.productId]) {
      reviewsByProduct[review.productId] = [];
    }
    reviewsByProduct[review.productId].push(review);
  }
  return reviewsByProduct;
}

// Enriches a list of products with calculated ratings and review counts
export async function enrichProductsWithReviews(products: Product[]): Promise<Product[]> {
  const reviewsByProduct = await getAllApprovedReviewsByProduct();

  return products.map(product => {
    const approvedReviews = reviewsByProduct[product.id] || [];
    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount > 0
      ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
      : 0;
      
    return {
      ...product,
      rating: averageRating,
      reviewCount,
    };
  });
}
