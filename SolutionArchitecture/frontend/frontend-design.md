# Frontend Design

## Frontend: pnpm monorepo with Next.js and Ant Design

The target is one workspace with one Next.js web app and small shared packages. It is **not** the current frontend repository layout. pnpm owns installation and the lockfile. Next.js App Router owns routes, server rendering and server actions as appropriate. Ant Design owns common form, table, navigation, feedback and overlay components. Use its theme tokens for modest visual customization. No Japanese Zen Ma direction, Radix UI, Tailwind CSS, Zustand, TanStack Query or Framer Motion logic. React/Next.js built-in state, URL state and server fetches cover the first implementation.

```text
frontend/
  package.json                 # private workspace scripts
  pnpm-workspace.yaml          # apps/* and packages/*
  pnpm-lock.yaml
  apps/
    web/
      package.json
      next.config.ts
      src/
        app/
          (store)/page.tsx
          (store)/products/[id]/page.tsx
          (store)/cart/page.tsx
          (store)/checkout/page.tsx
          (account)/account/orders/page.tsx
          (seller)/seller/products/page.tsx
          (seller)/seller/orders/page.tsx
          (admin)/admin/sellers/page.tsx
          (admin)/admin/orders/page.tsx
          (auth)/login/page.tsx
          api/                  # only same-origin endpoints if needed
        features/
          identity/
          catalog/
          cart/
          checkout/
          review/
          seller/
          admin/
        components/             # app layout and Ant Design wrappers
        lib/api/                # server-side typed API client
        lib/auth/               # session and role checks
        lib/config/             # validated profile config
        styles/                 # minimal global styles and Ant theme
      tests/
  packages/
    api-contract/               # generated OpenAPI types/client
    shared/                     # pure formatting/types, no app imports
    test-config/                # shared test setup, if needed
  scripts/
    with-profile.mjs
```

Keep route code thin. Feature folders own domain forms and views; `packages/shared` contains only reusable, framework-agnostic code. The API contract package is generated from this specification's future OpenAPI, never the old 155-operation contract. Server components fetch data directly through the typed server client; client components manage local form interaction. Mutations use server actions or same-origin handlers with validation, role checks and explicit refresh. Do not add a global client store or client query cache by default. Use a single Ant Design provider/theme setup, keyboard-visible focus and responsive layouts. See [homepage design](./homepage-design.md). LINK images use approved remote URLs through plain browser image requests with a local fallback; avoid Next.js image optimization storage for LINK. UPLOAD images use a same-origin API route backed by PostgreSQL bytes. The dev product seed, when later created, uses LINK and is absent from production.

Suggested scripts: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`; each delegates to `apps/web` and applicable packages. Pin the pnpm major through `packageManager`; commit the lockfile. CI uses a frozen lockfile.
