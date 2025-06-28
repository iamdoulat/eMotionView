
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

export const products: Omit<Product, 'id'>[] = [
    {
      name: 'KOSPET TANK T2 Smartwatch',
      permalink: 'kospet-tank-t2-smartwatch',
      description: 'The KOSPET TANK T2 is a rugged smartwatch designed for durability and outdoor activities, featuring a military-grade build, long battery life, and comprehensive health tracking.',
      price: 129,
      originalPrice: 159,
      discountPercentage: 19,
      category: 'Wearables',
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
      points: 130,
      productType: 'Physical',
    },
    {
      name: 'Haylou Solar Plus RT3 Smartwatch',
      permalink: 'haylou-solar-plus-rt3-smartwatch',
      description: 'A stylish and affordable smartwatch with a crisp AMOLED display, Bluetooth phone calls, and extensive health monitoring features.',
      price: 55,
      category: 'Wearables',
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
      points: 55,
      productType: 'Physical',
    },
    {
        name: 'Soundpeats Air4 Wireless Earbuds',
        permalink: 'soundpeats-air4-wireless-earbuds',
        description: 'Experience superior sound with Qualcomm aptX Lossless audio, adaptive hybrid active noise cancellation, and long battery life.',
        price: 79,
        category: 'Audio',
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
        points: 80,
        productType: 'Physical'
    },
     {
      name: 'QCY-T13 ANC True Wireless Earbuds',
      permalink: 'qcy-t13-anc-earbuds',
      description: 'Immerse yourself in your music with Active Noise Cancellation and enjoy crystal clear calls with a 4-mic array.',
      price: 35,
      originalPrice: 45,
      discountPercentage: 22,
      category: 'Audio',
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
      points: 35,
      productType: 'Physical'
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
    { name: 'Wearables', description: 'Smartwatches and fitness trackers.' },
    { name: 'Audio', description: 'Headphones, earbuds, and speakers.' },
    { name: 'Smart Home', description: 'Connected devices for your home.' },
    { name: 'Accessories', description: 'Chargers, cables, and other essentials.' },
    { name: 'Laptops', description: 'Portable computers for work and play.' },
    { name: 'Smartphones', description: 'The latest mobile phones.' },
    { name: 'Drones', description: 'Unmanned aerial vehicles for fun and professional use.' },
];
export const brands: Omit<Brand, 'id'>[] = [
    { name: 'KOSPET', logo: 'https://placehold.co/100x40.png' },
    { name: 'Haylou', logo: 'https://placehold.co/100x40.png' },
    { name: 'Soundpeats', logo: 'https://placehold.co/100x40.png' },
    { name: 'QCY', logo: 'https://placehold.co/100x40.png' },
    { name: 'Xiaomi', logo: 'https://placehold.co/100x40.png' },
];
export const attributes: Omit<Attribute, 'id'>[] = [
    { name: 'Color', values: ['Black', 'White', 'Silver', 'Blue', 'Red'] },
    { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
    { name: 'Storage', values: ['64GB', '128GB', '256GB', '512GB'] },
];
export const suppliers: Omit<Supplier, 'id'>[] = [
    { name: 'KOSPET Direct', contactPerson: 'John Kospet', email: 'sales@kospet.com' },
    { name: 'Haylou Official', contactPerson: 'Jane Haylou', email: 'distro@haylou.com' },
    { name: 'Soundpeats Global', contactPerson: 'Peter Sound', email: 'global@soundpeats.com' },
    { name: 'QCY Direct', contactPerson: 'Mary QCY', email: 'contact@qcy.com' },
    { name: 'Tech Wholesalers Inc.', contactPerson: 'Sam Smith', email: 'sam@techwholesalers.com' },
];
