
import { collection, getDocs } from 'firebase/firestore';
import { db, docToJSON } from './firebase';
import type { Product, Review } from './placeholder-data';

// Fetches all reviews and maps them by productId
async function getAllReviewsByProduct() {
  const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
  const allReviews = reviewsSnapshot.docs.map(docToJSON) as Review[];
  
  const reviewsByProduct: Record<string, Review[]> = {};
  for (const review of allReviews) {
    if (!reviewsByProduct[review.productId]) {
      reviewsByProduct[review.productId] = [];
    }
    reviewsByProduct[review.productId].push(review);
  }
  return reviewsByProduct;
}

// Enriches a list of products with calculated ratings and review counts
export async function enrichProductsWithReviews(products: Product[]): Promise<Product[]> {
  const reviewsByProduct = await getAllReviewsByProduct();

  return products.map(product => {
    const productReviews = reviewsByProduct[product.id] || [];
    const approvedReviews = productReviews.filter(r => r.status === 'approved');
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
