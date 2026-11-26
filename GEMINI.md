# eMotionView — Gemini Project Context

eMotionView is a Next.js 15 App Router + TypeScript eCommerce application with an admin panel, multi-gateway checkout (bKash, SSLCommerz, COD), Cloudflare R2 storage, Firebase Auth, MongoDB persistence via `@/lib/db`, and Google AI / Genkit recommendations.

See [Claude.md](./Claude.md) for full architecture, collection schemas, component inventory, and coding patterns, and [AGENTS.md](./AGENTS.md) for quick agent rules.

## Quick Verification Checklist

1. Run `npm run typecheck` after TypeScript edits (`next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `next build` alone does not catch type errors).
2. Run `npm run build` to verify SSR routes, client bundles, and PWA generation (`public/sw.js`).
3. Keep server-only modules (`src/lib/mongodb.ts`, `src/lib/firebase-admin.ts`, `src/lib/r2-server.ts`) out of `"use client"` components.
4. Never read, print, or commit `.env` credential values.
