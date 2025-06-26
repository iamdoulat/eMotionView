export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
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

export const products: Product[] = [
  {
    id: '1',
    name: 'Aura Drone',
    description: 'A state-of-the-art quadcopter with a 4K camera, 30-minute flight time, and intelligent flight modes. Perfect for aerial photography and videography.',
    price: 799.99,
    category: 'Drones',
    brand: 'AeroTech',
    rating: 4.8,
    reviewCount: 256,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['4K Ultra HD Camera', '3-Axis Gimbal', '30-Minute Flight Time', 'GPS and GLONASS', 'Obstacle Avoidance'],
  },
  {
    id: '2',
    name: 'Cybernetic VR Headset',
    description: 'Immerse yourself in virtual worlds with this next-gen VR headset, featuring ultra-low latency and a high-resolution display.',
    price: 499.00,
    category: 'VR/AR',
    brand: 'VirtuVision',
    rating: 4.6,
    reviewCount: 412,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['4K per eye resolution', '120Hz Refresh Rate', 'Inside-out tracking', 'Integrated 3D Audio', 'Comfortable Ergonomic Design'],
  },
  {
    id: '3',
    name: 'Quantum Smartwatch',
    description: 'A sleek and powerful smartwatch that tracks your fitness, manages notifications, and more, all with a vibrant AMOLED display.',
    price: 249.50,
    category: 'Wearables',
    brand: 'ChronoCorp',
    rating: 4.5,
    reviewCount: 890,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['1.4" AMOLED Display', 'Heart Rate & SpO2 Monitoring', 'Built-in GPS', '5 ATM Water Resistance', '14-Day Battery Life'],
  },
  {
    id: '4',
    name: 'NovaBook Pro',
    description: 'A high-performance laptop for professionals and creatives, featuring a stunning 16-inch display and the latest-gen processor.',
    price: 1999.99,
    category: 'Laptops',
    brand: 'NovaCompute',
    rating: 4.9,
    reviewCount: 320,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['16" Liquid Retina XDR display', 'M3 Pro Chip', 'Up to 36GB Unified Memory', '1TB SSD Storage', 'Studio-quality mics'],
  },
  {
    id: '5',
    name: 'Echo Sound System',
    description: 'A smart home sound system that delivers rich, room-filling audio and connects seamlessly with your favorite streaming services.',
    price: 349.00,
    category: 'Audio',
    brand: 'Sonica',
    rating: 4.7,
    reviewCount: 543,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['360-degree audio', 'Multi-room support', 'Wi-Fi and Bluetooth', 'Voice control compatible', 'Easy setup'],
  },
  {
    id: '6',
    name: 'Stealth Gaming Mouse',
    description: 'Gain a competitive edge with this ultra-lightweight, high-precision gaming mouse designed for esports professionals.',
    price: 89.99,
    category: 'Accessories',
    brand: 'Raptor Gaming',
    rating: 4.8,
    reviewCount: 1204,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['59g Ultra-lightweight', '26,000 DPI Optical Sensor', 'Optical Mouse Switches', '8 Programmable Buttons', 'Speedflex Cable'],
  },
  {
    id: '7',
    name: 'Portable Power Bank 20K',
    description: 'Charge your devices on the go with this high-capacity 20,000mAh power bank, featuring fast charging for multiple gadgets.',
    price: 59.99,
    category: 'Accessories',
    brand: 'EnerMax',
    rating: 4.9,
    reviewCount: 2310,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['20,000mAh Capacity', '45W Power Delivery', 'Charge 3 devices at once', 'Airline compliant', 'LED Display'],
  },
  {
    id: '8',
    name: 'Sentinel Smart Lock',
    description: 'Secure your home with the touch of a button or a simple voice command. Keyless entry has never been easier or more secure.',
    price: 229.00,
    category: 'Smart Home',
    brand: 'Guardian Tech',
    rating: 4.6,
    reviewCount: 488,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    features: ['Fingerprint & Keypad entry', 'Auto-lock feature', 'Remote access via app', 'Activity Log', 'Guest Access Codes'],
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
