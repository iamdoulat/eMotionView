# eMotionView — Agent Instructions

This repository is **eMotionView**, a Next.js 15 (App Router) + TypeScript eCommerce platform using MongoDB (via a Firestore-compatible abstraction), Firebase Authentication, Cloudflare R2 media storage, Tailwind CSS + ShadCN UI, and Google AI / Genkit.

For complete documentation (architecture, collections, UI components, AI flows, and code examples), see [Claude.md](./Claude.md).

## Essential Commands

- `npm run dev` — Start Next.js dev server
- `npm run typecheck` — Run `tsc --noEmit` (must pass; `next.config.ts` has `ignoreBuildErrors: true`)
- `npm run build` — Run production Next.js + PWA build
- `npm run genkit:dev` — Start Genkit AI dev server (`src/ai/dev.ts`)
- `node check-env.js` — Verify `FIREBASE_SERVICE_ACCOUNT_KEY` formatting in `.env`

## Key Architectural Notes

- **Database Abstraction (`src/lib/db.ts` + `src/lib/mongodb.ts`)**: Import Firestore-style helpers (`collection`, `doc`, `query`, `where`, `getDoc`, `getDocs`, `setDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `docToJSON`) from `@/lib/db`. Server calls hit MongoDB directly; client calls route through `/api/data/[collection]`.
- **Auth (`src/lib/firebase.ts`, `src/lib/firebase-admin.ts`, `src/hooks/use-auth.ts`)**: Firebase Auth on client + HTTP-only `session` cookie via `/api/auth/sign-in`, checked in `src/app/middleware.ts` for `/admin` and `/account`.
- **Storage (`src/lib/r2.ts`, `src/lib/r2-server.ts`)**: Media uploads use Cloudflare R2 via `/api/r2/*` and are served through `/api/r2/proxy?key=...`.
- **AI Flows (`src/ai/`)**: Genkit configured in `src/ai/genkit.ts` (`googleai/gemini-2.0-flash`); product recommendations live in `src/ai/flows/product-recommendations.ts`.
- **Conventions**: Use `@/*` path imports, `strict` TypeScript, `react-hook-form` + `zod` for forms, and ShadCN UI components under `src/components/ui/`. Never expose or commit `.env` secrets.
