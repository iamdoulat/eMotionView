
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
  createdAt?: string;
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

export const categories: Category[] = [
  { id: 'cat-1', name: 'Wearables', description: 'Smartwatches and other wearable technology.' },
  { id: 'cat-2', name: 'Audio', description: 'Headphones, earbuds, and speakers.' },
  { id: 'cat-3', name: 'Smart Home', description: 'Connected devices for your home.' },
  { id: 'cat-4', name: 'Accessories', description: 'Chargers, cables, power banks, and more.' },
  { id: 'cat-5', name: 'Smartphones', description: 'The latest mobile phones.' },
  { id: 'cat-6', name: 'Laptops', description: 'Portable computers for work and play.' },
  { id: 'cat-7', name: 'Drones', description: 'Flying cameras and recreational drones.' },
  { id: 'cat-8', name: 'Digital Products', description: 'Downloadable products and services.' },
];

export const brands: Brand[] = [
  { id: 'brand-1', name: 'Haylou', logo: 'https://placehold.co/100x40.png' },
  { id: 'brand-2', name: 'Mibro', logo: 'https://placehold.co/100x40.png' },
  { id: 'brand-3', name: 'Amazfit', logo: 'https://placehold.co/100x40.png' },
  { id: 'brand-4', name: 'KOSPET', logo: 'https://placehold.co/100x40.png' },
  { id: 'brand-5', name: 'EnerMax', logo: 'https://placehold.co/100x40.png' },
  { id: 'brand-6', name: 'Guardian Tech', logo: 'https://placehold.co/100x40.png' },
  { id: 'brand-7', name: 'Studio Creations', logo: 'https://placehold.co/100x40.png' },
];

export const attributes: Attribute[] = [
  { id: 'attr-1', name: 'Color', values: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red'] },
  { id: 'attr-2', name: 'Storage', values: ['128GB', '256GB', '512GB', '1TB'] },
  { id: 'attr-3', name: 'Size', values: ['Small', 'Medium', 'Large'] },
];

export const suppliers: Supplier[] = [
  { id: 'sup-1', name: 'Haylou Direct', contactPerson: 'Alex Green', email: 'alex@hayloudirect.com' },
  { id: 'sup-2', name: 'Mibro Inc.', contactPerson: 'Brenda Smith', email: 'brenda@mibro.com' },
  { id: 'sup-3', name: 'Global Imports', contactPerson: 'Charles Davis', email: 'sales@globalimports.net' },
  { id: 'sup-4', name: 'Studio Creations', contactPerson: 'Digital Team', email: 'digital@studiocreations.com' },
];


export const products: Product[] = [];
export const reviews: Review[] = [];
export const orders: Order[] = [];
export const users: User[] = [];
