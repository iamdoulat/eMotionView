

export type Product = {
  id: string;
  name: string;
  permalink?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  categories: string[];
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
  warranty?: string;
  points?: number;
  productType: 'Physical' | 'Digital';
  downloadUrl?: string;
  digitalProductNote?: string;
  productAttributes?: { name: string; values: string[] }[];
  createdAt?: string; // Added timestamp field
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
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

export type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type PaymentMethod = 'card' | 'bkash';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type BkashPaymentDetails = {
  paymentID: string;
  transactionID?: string;
  trxID?: string;
  payerReference?: string;
  customerMsisdn?: string;
  amount: number;
  currency: string;
  intent: string;
  merchantInvoiceNumber?: string;
}

export type PaymentDetails = {
  method: PaymentMethod;
  status: PaymentStatus;
  bkash?: BkashPaymentDetails;
}

export type BkashSettings = {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  isSandbox: boolean;
  isEnabled: boolean;
  baseURL: string;
  updatedAt?: string;
  updatedBy?: string;
}


export type Order = {
  id: string;
  userId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerAvatar: string;
  customerEmail: string;
  status: 'Pending' | 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  total: number;
  shippingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentDetails?: PaymentDetails;
  items: {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    productType: 'Physical' | 'Digital';
    downloadUrl?: string;
    digitalProductNote?: string;
    permalink?: string;
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
  permalink: string;
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
  permalink: string;
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
  permalink: string;
};

// Types for Homepage Settings
export interface FeaturedCategory {
  id: string;
  name: string;
  image: string;
}
export interface PromoBanner {
  id: string;
  image: string;
  link?: string;
}
export interface SingleBanner {
  image: string;
  link?: string;
}
export type SectionType =
  | 'featured-categories'
  | 'product-grid'
  | 'promo-banner-pair'
  | 'single-banner-large'
  | 'promo-banner-trio'
  | 'one-column-banner'
  | 'two-column-banner'
  | 'three-column-banner';

export interface Section {
  id: string;
  name: string;
  type: SectionType;
  content: any;
}
export interface HeroBanner {
  id: number;
  image: string;
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  link?: string;
}

export interface FooterSettings {
  logo: string;
  description: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  appStore: {
    link: string;
    image: string;
  };
  googlePlay: {
    link: string;
    image: string;
  };
  companyLinks: {
    label: string;
    href: string;
  }[];
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  memberships: {
    id: string;
    name: string;
    link: string;
    image: string;
  }[];
  paymentMethodsImage: string;
  copyrightText: string;
  securityBadges: {
    id: string;
    name: string;
    image: string;
  }[];
}


export const products: Product[] = [
  {
    id: 'kospet-tank-t2-smartwatch',
    name: 'KOSPET TANK T2 Smartwatch',
    permalink: 'kospet-tank-t2-smartwatch',
    description: 'The KOSPET TANK T2 is a rugged smartwatch designed for durability and outdoor activities, featuring a military-grade build, long battery life, and comprehensive health tracking.',
    price: 129,
    originalPrice: 159,
    discountPercentage: 19,
    categories: ['Wearables'],
    brand: 'KOSPET',
    rating: 4.8,
    reviewCount: 150,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: [
      'U.S. MIL-STD-810H Certified',
      '5ATM & IP69K Waterproof',
      '1.43" AMOLED Display',
      'Bluetooth Calling with HIFI Audio',
      '70 Sports Modes with Smart Recognition'
    ],
    specifications: {
      'Display': '1.43 inch AMOLED, 466x466 resolution',
      'Battery': '410mAh Pure Cobalt Battery',
      'Connectivity': 'Bluetooth 5.0',
      'Waterproof Rating': '5ATM & IP69K',
      'Body Materials': 'Metal+ABS+PC'
    },
    sku: 'KSPT-TNK-T2',
    stock: 50,
    supplier: 'KOSPET Direct',
    warranty: '1 Year Brand Warranty',
    points: 130,
    productType: 'Physical',
    createdAt: '2023-10-01T12:00:00Z',
  },
  {
    id: 'haylou-solar-plus-rt3-smartwatch',
    name: 'Haylou Solar Plus RT3 Smartwatch',
    permalink: 'haylou-solar-plus-rt3-smartwatch',
    description: 'A stylish and affordable smartwatch with a crisp AMOLED display, Bluetooth phone calls, and extensive health monitoring features.',
    price: 55,
    categories: ['Wearables'],
    brand: 'Haylou',
    rating: 4.6,
    reviewCount: 230,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: [
      '1.43" AMOLED Display',
      'Bluetooth Phone Calls',
      '105 Sport Modes',
      'SpO2 and Heart Rate Monitoring',
      'IP68 Waterproof'
    ],
    specifications: {
      'Display': '1.43 inch AMOLED, 466x466 resolution',
      'Battery': '280mAh, 7-day battery life',
      'Connectivity': 'Bluetooth 5.2',
      'Waterproof Rating': 'IP68',
      'Sensors': 'Heart rate sensor, motion sensor, SpO2 sensor'
    },
    sku: 'HAY-SOL-RT3',
    stock: 120,
    supplier: 'Haylou Official',
    warranty: '1 Year Brand Warranty',
    points: 55,
    productType: 'Physical',
    createdAt: '2023-10-02T12:00:00Z',
  },
  {
    id: 'soundpeats-air4-wireless-earbuds',
    name: 'Soundpeats Air4 Wireless Earbuds',
    permalink: 'soundpeats-air4-wireless-earbuds',
    description: 'Experience superior sound with Qualcomm aptX Lossless audio, adaptive hybrid active noise cancellation, and long battery life.',
    price: 79,
    categories: ['Audio'],
    brand: 'Soundpeats',
    rating: 4.7,
    reviewCount: 95,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: [
      'aptX Lossless Audio',
      'Adaptive Hybrid Active Noise Cancellation',
      'Bluetooth 5.3 Multipoint Connection',
      '6-Mic CVC Noise Cancellation for Calls',
      '26 Hours of Playtime'
    ],
    specifications: {
      'Bluetooth': 'V5.3',
      'Profiles': 'A2DP/AVRCP/HFP/HSP',
      'Chipset': 'QCC3071',
      'Supported Codecs': 'aptX Lossless/aptX Adaptive/AAC/SBC',
      'Battery Capacity': '35*2 mAH (earbuds), 330mAH (case)'
    },
    sku: 'SP-AIR4-BLK',
    stock: 80,
    supplier: 'Soundpeats Global',
    warranty: '6 Months Warranty',
    points: 80,
    productType: 'Physical',
    createdAt: '2023-10-03T12:00:00Z',
  },
  {
    id: 'qcy-t13-anc-true-wireless-earbuds',
    name: 'QCY-T13 ANC True Wireless Earbuds',
    permalink: 'qcy-t13-anc-earbuds',
    description: 'Immerse yourself in your music with Active Noise Cancellation and enjoy crystal clear calls with a 4-mic array.',
    price: 35,
    originalPrice: 45,
    discountPercentage: 22,
    categories: ['Audio'],
    brand: 'QCY',
    rating: 4.5,
    reviewCount: 512,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: [
      '28dB Active Noise Cancelling',
      '10mm Dynamic Driver',
      'Bluetooth 5.3',
      '30-Hour total battery life',
      'Wind noise cancellation'
    ],
    specifications: {
      'Driver': '10mm dynamic driver',
      'Connectivity': 'Bluetooth 5.3',
      'Playtime': '7h (ANC off), 5.5h (ANC on)',
      'Total Battery': '30h with charging case',
      'Waterproof': 'IPX5'
    },
    sku: 'QCY-T13-ANC-WHT',
    stock: 250,
    supplier: 'QCY Direct',
    warranty: '6 Months Warranty',
    points: 35,
    productType: 'Physical',
    createdAt: '2023-10-04T12:00:00Z',
  },
];
export const reviews: Omit<Review, 'id' | 'productId'>[] = [];
export const orders: Omit<Order, 'id'>[] = [];

const allUsers: Omit<User, 'id'>[] = [
  {
    uid: 'admin_user_seed_uid',
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'https://placehold.co/100x100.png',
    registeredDate: '2023-01-15T10:00:00Z',
    status: 'Active',
    lastLogin: '2024-05-20T10:00:00Z',
    role: 'Admin',
    points: 1000
  },
  {
    uid: 'manager_user_seed_uid',
    name: 'Manager User',
    email: 'manager@example.com',
    avatar: 'https://placehold.co/100x100.png',
    registeredDate: '2023-02-20T11:00:00Z',
    status: 'Active',
    lastLogin: '2024-05-19T11:00:00Z',
    role: 'Manager',
    points: 500
  },
  {
    uid: 'customer_olivia_seed_uid',
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    avatar: 'https://placehold.co/100x100.png',
    registeredDate: '2023-03-10T12:00:00Z',
    status: 'Active',
    lastLogin: '2024-05-18T12:00:00Z',
    role: 'Customer',
    points: 250
  },
  {
    uid: 'customer_jackson_seed_uid',
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    avatar: 'https://placehold.co/100x100.png',
    registeredDate: '2023-04-05T13:00:00Z',
    status: 'Active',
    lastLogin: '2024-05-17T13:00:00Z',
    role: 'Customer',
    points: 120
  },
  {
    uid: 'customer_isabella_seed_uid',
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: 'https://placehold.co/100x100.png',
    registeredDate: '2023-05-21T14:00:00Z',
    status: 'Inactive',
    lastLogin: '2024-04-01T14:00:00Z',
    role: 'Customer',
    points: 0
  }
];

export const users = allUsers;
export const staffUsers = allUsers.filter(u => u.role !== 'Customer');
export const customerUsers = allUsers.filter(u => u.role === 'Customer');


export const categories: Omit<Category, 'id'>[] = [
  { name: 'Wearables', description: 'Smartwatches and fitness trackers.', permalink: 'wearables' },
  { name: 'Audio', description: 'Headphones, earbuds, and speakers.', permalink: 'audio' },
  { name: 'Smart Home', description: 'Connected devices for your home.', permalink: 'smart-home' },
  { name: 'Accessories', description: 'Chargers, cables, and other essentials.', permalink: 'accessories' },
  { name: 'Laptops', description: 'Portable computers for work and play.', permalink: 'laptops' },
  { name: 'Smartphones', description: 'The latest mobile phones.', permalink: 'smartphones' },
  { name: 'Drones', description: 'Unmanned aerial vehicles for fun and professional use.', permalink: 'drones' },
];
export const brands: Omit<Brand, 'id'>[] = [
  { name: 'KOSPET', logo: 'https://placehold.co/100x40.png', permalink: 'kospet' },
  { name: 'Haylou', logo: 'https://placehold.co/100x40.png', permalink: 'haylou' },
  { name: 'Soundpeats', logo: 'https://placehold.co/100x40.png', permalink: 'soundpeats' },
  { name: 'QCY', logo: 'https://placehold.co/100x40.png', permalink: 'qcy' },
  { name: 'Xiaomi', logo: 'https://placehold.co/100x40.png', permalink: 'xiaomi' },
];
export const attributes: Attribute[] = [
  { id: 'attr-color', name: 'Color', values: ['Black', 'White', 'Silver', 'Blue', 'Red'] },
  { id: 'attr-size', name: 'Size', values: ['S', 'M', 'L', 'XL'] },
  { id: 'attr-storage', name: 'Storage', values: ['64GB', '128GB', '256GB', '512GB'] },
];
export const suppliers: Omit<Supplier, 'id'>[] = [
  { name: 'KOSPET Direct', contactPerson: 'John Kospet', email: 'sales@kospet.com', permalink: 'kospet-direct' },
  { name: 'Haylou Official', contactPerson: 'Jane Haylou', email: 'distro@haylou.com', permalink: 'haylou-official' },
  { name: 'Soundpeats Global', contactPerson: 'Peter Sound', email: 'global@soundpeats.com', permalink: 'soundpeats-global' },
  { name: 'QCY Direct', contactPerson: 'Mary QCY', email: 'contact@qcy.com', permalink: 'qcy-direct' },
  { name: 'Tech Wholesalers Inc.', contactPerson: 'Sam Smith', email: 'sam@techwholesalers.com', permalink: 'tech-wholesalers-inc' },
];

export const predefinedProductGrids: Section[] = [
  { id: 'new-arr', name: "New Arrivals", type: 'product-grid', content: { category: 'newest' } }, // Changed category
  { id: 'pop-prod', name: "Popular Products", type: 'product-grid', content: { category: 'Audio' } },
  { id: 'smart-watches-grid', name: "Smart Watches", type: 'product-grid', content: { category: 'Wearables' } },
  { id: 'headphones-grid', name: "Headphones", type: 'product-grid', content: { category: 'Audio' } },
];

export const defaultHomepageSections: Section[] = [
  {
    id: 'feat-cat', name: "Featured Categories", type: 'featured-categories', content: [
      { id: 'fc1', name: 'Smart Watches', image: 'https://placehold.co/128x128.png' },
      { id: 'fc2', name: 'Headphones', image: 'https://placehold.co/128x128.png' },
      { id: 'fc3', name: 'Android Smart TVs', image: 'https://placehold.co/128x128.png' },
      { id: 'fc4', name: 'Charger & Cables', image: 'https://placehold.co/128x128.png' },
      { id: 'fc5', name: 'Powerbanks', image: 'https://placehold.co/128x128.png' },
    ]
  },
  predefinedProductGrids[0], // New Arrivals
  {
    id: 'promo-ban', name: "Promotional Banners", type: 'promo-banner-pair', content: [
      { id: 'promo1', image: 'https://placehold.co/800x400.png', link: '#' },
      { id: 'promo2', image: 'https://placehold.co/800x400.png', link: '#' },
    ]
  },
  predefinedProductGrids[1], // Popular Products
  { id: 'smart-watch-banner', name: "Smart Watches", type: 'single-banner-large', content: { image: 'https://placehold.co/1200x150.png', link: '/products?category=Wearables' } },
  { id: 'headphones-banner', name: "Headphones", type: 'single-banner-large', content: { image: 'https://placehold.co/1200x150.png', link: '/products?category=Audio' } },
];

export const defaultHeroBanners: HeroBanner[] = [
  {
    id: 1,
    image: `https://placehold.co/900x440.png`,
    headline: "GADGET FEST",
    subheadline: "Up to 60% off on your favorite gadgets.",
    buttonText: "Shop Now",
    link: "/products",
  },
  {
    id: 2,
    image: `https://placehold.co/900x440.png`,
  },
  {
    id: 3,
    image: `https://placehold.co/900x440.png`,
  },
];

export const defaultFooterSettings: FooterSettings = {
  logo: "https://placehold.co/50x50/FFFFFF/1e2128.png",
  description: "Motion View is the largest Eco Product importer and Distributor in Bangladesh and now holds the leading position in the ecosystem industry.",
  socialLinks: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
  },
  appStore: {
    link: "#",
    image: "https://placehold.co/135x40.png"
  },
  googlePlay: {
    link: "#",
    image: "https://placehold.co/135x40.png"
  },
  companyLinks: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "#", label: "Terms and conditions" },
    { href: "#", label: "Return and Refund Policy" },
    { href: "#", label: "EMI" },
    { href: "#", label: "Warranty" },
    { href: "#", label: "Delivery Policy" },
    { href: "#", label: "Support Center" },
    { href: "/contact", label: "Contact Us" },
  ],
  contact: {
    address: "10/25 (9th Commercial Floor), Eastern Plaza, 70 Bir Uttam C.R Datta Road, Hatirpool, Dhaka-1205",
    phone: "09677460460",
    email: "motionview22@gmail.com.bd",
  },
  memberships: [
    { id: "basis", name: "BASIS Member", image: "https://placehold.co/100x40.png", link: "#" },
    { id: "ecab", name: "e-Cab Member", image: "https://placehold.co/100x40.png", link: "#" },
  ],
  paymentMethodsImage: "https://placehold.co/1180x139.png",
  copyrightText: `© ${new Date().getFullYear()} eMotionView. All Rights Reserved by Motion View`,
  securityBadges: [
    { id: 'ssl', name: 'SSL Commerz', image: 'https://placehold.co/121x24.png' },
    { id: 'dmca', name: 'DMCA Protected', image: 'https://placehold.co/121x24.png' },
  ]
};
