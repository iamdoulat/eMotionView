
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
  try {
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
  } catch (error) {
    console.warn("Could not fetch reviews, returning products without enrichment. Error:", error);
    // If fetching reviews fails (e.g., due to permissions for an unauthed user on a restrictive ruleset),
    // return the original products array so the page can still render.
    // We'll ensure the rating and reviewCount fields exist, even if they are default values.
    return products.map(p => ({ 
      ...p, 
      rating: p.rating || 0, 
      reviewCount: p.reviewCount || 0 
    }));
  }
}
