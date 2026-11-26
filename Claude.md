# eMotionView — Project Context & AI Assistant Guide

**Version:** 1.0.0  
**Last Updated:** 2026-11-26

> **Maintenance Note:** Update this file whenever major dependencies, database collections, API routes, environment variables, or architectural conventions change. Keep version and "Last Updated" current.

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Coding Conventions](#4-coding-conventions)
5. [Application Architecture](#5-application-architecture)
6. [Key Features](#6-key-features)
7. [Development Guidelines & Commands](#7-development-guidelines--commands)
8. [Database, Firebase & Storage Configuration](#8-database-firebase--storage-configuration)
9. [Component Library & UI Patterns](#9-component-library--ui-patterns)
10. [AI Integration (Google AI & Genkit)](#10-ai-integration-google-ai--genkit)
11. [Common Patterns & Examples](#11-common-patterns--examples)

---

## 1. Project Description

**eMotionView** is a full-stack, AI-powered eCommerce platform built with **Next.js (App Router)** and **TypeScript**. It provides a storefront for customers (product discovery, cart, wishlist, multi-gateway checkout, order tracking, reviews, and AI-powered product recommendations) alongside an administrative dashboard for catalog management, order fulfillment, customer/staff administration, analytics, loyalty points, and dynamic CMS configuration.

---

## 2. Technology Stack

| Category | Technology / Package | Version (`package.json`) | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (`next`) | `15.3.6` | App Router, SSR, Server Actions, API Routes |
| **UI Library** | React (`react`, `react-dom`) | `^19.0.2` | Component rendering |
| **Language** | TypeScript (`typescript`) | `^5.7.2` | Strict static typing |
| **Styling** | Tailwind CSS (`tailwindcss`) | `^3.4.17` | Utility-first styling (`tailwind.config.ts`) |
| **UI Primitives** | ShadCN UI + Radix UI + `lucide-react` | `@radix-ui/*`, `^0.468.0` | Accessible UI components & icons |
| **Database Layer** | MongoDB (`mongodb`) via `@/lib/db` | `^7.2.0` | Primary data persistence with Firestore-compatible API |
| **Auth & Legacy Rules** | Firebase (`firebase`, `firebase-admin`) | `^11.9.1`, `^13.0.2` | Firebase Authentication & Admin session cookies |
| **Object Storage** | Cloudflare R2 (`@aws-sdk/client-s3`) | `^3.1053.0` | Media/product image uploads and proxying |
| **AI Integration** | Genkit + Google AI (`genkit`, `@genkit-ai/googleai`, `@genkit-ai/next`) | `^1.25.0` | AI recommendation flows (`googleai/gemini-2.0-flash`) |
| **Forms & Validation** | `react-hook-form`, `zod`, `@hookform/resolvers` | `^7.54.2`, `^3.25.76`, `^3.9.1` | Schema-validated forms |
| **Payments** | `bkash-payment-gateway`, `sslcommerz-lts` | `^2.0.1`, `^1.2.0` | Bangladesh payment gateways + COD |
| **Rich Text & Data** | `@tiptap/react`, `papaparse`, `recharts`, `jspdf`, `html2canvas` | `^2.10.5`, `^5.4.1`, `^2.15.1` | CMS editor, CSV import/export, charts, PDF invoices |
| **PWA** | `@ducanh2912/next-pwa` | `^10.2.9` | Service worker & offline manifest (`next.config.ts`) |

---

## 3. Project Structure

```text
eMotionView/
├── docs/                        # Project design documentation (blueprint.md)
├── public/                      # Static assets, PWA icons, manifest.json, sample-products.csv
├── scripts/                     # Standalone setup scripts (seed-mongodb.ts, set-r2-cors.ts)
├── src/
│   ├── ai/                      # Genkit initialization and AI flows
│   │   ├── dev.ts               # Genkit dev server entrypoint
│   │   ├── genkit.ts            # Genkit + Google AI plugin config
│   │   └── flows/               # Server-side AI flows (product-recommendations.ts)
│   ├── app/                     # Next.js App Router pages, layouts, and API routes
│   │   ├── (auth)/              # Sign-in and sign-up routes
│   │   ├── account/             # Customer account dashboard, profile, order history
│   │   ├── admin/               # Admin panel (analytics, products, orders, CMS, settings)
│   │   ├── api/                 # Route handlers (data, auth, bkash, sslcommerz, r2, admin)
│   │   ├── brand/[slug]/        # Brand catalog pages
│   │   ├── category/[slug]/     # Category catalog pages
│   │   ├── checkout/            # Checkout flow & payment callbacks
│   │   ├── products/            # Product catalog & detail pages ([id])
│   │   ├── recommendations/     # AI product recommendation page
│   │   ├── supplier/[slug]/     # Supplier pages
│   │   ├── track-order/         # Guest/customer order tracking
│   │   ├── wishlist/            # Saved wishlist page
│   │   ├── [...slug]/           # Dynamic CMS pages
│   │   ├── globals.css          # Tailwind CSS variables & theme tokens
│   │   ├── layout.tsx           # Root layout, fonts, tracking scripts, header/footer
│   │   └── page.tsx             # Dynamic storefront homepage
│   ├── components/              # React components
│   │   ├── admin/               # Admin-specific components (product-form, rich-text-editor, seed-button)
│   │   ├── layout/              # Header, footer, sidebars, mobile navbar
│   │   ├── tracking/            # GTM, GA4, Facebook Pixel, DataLayer components
│   │   └── ui/                  # ShadCN UI primitives
│   ├── hooks/                   # Client React hooks (use-auth, use-cart, use-wishlist, use-currency, etc.)
│   └── lib/                     # Core libraries, DB abstraction, actions, types, utilities
│       ├── actions/             # Next.js Server Actions (analytics.ts, seed.ts)
│       ├── db.ts                # Firestore-style abstraction backed by MongoDB / /api/data
│       ├── mongodb.ts           # Server-only MongoDB connection & CRUD helpers
│       ├── firebase.ts          # Client Firebase app & Auth initialization
│       ├── firebase-admin.ts    # Server Firebase Admin SDK initialization
│       ├── r2.ts                # Client R2 upload/url/delete fetch wrappers
│       ├── r2-server.ts         # Server S3Client R2 operations & proxy URL helpers
│       ├── placeholder-data.ts  # Shared domain TypeScript types & seed defaults
│       ├── product-utils.ts     # Product enrichment helpers (e.g. review aggregation)
│       ├── currency.ts          # Currency formatting helpers
│       └── utils.ts             # `cn()` class merge utility
├── apphosting.yaml              # Firebase App Hosting configuration
├── check-env.js / fix-env.js    # `.env` validation/formatting helpers for Firebase service key
├── components.json              # ShadCN UI configuration
├── firebase.json                # Firebase configuration
├── firestore.rules              # Reference Firestore security rules
├── storage.rules                # Reference Firebase Storage security rules
├── next.config.ts               # Next.js + PWA + image domain configuration
├── tailwind.config.ts           # Tailwind theme, fonts, and plugins
└── tsconfig.json                # TypeScript strict configuration (`@/*` -> `./src/*`)
```

---

## 4. Coding Conventions

- **TypeScript (`tsconfig.json`)**: `strict: true` is enforced. Use explicit types from `@/lib/placeholder-data` (e.g., `Product`, `Review`, `Order`, `User`, `Category`, `Brand`, `Supplier`) and `@/lib/db` (`DocumentSnapshot`, `QuerySnapshot`, `DocRef`, `CollectionRef`). Run `npm run typecheck` before finalizing changes.
- **Path Aliases**: Always import internal modules using `@/*` (mapped to `./src/*`).
- **Naming Conventions**:
  - Route & component files: `kebab-case.tsx` (e.g., `product-card.tsx`, `homepage-layout/page.tsx`).
  - React components & types: `PascalCase` (e.g., `ProductForm`, `DocumentSnapshot`).
  - Functions, variables, Server Actions: `camelCase` (e.g., `getProductRecommendations`, `seedDatabase`).
  - Hooks: `use-*.ts` / `use-*.tsx` inside `src/hooks/` (e.g., `use-cart.ts`, `use-auth.ts`).
- **Import Organization**:
  1. Framework directives (`"use client";` or `'use server';`) at line 1.
  2. External packages (`react`, `next/*`, `lucide-react`, `zod`, etc.).
  3. Internal `@/lib/*`, `@/hooks/*`, `@/ai/*`, and `@/components/*` imports.
  4. Type-only imports using `import type { ... }`.
- **Component Structure**:
  - Default to **Server Components** for pages in `src/app/` that fetch initial catalog/CMS data.
  - Extract interactive UI, forms, browser storage, and Firebase Auth listeners into `"use client"` components or hooks.
  - Keep `src/lib/mongodb.ts`, `src/lib/firebase-admin.ts`, and `src/lib/r2-server.ts` strictly server-side.

---

## 5. Application Architecture

### Next.js App Router & Rendering
- Customer pages (`src/app/page.tsx`, `src/app/products/[id]/page.tsx`, etc.) use Server Components (`export const dynamic = 'force-dynamic'` where live DB reads are needed) and pass serialized JSON (via `docToJSON`) down to Client Components.
- Admin pages (`src/app/admin/**`) and Account pages (`src/app/account/**`) are primarily client-rendered views gated by `useAuth()` and session cookies.

### Database Abstraction (`@/lib/db` & `@/lib/mongodb`)
- `@/lib/db` provides a **Firestore-compatible API** (`collection`, `doc`, `query`, `where`, `orderBy`, `limit`, `getDoc`, `getDocs`, `setDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `writeBatch`, `docToJSON`, `increment`, `arrayUnion`, `arrayRemove`, `getDocByField`).
- **On the server (`typeof window === 'undefined'`)**: dynamically imports `@/lib/mongodb` and executes queries directly against MongoDB.
- **On the client**: delegates CRUD operations to `/api/data/[collection]` and `/api/data/[collection]/[id]`, and implements `onSnapshot` via 3-second polling.
- `docToJSON` normalizes `_id` to `id`, converts `toDate()` values to ISO strings, and rewrites direct `*.r2.cloudflarestorage.com` URLs to `/api/r2/proxy?key=...`.

### Authentication Flow
1. Client signs in with Firebase Authentication (`@/lib/firebase`).
2. Client posts the Firebase ID token to `POST /api/auth/sign-in`, which uses Firebase Admin (`@/lib/firebase-admin`) to mint an HTTP-only `session` cookie (5-day expiration).
3. `src/app/middleware.ts` checks for the presence of the `session` cookie on protected routes (`/admin/*`, `/account/*`) and redirects unauthenticated requests to `/sign-in`.
4. `useAuth()` (`src/hooks/use-auth.ts`) listens to `onIdTokenChanged` and fetches the user's role (`Admin`, `Manager`, `Staff`, `Customer`) from `/api/data/users` or `/api/data/customers`.

### State Management
- **Shopping Cart (`useCart`)**: Persisted in `localStorage` under `'cart'` and synchronized across tabs via `window` `'storage'` events.
- **Wishlist (`useWishlist`)**: Persisted per user in the `wishlists` collection via `/api/data/wishlists` and synchronized with Firebase Auth state.
- **Currency & Shipping**: Managed via dedicated hooks (`use-currency.ts`, `use-shipping.ts`) backed by `settings` documents.

### API Route Structure (`src/app/api/`)
- `/api/data/[collection]` & `/api/data/[collection]/[id]`: Generic REST CRUD endpoints backed by MongoDB.
- `/api/auth/sign-in`, `/api/auth/sign-out`: Session cookie creation & clearing.
- `/api/bkash/*` (`grant-token`, `create-payment`, `execute-payment`, `query-payment`): bKash payment lifecycle.
- `/api/sslcommerz/*` (`init-payment`, `validate`): SSLCommerz payment initialization & validation.
- `/api/r2/*` (`upload`, `url`, `delete`, `proxy`): Cloudflare R2 media uploads, signed/public URLs, and image proxying.
- `/api/admin/*` (`load-env`, `save-env`, `test-db`, `test-storage`): Admin diagnostics & configuration endpoints.

---

## 6. Key Features

- **Customer Storefront**: Dynamic CMS homepage, product catalog with filtering/sorting, category/brand/supplier pages, search, wishlist, persistent cart, multi-step checkout (COD, bKash, SSLCommerz), guest/user order tracking, profile & order history, and PDF/print order views.
- **Admin Panel (`/admin`)**:
  - Sales & daily visitor analytics dashboard (`analytics` collection + `trackDailyVisitor` action) with Recharts visualizations and one-click database seeding (`SeedButton` -> `seedDatabase`).
  - Full product CRUD (Physical & Digital products), rich text descriptions (TipTap), categories, brands, attributes, suppliers, inventory, and CSV import/export (`papaparse`).
  - Order & payment management, customer management, staff RBAC (`Admin`, `Manager`, `Staff`), and live chat.
  - CMS controls: drag-and-drop homepage layout (`@dnd-kit/*`), hero banners, promo banners, static pages (`[...slug]`), footer, tracking pixels (GTM/GA4/FB Pixel), shipping, payment, storage, and database settings.
- **AI Product Recommendations (`/recommendations`)**: Genkit flow (`getProductRecommendations`) analyzing user needs against the product catalog and returning selected products with reasoning.
- **Club Points Loyalty System**: Configurable points earned per product and tracked per user/customer (`points` field).
- **Reviews & Ratings**: Customer-submitted product reviews (`pending` / `approved` / `rejected`) with admin moderation and replies.

---

## 7. Development Guidelines & Commands

### Local Setup
1. Install dependencies: `npm install` (runs `patch-package` on `postinstall`).
2. Configure `.env` in the project root (see Environment Variables below).
3. Validate Firebase service account formatting if needed: `node check-env.js` (or `node fix-env.js` if double-quoted/escaped).
4. Start development server: `npm run dev` (Next.js) and optionally `npm run genkit:dev` (Genkit UI).

### Common Commands
| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production bundle and PWA service worker (`public/sw.js`) |
| `npm run start` | Run built Next.js production server |
| `npm run typecheck` | Run TypeScript compiler check (`tsc --noEmit`) |
| `npm run lint` | Run `next lint` (note: requires ESLint config setup first if none is present) |
| `npm run genkit:dev` | Start Genkit developer UI with `tsx src/ai/dev.ts` |
| `npm run genkit:watch` | Start Genkit developer UI in watch mode |

### Testing & Verification
- There is currently no unit/E2E test runner configured in `package.json`. Verify changes with `npm run typecheck` and `npm run build`.
- Note: `next.config.ts` currently sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`, so always run `npm run typecheck` explicitly to catch type issues.

### Environment Variables (`.env`)
Never commit `.env` or hardcode secrets. Required keys:
- **Firebase Client**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- **Firebase Admin**: `FIREBASE_SERVICE_ACCOUNT_KEY` (single-line JSON string)
- **MongoDB**: `MONGODB_URI`, `MONGODB_DB`
- **Cloudflare R2**: `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` (optional)
- **Google AI / Genkit**: `GEMINI_API_KEY` or `GOOGLE_GENAI_API_KEY` (required when invoking AI flows)

### Deployment
- Designed for **Firebase App Hosting** (`apphosting.yaml`) or **Vercel** (R2 proxy `/api/r2/proxy` ensures compatibility with Next.js Image Optimizer). Run `npm run build` to verify production compilation.

---

## 8. Database, Firebase & Storage Configuration

### Collections (`MongoDB` / `@/lib/db`)
- `products`: Product catalog items (`_id`, `name`, `permalink`, `price`, `categories`, `brand`, `sku`, `stock`, `productType`, `images`, `features`, `specifications`, `createdAt`, etc.)
- `categories`, `brands`, `attributes`, `suppliers`: Taxonomy and catalog metadata
- `users`: Internal staff accounts (`Admin`, `Manager`, `Staff`) keyed by Firebase `uid`
- `customers`: Customer profiles (`uid`, `name`, `email`, `role: 'Customer'`, `points`, `status`)
- `orders`: Customer orders (`orderNumber`, `userId`, `status`, `total`, `currency`, `paymentMethod`, `shippingMethod`, `items`)
- `reviews`: Product reviews (`productId`, `userId`, `rating`, `status`, `reply`)
- `wishlists`: Per-user saved product IDs (`_id: uid`, `productIds`)
- `public_content`: Storefront CMS documents (e.g., `_id: 'homepage'`, `_id: 'main'`)
- `settings`: App configuration documents (`general`, `tracking`, `database`, `storage`, `homepage`, `shipping`, `payment`, `currency`)
- `pages`: Dynamic static CMS pages (`[...slug]`)
- `analytics`: Daily visitor counters (`daily_visits_YYYY-MM-DD`)

### Firebase & Storage
- **Firebase Client (`src/lib/firebase.ts`)**: Initializes `app` and `auth` via `NEXT_PUBLIC_FIREBASE_*` env vars.
- **Firebase Admin (`src/lib/firebase-admin.ts`)**: Parses `FIREBASE_SERVICE_ACCOUNT_KEY` and exports `auth` for server-side session cookies.
- **Security Rules**: `firestore.rules` and `storage.rules` exist as reference Firebase rules; active data routes under `/api/data/*` and `@/lib/db` operate against MongoDB, and media uploads go to Cloudflare R2 (`@/lib/r2-server`) with optional CORS configuration via `scripts/set-r2-cors.ts`.

---

## 9. Component Library & UI Patterns

### Available ShadCN UI Components (`src/components/ui/`)
`accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `list`, `menubar`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle`, `tooltip`.

### Custom Components (`src/components/`)
- **Storefront**: `product-card.tsx`, `product-details-client.tsx`, `products-page-client.tsx`, `category-page-client.tsx`, `category-menu.tsx`, `homepage-carousel.tsx`, `recommendation-form.tsx`, `reviews.tsx`, `breadcrumb.tsx`, `visitor-tracker.tsx`, `client-only.tsx`.
- **Layout**: `layout/header.tsx`, `layout/footer.tsx`, `layout/mobile-navbar.tsx`, `layout/admin-sidebar.tsx`, `layout/account-sidebar.tsx`.
- **Admin**: `admin/product-form.tsx`, `admin/rich-text-editor.tsx`, `admin/seed-button.tsx`.
- **Tracking**: `tracking/google-tag-manager.tsx`, `tracking/google-analytics.tsx`, `tracking/facebook-pixel.tsx`, `tracking/data-layer.tsx`.

### UI Patterns
- **Forms**: Built with `react-hook-form` + `zodResolver(schema)` + ShadCN `<Form>`, `<FormField>`, `<FormControl>`, `<FormMessage>`.
- **Data Tables**: Built with ShadCN `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>` combined with client-side filtering/sorting via `useMemo`.
- **Modals & Drawers**: Use `<Dialog>` for create/edit forms, `<AlertDialog>` for destructive confirmations (delete actions), and `<Sheet>` for mobile navigation/drawers.

---

## 10. AI Integration (Google AI & Genkit)

- **Configuration (`src/ai/genkit.ts`)**:
  - Initializes `genkit({ plugins: [googleAI()], model: 'googleai/gemini-2.0-flash' })`.
- **Product Recommendation Flow (`src/ai/flows/product-recommendations.ts`)**:
  - Server-only (`'use server'`) module exporting `getProductRecommendations(input)`.
  - Input schema (`GetProductRecommendationsInputSchema`): `{ userProfile: string, productCatalog: string }`.
  - Output schema (`GetProductRecommendationsOutputSchema`): `{ recommendedProducts: string[], reasoning: string }`.
  - Uses `ai.definePrompt` (`getProductRecommendationsPrompt`) and `ai.defineFlow` (`getProductRecommendationsFlow`) with Handlebars template inputs (`{{{userProfile}}}`, `{{{productCatalog}}}`).
  - Client invocation happens in `src/components/recommendation-form.tsx`, which serializes the catalog (`name: description`), invokes `getProductRecommendations`, and matches returned product names back to `Product` objects.

---

## 11. Common Patterns & Examples

### 1. Server Component with Data Fetching (`src/app/products/[id]/page.tsx`)
```tsx
import { collection, query, where, getDocs, limit, docToJSON } from '@/lib/db';
import { db } from '@/lib/db';
import type { Product } from '@/lib/placeholder-data';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const q = query(collection(db, 'products'), where('permalink', '==', params.id), limit(1));
  const snap = await getDocs(q);
  const product = snap.empty ? null : (docToJSON(snap.docs[0]) as Product);
  return <div>{product?.name}</div>;
}
```

### 2. Client Component with State Management (`src/hooks/use-cart.ts` consumer)
```tsx
"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/placeholder-data';

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return <Button onClick={() => addToCart(product, 1)}>Add to Cart</Button>;
}
```

### 3. API Route Handler (`src/app/api/data/[collection]/route.ts`)
```ts
import { NextRequest, NextResponse } from 'next/server';
import { findMany } from '@/lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const docs = await findMany(collection);
  return NextResponse.json(docs);
}
```

### 4. Database Query & Write (`src/lib/actions/analytics.ts`)
```ts
import { db, doc, getDoc, setDoc, increment } from '@/lib/db';

const docRef = doc(db, 'analytics', `daily_visits_${today}`);
const snap = await getDoc(docRef);
if (snap.exists()) {
  await setDoc(docRef, { count: increment(1), date: today }, { merge: true });
}
```

### 5. Form Validation & Submission (`src/components/recommendation-form.tsx`)
```tsx
const formSchema = z.object({
  userProfile: z.string().min(20, { message: 'Please describe your needs in at least 20 characters.' }),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { userProfile: '' },
});

async function onSubmit(values: z.infer<typeof formSchema>) {
  const result = await getProductRecommendations({ userProfile: values.userProfile, productCatalog });
}
```
