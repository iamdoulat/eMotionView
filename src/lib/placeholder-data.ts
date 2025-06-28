
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


export const products: Product[] = [
  {
    id: '1',
    name: 'Haylou Iron Neo Smart watch with 3ATM',
    permalink: 'haylou-iron-neo-smart-watch-with-3atm',
    description: 'A stylish and durable smartwatch with 3ATM water resistance, perfect for tracking your fitness goals and staying connected on the go.',
    price: 3099,
    originalPrice: 3199,
    discountPercentage: 4,
    category: 'Wearables',
    brand: 'Haylou',
    rating: 5,
    reviewCount: 256,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['3ATM Water Resistance', 'Heart Rate Monitoring', 'Multiple Sports Modes', 'Call & Message Notifications', 'Long Battery Life'],
    specifications: {
      'Display': '1.5" IPS Screen',
      'Water Resistance': '3ATM',
      'Bluetooth': 'v5.2',
      'Modes': 'Multiple Sports Modes',
      'Features': 'Call & Message Notifications',
      'Battery': 'Long Battery Life',
    },
    sku: 'HL-SW-IN-01',
    stock: 55,
    manageStock: true,
    supplier: 'Haylou Direct',
    points: 100,
    productType: 'Physical',
    productAttributes: [
      { name: 'Color', values: ['Black', 'Silver'] },
    ],
  },
  {
    id: '2',
    name: 'HAYLOU HQ5 28dB ANC TWS Earbuds',
    permalink: 'haylou-hq5-28db-anc-tws-earbuds',
    description: 'Experience immersive sound with these true wireless earbuds featuring 28dB Active Noise Cancellation and a comfortable, ergonomic design.',
    price: 1499,
    category: 'Audio',
    brand: 'Haylou',
    rating: 5,
    reviewCount: 412,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['28dB Active Noise Cancellation', 'Bluetooth 5.3', 'Low Latency Game Mode', 'Up to 30 Hours Playtime', 'Crystal Clear Calls'],
    specifications: {
      'Noise Cancellation': '28dB ANC',
      'Bluetooth': 'v5.3',
      'Game Mode': 'Low Latency',
      'Playtime': 'Up to 30 Hours with charging case',
      'Microphone': 'Crystal Clear Calls with ENC',
    },
    sku: 'HL-EB-HQ5-01',
    stock: 8,
    manageStock: true,
    supplier: 'Haylou Direct',
    points: 50,
    productType: 'Physical',
  },
  {
    id: '3',
    name: 'Mibro Lite 3 BT Calling Smartwatch with 2 ATM',
    permalink: 'mibro-lite-3-bt-calling-smartwatch-with-2-atm',
    description: 'A sleek and powerful smartwatch that tracks your fitness, manages notifications, and lets you take calls directly from your wrist.',
    price: 4999,
    originalPrice: 5499,
    discountPercentage: 10,
    category: 'Wearables',
    brand: 'Mibro',
    rating: 5,
    reviewCount: 890,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['Bluetooth Calling', '1.4" AMOLED Display', 'Heart Rate & SpO2 Monitoring', '2 ATM Water Resistance', '70 Sports Modes'],
    specifications: {
      'Display': '1.4" AMOLED Display',
      'Calling': 'Bluetooth Calling',
      'Health Monitoring': 'Heart Rate & SpO2',
      'Water Resistance': '2 ATM',
      'Sports Modes': '70+',
    },
    sku: 'MB-SW-L3-01',
    stock: 0,
    manageStock: true,
    supplier: 'Mibro Inc.',
    points: 150,
    productType: 'Physical',
    productAttributes: [
      { name: 'Color', values: ['Black', 'Gold'] },
      { name: 'Size', values: ['Large'] }
    ],
  },
  {
    id: '4',
    name: 'Amazfit Active 2R Smart Watch with...',
    permalink: 'amazfit-active-2r-smart-watch-with',
    description: 'A high-performance smartwatch for active lifestyles, featuring advanced health tracking and a rugged design.',
    price: 13999,
    category: 'Wearables',
    brand: 'Amazfit',
    rating: 5,
    reviewCount: 320,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['Built-in GPS', 'Advanced Sleep Tracking', 'Stress Monitoring', '5 ATM Water Resistance', 'Long Battery Life'],
    specifications: {
      'GPS': 'Built-in high-precision GPS',
      'Health': 'Advanced Sleep & Stress Tracking',
      'Water Resistance': '5 ATM',
      'Battery': 'Up to 14 days typical usage',
      'Display': '1.39" HD AMOLED',
    },
    sku: 'AF-SW-A2R-01',
    stock: 23,
    manageStock: true,
    supplier: 'Global Imports',
    productType: 'Physical',
  },
  {
    id: '5',
    name: 'Haylou Solar Ultra BT calling Smart Watch',
    permalink: 'haylou-solar-ultra-bt-calling-smart-watch',
    description: 'A premium smartwatch with a stunning display and Bluetooth calling capabilities, designed to complement your style.',
    price: 7499,
    category: 'Wearables',
    brand: 'Haylou',
    rating: 5,
    reviewCount: 543,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['AMOLED Display', 'Bluetooth Calling', '100+ Sports Modes', 'Always-On Display', 'SpO2 & Heart Rate Tracking'],
    specifications: {
      'Display': '1.43" AMOLED Display',
      'Calling': 'Bluetooth Calling via watch',
      'Sports Modes': '100+',
      'Features': 'Always-On Display, SpO2 & Heart Rate Tracking',
      'Material': 'Metal Bezel',
    },
    sku: 'HL-SW-SU-01',
    stock: 5,
    manageStock: true,
    supplier: 'Haylou Direct',
    productType: 'Physical',
  },
  {
    id: '6',
    name: 'KOSPET TANK T3 ULTRA 2 Special Edition',
    permalink: 'kospet-tank-t3-ultra-2-special-edition',
    description: 'A rugged and durable smartwatch for the modern adventurer, built to withstand the toughest conditions.',
    price: 11999,
    originalPrice: 12999,
    discountPercentage: 8,
    category: 'Wearables',
    brand: 'KOSPET',
    rating: 5,
    reviewCount: 1204,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['Military Grade Durability', 'Dual-band GPS', '5 ATM & IP69K Waterproof', 'Blood Oxygen Monitoring', 'Compass & Barometer'],
    specifications: {
      'Durability': 'MIL-STD-810H Military Grade',
      'GPS': 'Dual-band & 6 Satellite Positioning Systems',
      'Waterproof': '5 ATM & IP69K',
      'Health': 'Blood Oxygen, Heart Rate, Blood Pressure',
      'Sensors': 'Compass & Barometer',
    },
    sku: 'KP-SW-T3U-01',
    stock: 15,
    manageStock: true,
    supplier: 'Global Imports',
    productType: 'Physical',
  },
  {
    id: '7',
    name: 'Portable Power Bank 20K',
    permalink: 'portable-power-bank-20k',
    description: 'Charge your devices on the go with this high-capacity 20,000mAh power bank, featuring fast charging for multiple gadgets.',
    price: 2500,
    category: 'Accessories',
    brand: 'EnerMax',
    rating: 4.9,
    reviewCount: 2310,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['20,000mAh Capacity', '45W Power Delivery', 'Charge 3 devices at once', 'Airline compliant', 'LED Display'],
    specifications: {
      'Capacity': '20,000mAh / 74Wh',
      'Output': '45W Power Delivery (USB-C)',
      'Ports': '2x USB-A, 1x USB-C',
      'Compliance': 'Airline Carry-on Compliant',
      'Display': 'Digital LED for battery percentage',
    },
    sku: 'EM-PB-20K-01',
    stock: 150,
    manageStock: true,
    supplier: 'Global Imports',
    productType: 'Physical',
  },
  {
    id: '8',
    name: 'Sentinel Smart Lock',
    permalink: 'sentinel-smart-lock',
    description: 'Secure your home with the touch of a button or a simple voice command. Keyless entry has never been easier or more secure.',
    price: 10500,
    category: 'Smart Home',
    brand: 'Guardian Tech',
    rating: 4.6,
    reviewCount: 488,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['Fingerprint & Keypad entry', 'Auto-lock feature', 'Remote access via app', 'Activity Log', 'Guest Access Codes'],
    specifications: {
      'Unlock Methods': 'Fingerprint, Keypad, App, Mechanical Key',
      'Security': 'Auto-lock, Anti-peep keypad',
      'Connectivity': 'WiFi (via gateway), Bluetooth',
      'Power': '4x AA Batteries',
      'Guest Access': 'Temporary codes and eKeys',
    },
    sku: 'GT-SL-01',
    stock: 3,
    manageStock: true,
    supplier: 'Guardian Tech',
    productType: 'Physical',
  },
  {
    id: '9',
    name: 'Digital Art Pack - Sci-Fi Edition',
    permalink: 'digital-art-pack-sci-fi-edition',
    description: 'A collection of 20 high-resolution digital artworks with a sci-fi theme. Perfect for wallpapers, prints, or creative projects.',
    price: 25,
    category: 'Digital Products',
    brand: 'Studio Creations',
    rating: 4.8,
    reviewCount: 150,
    images: ['https://placehold.co/600x600.png'],
    features: ['20 PNG files', '4K Resolution (3840x2160)', 'Instant Download', 'Commercial use license included'],
    specifications: {
      'File Format': 'PNG',
      'Resolution': '3840x2160',
      'File Count': '20',
      'License': 'Commercial Use',
    },
    sku: 'DG-ART-SF-01',
    stock: 9999,
    manageStock: false,
    supplier: 'Studio Creations',
    productType: 'Digital',
    downloadUrl: 'https://example.com/download/scifi-art-pack.zip',
    digitalProductNote: 'Your download link will be available immediately after purchase in your order details section. The link will expire in 72 hours.',
  },
];

export const reviews: Review[] = [
  {
    id: '1',
    productId: '1',
    author: 'Jane Doe',
    avatar: 'https://placehold.co/40x40.png',
    rating: 5,
    title: 'Absolutely incredible!',
    comment: "The video quality is breathtaking and it's so easy to fly. The obstacle avoidance gives me peace of mind. Worth every penny.",
    date: '2024-05-15',
    status: 'approved',
    reply: {
      text: "We're so glad you're enjoying the watch! Happy fitness tracking!",
      date: '2024-05-16',
      author: 'Admin',
    }
  },
  {
    id: '2',
    productId: '1',
    author: 'John Smith',
    avatar: 'https://placehold.co/40x40.png',
    rating: 4,
    title: 'Great watch, but battery could be better',
    comment: "The watch works great and has all the features I need. The only downside is the battery life is a little shorter than advertised with heavy use.",
    date: '2024-05-12',
    status: 'approved',
  },
  {
    id: '3',
    productId: '2',
    author: 'Emily White',
    avatar: 'https://placehold.co/40x40.png',
    rating: 5,
    title: 'Truly immersive experience',
    comment: "The noise cancellation is insane, I can't hear anything else when I have these on. The sound quality is crisp and clear.",
    date: '2024-04-30',
    status: 'approved',
  },
  {
    id: '4',
    productId: '4',
    author: 'Michael Brown',
    avatar: 'https://placehold.co/40x40.png',
    rating: 5,
    title: 'The perfect fitness companion',
    comment: "This watch handles all my workout tracking perfectly. GPS is accurate and the health metrics are very detailed. Highly recommend for any athlete.",
    date: '2024-05-20',
    status: 'pending',
  },
   {
    id: '5',
    productId: '1',
    author: 'Chris Green',
    avatar: 'https://placehold.co/40x40.png',
    rating: 5,
    title: 'A stylish and professional watch',
    comment: "I love the design. It looks great whether I'm at the gym or in a business meeting. The screen is bright and easy to read in sunlight.",
    date: '2024-05-18',
    status: 'pending',
  },
];

export const orders: Order[] = [
  {
    id: '1',
    orderNumber: 'USA-123456789',
    date: '2024-05-20',
    customerName: 'William Kim',
    customerAvatar: 'https://placehold.co/40x40.png',
    status: 'Delivered',
    total: 829.98,
    items: [
      {
        productId: '1',
        name: 'Aura Drone',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 799.99,
        productType: 'Physical',
      },
    ],
  },
  {
    id: '2',
    orderNumber: 'USA-987654321',
    date: '2024-05-18',
    customerName: 'Jackson Lee',
    customerAvatar: 'https://placehold.co/40x40.png',
    status: 'Shipped',
    total: 249.50,
    items: [
      {
        productId: '3',
        name: 'Quantum Smartwatch',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 249.50,
        productType: 'Physical',
      },
    ],
  },
  {
    id: '3',
    orderNumber: 'USA-555555555',
    date: '2024-05-15',
    customerName: 'Olivia Martin',
    customerAvatar: 'https://placehold.co/40x40.png',
    status: 'Processing',
    total: 588.99,
    items: [
      {
        productId: '5',
        name: 'Echo Sound System',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 349.00,
        productType: 'Physical',
      },
      {
        productId: '8',
        name: 'Sentinel Smart Lock',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 229.00,
        productType: 'Physical',
      },
    ],
  },
  {
    id: '4',
    orderNumber: 'USA-112233445',
    date: '2024-04-10',
    customerName: 'Isabella Nguyen',
    customerAvatar: 'https://placehold.co/40x40.png',
    status: 'Cancelled',
    total: 1999.99,
    items: [
      {
        productId: '4',
        name: 'NovaBook Pro',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 1999.99,
        productType: 'Physical',
      },
    ],
  },
  {
    id: '5',
    orderNumber: 'USA-667788990',
    date: '2024-05-22',
    customerName: 'Sofia Davis',
    customerAvatar: 'https://placehold.co/40x40.png',
    status: 'Processing',
    total: 1499.00,
    items: [
      {
        productId: '2',
        name: 'HAYLOU HQ5 28dB ANC TWS Earbuds',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 1499.00,
        productType: 'Physical',
      },
    ],
  },
  {
    id: '6',
    orderNumber: 'USA-DIGITAL-01',
    date: '2024-05-23',
    customerName: 'John Doe',
    customerAvatar: 'https://placehold.co/40x40.png',
    status: 'Delivered',
    total: 25.00,
    items: [
      {
        productId: '9',
        name: 'Digital Art Pack - Sci-Fi Edition',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 25.00,
        productType: 'Digital',
        downloadUrl: 'https://example.com/download/scifi-art-pack.zip',
        digitalProductNote: 'Your download link will be available immediately after purchase in your order details section. The link will expire in 72 hours.',
      },
    ],
  },
];

export const users: User[] = [
  {
    id: '1',
    uid: 'admin-user-01',
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-05-01',
    status: 'Active',
    lastLogin: '2024-05-22T10:00:00Z',
    role: 'Admin',
    points: 0,
  },
   {
    id: '6',
    uid: 'manager-user-01',
    name: 'David Chen',
    email: 'david.chen@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-05-02',
    status: 'Active',
    lastLogin: '2024-05-22T11:00:00Z',
    role: 'Manager',
    points: 0,
  },
  {
    id: '7',
    uid: 'staff-user-01',
    name: 'Sarah Miller',
    email: 'sarah.miller@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-05-03',
    status: 'Active',
    lastLogin: '2024-05-22T09:30:00Z',
    role: 'Staff',
    points: 0,
  },
  {
    id: '2',
    uid: 'customer-user-01',
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-04-15',
    status: 'Active',
    lastLogin: '2024-05-21T14:30:00Z',
    role: 'Customer',
    points: 1250,
  },
  {
    id: '3',
    uid: 'customer-user-02',
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-03-20',
    status: 'Inactive',
    lastLogin: '2024-04-25T08:00:00Z',
    role: 'Customer',
    points: 300,
  },
  {
    id: '4',
    uid: 'customer-user-03',
    name: 'William Kim',
    email: 'will@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-02-10',
    status: 'Active',
    lastLogin: '2024-05-22T11:00:00Z',
    role: 'Customer',
    points: 580,
  },
  {
    id: '5',
    uid: 'customer-user-04',
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-01-05',
    status: 'Active',
    lastLogin: '2024-05-20T18:45:00Z',
    role: 'Customer',
    points: 2400,
  },
];
