export type Product = {
  id: string;
  name: string;
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
};

export type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  total: number;
  items: {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registeredDate: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  role: 'Admin' | 'Customer';
};

export const products: Product[] = [
  {
    id: '1',
    name: 'Haylou Iron Neo Smart watch with 3ATM',
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
    }
  },
  {
    id: '2',
    name: 'HAYLOU HQ5 28dB ANC TWS Earbuds',
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
    }
  },
  {
    id: '3',
    name: 'Mibro Lite 3 BT Calling Smartwatch with 2 ATM',
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
    }
  },
  {
    id: '4',
    name: 'Amazfit Active 2R Smart Watch with...',
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
    }
  },
  {
    id: '5',
    name: 'Haylou Solar Ultra BT calling Smart Watch',
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
    }
  },
  {
    id: '6',
    name: 'KOSPET TANK T3 ULTRA 2 Special Edition',
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
    }
  },
  {
    id: '7',
    name: 'Portable Power Bank 20K',
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
    }
  },
  {
    id: '8',
    name: 'Sentinel Smart Lock',
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
    }
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
  },
  {
    id: '2',
    productId: '1',
    author: 'John Smith',
    avatar: 'https://placehold.co/40x40.png',
    rating: 4,
    title: 'Great drone, but battery could be better',
    comment: "Flight time is closer to 25 minutes with aggressive flying, but it's a solid piece of hardware. The 4K footage is crisp and stable.",
    date: '2024-05-12',
  },
  {
    id: '3',
    productId: '2',
    author: 'Emily White',
    avatar: 'https://placehold.co/40x40.png',
    rating: 5,
    title: 'Truly immersive experience',
    comment: "The resolution is insane, there's no screen-door effect at all. Setup was a breeze and the integrated audio is a game changer.",
    date: '2024-04-30',
  },
  {
    id: '4',
    productId: '4',
    author: 'Michael Brown',
    avatar: 'https://placehold.co/40x40.png',
    rating: 5,
    title: 'The perfect work machine',
    comment: "This laptop handles everything I throw at it, from 4K video editing to complex code compilations, without breaking a sweat. The display is gorgeous.",
    date: '2024-05-20',
  },
   {
    id: '5',
    productId: '1',
    author: 'Chris Green',
    avatar: 'https://placehold.co/40x40.png',
    rating: 5,
    title: 'A professional tool for creators',
    comment: "I'm a professional photographer and this drone has elevated my work. The gimbal is incredibly smooth and the raw image quality is fantastic for post-processing.",
    date: '2024-05-18',
  },
];

export const orders: Order[] = [
  {
    id: '1',
    orderNumber: 'USA-123456789',
    date: '2024-05-20',
    status: 'Delivered',
    total: 829.98,
    items: [
      {
        productId: '1',
        name: 'Aura Drone',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 799.99,
      },
    ],
  },
  {
    id: '2',
    orderNumber: 'USA-987654321',
    date: '2024-05-18',
    status: 'Shipped',
    total: 249.50,
    items: [
      {
        productId: '3',
        name: 'Quantum Smartwatch',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 249.50,
      },
    ],
  },
  {
    id: '3',
    orderNumber: 'USA-555555555',
    date: '2024-05-15',
    status: 'Processing',
    total: 588.99,
    items: [
      {
        productId: '5',
        name: 'Echo Sound System',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 349.00,
      },
      {
        productId: '8',
        name: 'Sentinel Smart Lock',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 229.00,
      },
    ],
  },
  {
    id: '4',
    orderNumber: 'USA-112233445',
    date: '2024-04-10',
    status: 'Cancelled',
    total: 1999.99,
    items: [
      {
        productId: '4',
        name: 'NovaBook Pro',
        image: 'https://placehold.co/100x100.png',
        quantity: 1,
        price: 1999.99,
      },
    ],
  },
];

export const users: User[] = [
  {
    id: '1',
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-05-01',
    status: 'Active',
    lastLogin: '2024-05-22T10:00:00Z',
    role: 'Admin',
  },
  {
    id: '2',
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-04-15',
    status: 'Active',
    lastLogin: '2024-05-21T14:30:00Z',
    role: 'Customer',
  },
  {
    id: '3',
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-03-20',
    status: 'Inactive',
    lastLogin: '2024-04-25T08:00:00Z',
    role: 'Customer',
  },
  {
    id: '4',
    name: 'William Kim',
    email: 'will@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-02-10',
    status: 'Active',
    lastLogin: '2024-05-22T11:00:00Z',
    role: 'Customer',
  },
  {
    id: '5',
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    avatar: 'https://placehold.co/40x40.png',
    registeredDate: '2024-01-05',
    status: 'Active',
    lastLogin: '2024-05-20T18:45:00Z',
    role: 'Customer',
  },
];
