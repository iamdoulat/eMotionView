const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://root:8EELTynvnITXsDIO1VGYB2Ogi99CeK87mVfEZ6zmEHLpqpQOkF94jx3RcotaL38u@129.146.73.94:9000/?directConnection=true';
const dbName = process.env.MONGODB_DB || 'emotiondb';

const staffUsers = [
  { _id: 'admin_user_seed_uid', uid: 'admin_user_seed_uid', name: 'Admin User', email: 'admin@example.com', avatar: 'https://placehold.co/100x100.png', registeredDate: '2023-01-15T10:00:00Z', status: 'Active', lastLogin: '2024-05-20T10:00:00Z', role: 'Admin', points: 1000 },
  { _id: 'manager_user_seed_uid', uid: 'manager_user_seed_uid', name: 'Manager User', email: 'manager@example.com', avatar: 'https://placehold.co/100x100.png', registeredDate: '2023-02-20T11:00:00Z', status: 'Active', lastLogin: '2024-05-19T11:00:00Z', role: 'Manager', points: 500 },
];

const customerUsers = [
  { _id: 'customer_olivia_seed_uid', uid: 'customer_olivia_seed_uid', name: 'Olivia Martin', email: 'olivia.martin@email.com', avatar: 'https://placehold.co/100x100.png', registeredDate: '2023-03-10T12:00:00Z', status: 'Active', lastLogin: '2024-05-18T12:00:00Z', role: 'Customer', points: 250 },
  { _id: 'customer_jackson_seed_uid', uid: 'customer_jackson_seed_uid', name: 'Jackson Lee', email: 'jackson.lee@email.com', avatar: 'https://placehold.co/100x100.png', registeredDate: '2023-04-05T13:00:00Z', status: 'Active', lastLogin: '2024-05-17T13:00:00Z', role: 'Customer', points: 120 },
  { _id: 'customer_isabella_seed_uid', uid: 'customer_isabella_seed_uid', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', avatar: 'https://placehold.co/100x100.png', registeredDate: '2023-05-21T14:00:00Z', status: 'Inactive', lastLogin: '2024-04-01T14:00:00Z', role: 'Customer', points: 0 },
];

const products = [
  { _id: 'kospet-tank-t2-smartwatch', name: 'KOSPET TANK T2 Smartwatch', permalink: 'kospet-tank-t2-smartwatch', description: 'The KOSPET TANK T2 is a rugged smartwatch designed for durability and outdoor activities.', price: 129, originalPrice: 159, discountPercentage: 19, categories: ['Wearables'], brand: 'KOSPET', rating: 4.8, reviewCount: 150, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], features: ['U.S. MIL-STD-810H Certified', '5ATM & IP69K Waterproof', '1.43" AMOLED Display', 'Bluetooth Calling with HIFI Audio', '70 Sports Modes with Smart Recognition'], specifications: { Display: '1.43 inch AMOLED, 466x466 resolution', Battery: '410mAh Pure Cobalt Battery', Connectivity: 'Bluetooth 5.0', WaterproofRating: '5ATM & IP69K', BodyMaterials: 'Metal+ABS+PC' }, sku: 'KSPT-TNK-T2', stock: 50, supplier: 'KOSPET Direct', warranty: '1 Year Brand Warranty', points: 130, productType: 'Physical', createdAt: '2023-10-01T12:00:00Z' },
  { _id: 'haylou-solar-plus-rt3-smartwatch', name: 'Haylou Solar Plus RT3 Smartwatch', permalink: 'haylou-solar-plus-rt3-smartwatch', description: 'A stylish and affordable smartwatch with a crisp AMOLED display.', price: 55, categories: ['Wearables'], brand: 'Haylou', rating: 4.6, reviewCount: 230, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], features: ['1.43" AMOLED Display', 'Bluetooth Phone Calls', '105 Sport Modes', 'SpO2 and Heart Rate Monitoring', 'IP68 Waterproof'], specifications: { Display: '1.43 inch AMOLED, 466x466 resolution', Battery: '280mAh, 7-day battery life', Connectivity: 'Bluetooth 5.2', WaterproofRating: 'IP68', Sensors: 'Heart rate sensor, motion sensor, SpO2 sensor' }, sku: 'HAY-SOL-RT3', stock: 120, supplier: 'Haylou Official', warranty: '1 Year Brand Warranty', points: 55, productType: 'Physical', createdAt: '2023-10-02T12:00:00Z' },
  { _id: 'soundpeats-air4-wireless-earbuds', name: 'Soundpeats Air4 Wireless Earbuds', permalink: 'soundpeats-air4-wireless-earbuds', description: 'Experience superior sound with Qualcomm aptX Lossless audio.', price: 79, categories: ['Audio'], brand: 'Soundpeats', rating: 4.7, reviewCount: 95, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], features: ['aptX Lossless Audio', 'Adaptive Hybrid Active Noise Cancellation', 'Bluetooth 5.3 Multipoint Connection', '6-Mic CVC Noise Cancellation for Calls', '26 Hours of Playtime'], specifications: { Bluetooth: 'V5.3', Profiles: 'A2DP/AVRCP/HFP/HSP', Chipset: 'QCC3071', SupportedCodecs: 'aptX Lossless/aptX Adaptive/AAC/SBC', BatteryCapacity: '35*2 mAH (earbuds), 330mAH (case)' }, sku: 'SP-AIR4-BLK', stock: 80, supplier: 'Soundpeats Global', warranty: '6 Months Warranty', points: 80, productType: 'Physical', createdAt: '2023-10-03T12:00:00Z' },
  { _id: 'qcy-t13-anc-true-wireless-earbuds', name: 'QCY-T13 ANC True Wireless Earbuds', permalink: 'qcy-t13-anc-earbuds', description: 'Immerse yourself in your music with Active Noise Cancellation.', price: 35, originalPrice: 45, discountPercentage: 22, categories: ['Audio'], brand: 'QCY', rating: 4.5, reviewCount: 512, images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], features: ['28dB Active Noise Cancelling', '10mm Dynamic Driver', 'Bluetooth 5.3', '30-Hour total battery life', 'Wind noise cancellation'], specifications: { Driver: '10mm dynamic driver', Connectivity: 'Bluetooth 5.3', Playtime: '7h (ANC off), 5.5h (ANC on)', TotalBattery: '30h with charging case', Waterproof: 'IPX5' }, sku: 'QCY-T13-ANC-WHT', stock: 250, supplier: 'QCY Direct', warranty: '6 Months Warranty', points: 35, productType: 'Physical', createdAt: '2023-10-04T12:00:00Z' },
];

const categories = [
  { _id: 'wearables', name: 'Wearables', description: 'Smartwatches and fitness trackers.', permalink: 'wearables' },
  { _id: 'audio', name: 'Audio', description: 'Headphones, earbuds, and speakers.', permalink: 'audio' },
  { _id: 'smart-home', name: 'Smart Home', description: 'Connected devices for your home.', permalink: 'smart-home' },
  { _id: 'accessories', name: 'Accessories', description: 'Chargers, cables, and other essentials.', permalink: 'accessories' },
  { _id: 'laptops', name: 'Laptops', description: 'Portable computers for work and play.', permalink: 'laptops' },
  { _id: 'smartphones', name: 'Smartphones', description: 'The latest mobile phones.', permalink: 'smartphones' },
  { _id: 'drones', name: 'Drones', description: 'Unmanned aerial vehicles.', permalink: 'drones' },
];

const brands = [
  { _id: 'kospet', name: 'KOSPET', logo: 'https://placehold.co/100x40.png', permalink: 'kospet' },
  { _id: 'haylou', name: 'Haylou', logo: 'https://placehold.co/100x40.png', permalink: 'haylou' },
  { _id: 'soundpeats', name: 'Soundpeats', logo: 'https://placehold.co/100x40.png', permalink: 'soundpeats' },
  { _id: 'qcy', name: 'QCY', logo: 'https://placehold.co/100x40.png', permalink: 'qcy' },
  { _id: 'xiaomi', name: 'Xiaomi', logo: 'https://placehold.co/100x40.png', permalink: 'xiaomi' },
];

const attributes = [
  { _id: 'attr-color', name: 'Color', values: ['Black', 'White', 'Silver', 'Blue', 'Red'] },
  { _id: 'attr-size', name: 'Size', values: ['S', 'M', 'L', 'XL'] },
  { _id: 'attr-storage', name: 'Storage', values: ['64GB', '128GB', '256GB', '512GB'] },
];

const suppliers = [
  { _id: 'kospet-direct', name: 'KOSPET Direct', contactPerson: 'John Kospet', email: 'sales@kospet.com', permalink: 'kospet-direct' },
  { _id: 'haylou-official', name: 'Haylou Official', contactPerson: 'Jane Haylou', email: 'distro@haylou.com', permalink: 'haylou-official' },
  { _id: 'soundpeats-global', name: 'Soundpeats Global', contactPerson: 'Peter Sound', email: 'global@soundpeats.com', permalink: 'soundpeats-global' },
  { _id: 'qcy-direct', name: 'QCY Direct', contactPerson: 'Mary QCY', email: 'contact@qcy.com', permalink: 'qcy-direct' },
  { _id: 'tech-wholesalers-inc', name: 'Tech Wholesalers Inc.', contactPerson: 'Sam Smith', email: 'sam@techwholesalers.com', permalink: 'tech-wholesalers-inc' },
];

const defaultHomepageDoc = {
  _id: 'main',
  heroBanners: [
    { id: 1, image: 'https://placehold.co/900x440.png', headline: 'GADGET FEST', subheadline: 'Up to 60% off on your favorite gadgets.', buttonText: 'Shop Now', link: '/products' },
    { id: 2, image: 'https://placehold.co/900x440.png' },
    { id: 3, image: 'https://placehold.co/900x440.png' },
  ],
  sections: [
    { id: 'feat-cat', name: 'Featured Categories', type: 'featured-categories', content: [
      { id: 'fc1', name: 'Smart Watches', image: 'https://placehold.co/128x128.png' },
      { id: 'fc2', name: 'Headphones', image: 'https://placehold.co/128x128.png' },
      { id: 'fc3', name: 'Android Smart TVs', image: 'https://placehold.co/128x128.png' },
      { id: 'fc4', name: 'Charger & Cables', image: 'https://placehold.co/128x128.png' },
      { id: 'fc5', name: 'Powerbanks', image: 'https://placehold.co/128x128.png' },
    ]},
    { id: 'new-arr', name: 'New Arrivals', type: 'product-grid', content: { category: 'newest' } },
    { id: 'promo-ban', name: 'Promotional Banners', type: 'promo-banner-pair', content: [
      { id: 'promo1', image: 'https://placehold.co/800x400.png', link: '#' },
      { id: 'promo2', image: 'https://placehold.co/800x400.png', link: '#' },
    ]},
    { id: 'pop-prod', name: 'Popular Products', type: 'product-grid', content: { category: 'Audio' } },
    { id: 'smart-watch-banner', name: 'Smart Watches', type: 'single-banner-large', content: { image: 'https://placehold.co/1200x150.png', link: '/products?category=Wearables' } },
    { id: 'headphones-banner', name: 'Headphones', type: 'single-banner-large', content: { image: 'https://placehold.co/1200x150.png', link: '/products?category=Audio' } },
  ],
};

const defaultFooterSettings = {
  _id: 'homepage',
  footer: {
    logo: 'https://placehold.co/50x50/FFFFFF/1e2128.png',
    description: 'Motion View is the largest Eco Product importer and Distributor in Bangladesh.',
    socialLinks: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#', youtube: '#' },
    appStore: { link: '#', image: 'https://placehold.co/135x40.png' },
    googlePlay: { link: '#', image: 'https://placehold.co/135x40.png' },
    companyLinks: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '#', label: 'Terms and conditions' },
      { href: '#', label: 'Return and Refund Policy' },
      { href: '#', label: 'EMI' },
      { href: '#', label: 'Warranty' },
      { href: '#', label: 'Delivery Policy' },
      { href: '#', label: 'Support Center' },
      { href: '/contact', label: 'Contact Us' },
    ],
    contact: { address: '10/25 (9th Commercial Floor), Eastern Plaza, 70 Bir Uttam C.R Datta Road, Hatirpool, Dhaka-1205', phone: '09677460460', email: 'motionview22@gmail.com.bd' },
    memberships: [
      { id: 'basis', name: 'BASIS Member', image: 'https://placehold.co/100x40.png', link: '#' },
      { id: 'ecab', name: 'e-Cab Member', image: 'https://placehold.co/100x40.png', link: '#' },
    ],
    paymentMethodsImage: 'https://placehold.co/1180x139.png',
    copyrightText: `Motion View. All Rights Reserved by Motion View`,
    securityBadges: [
      { id: 'ssl', name: 'SSL Commerz', image: 'https://placehold.co/121x24.png' },
      { id: 'dmca', name: 'DMCA Protected', image: 'https://placehold.co/121x24.png' },
    ],
  },
};

const setupCollection = [
  { _id: 'shipping', name: 'shipping', data: {} },
  { _id: 'payment', name: 'payment', data: {} },
  { _id: 'currency', name: 'currency', data: { currency: 'BDT' } },
];

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  let total = 0;

  const collections: { name: string; data: any[] }[] = [
    { name: 'users', data: staffUsers },
    { name: 'customers', data: customerUsers },
    { name: 'products', data: products },
    { name: 'categories', data: categories },
    { name: 'brands', data: brands },
    { name: 'attributes', data: attributes },
    { name: 'suppliers', data: suppliers },
  ];

  for (const { name, data } of collections) {
    const existing = await db.collection(name).countDocuments();
    if (existing === 0 && data.length > 0) {
      await db.collection(name).insertMany(data);
      total += data.length;
      console.log(`  ${name}: ${data.length} docs`);
    } else {
      console.log(`  ${name}: skipped (${existing} existing)`);
    }
  }

  // Seed public_content/homepage (homepage settings)
  const hpExisting = await db.collection('public_content/homepage').countDocuments();
  if (hpExisting === 0) {
    await db.collection('public_content/homepage').insertOne(defaultHomepageDoc);
    total += 1;
    console.log(`  public_content/homepage: seeded`);
  } else {
    console.log(`  public_content/homepage: skipped (${hpExisting} existing)`);
  }

  // Seed public_content (footer settings)
  const pcExisting = await db.collection('public_content').countDocuments();
  if (pcExisting === 0) {
    await db.collection('public_content').insertOne(defaultFooterSettings);
    total += 1;
    console.log(`  public_content: seeded`);
  } else {
    console.log(`  public_content: skipped (${pcExisting} existing)`);
  }

  await client.close();
  console.log(`\nTotal: ${total} documents inserted.`);
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
