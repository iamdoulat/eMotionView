
export type Product = {
  id: string;
  name: string;
  permalink?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  sku: string;
  stock: number;
  manageStock?: boolean;
  supplier: string;
  points?: number;
  productType: 'Physical' | 'Digital';
  downloadUrl?: string;
  digitalProductNote?: string;
  productAttributes?: { name: string; values: string[] }[];
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  reply?: {
    text: string;
    date: string;
    author: string;
  };
};

export type Order = {
  id: string;
  userId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerAvatar: string;
  status: 'Pending' | 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  total: number;
  items: {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    productType: 'Physical' | 'Digital';
    downloadUrl?: string;
    digitalProductNote?: string;
  }[];
};

export type User = {
  id: string; // Firestore document ID
  uid: string; // Firebase Auth User ID
  name: string;
  email: string;
  mobileNumber?: string;
  avatar: string;
  registeredDate: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  role: 'Admin' | 'Manager' | 'Staff' | 'Customer';
  points?: number;
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
};

export type Attribute = {
  id: string;
  name: string;
  values: string[];
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
};

// This data is now fetched from Firestore. These arrays are kept for type reference if needed.
export const products: Product[] = [];
export const reviews: Review[] = [];
export const orders: Order[] = [];
export const users: User[] = [];
export const categories: Category[] = [];
export const brands: Brand[] = [];
export const attributes: Attribute[] = [];
export const suppliers: Supplier[] = [];
