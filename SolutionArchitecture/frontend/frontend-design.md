# Frontend Design

## Scope and boundaries

The target is a pnpm workspace with one Next.js App Router web app and small shared packages. This is a target structure, not a claim about the current frontend repository. Next.js owns routes, server rendering, session cookies and browser interactions. Spring Boot owns authentication, authorization, business rules, transactions and the [38-operation OpenAPI contract](../api-contract/index.md). Browser mutations use same-origin Next.js actions or handlers; server code calls the Spring Boot API. Public LINK images are requested directly from approved external hosts.

Ant Design supplies forms, tables, navigation, feedback and overlays. Use one provider/theme setup, restrained tokens and responsive CSS. Do not add Japanese Zen Ma styling, Radix UI, Tailwind CSS, Zustand or Framer Motion logic. Server fetches, URL parameters, TanStack Query v5 and local React state cover the first implementation. The [homepage specification](./homepage-design.md) owns its layout.

The detailed frontend design is split into [Component Tree](./component-tree.md), [Navigation and Routing](./navigation-routing.md) and [Caching](./caching.md).

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
        app/                    # thin pages, layouts and same-origin handlers
        features/               # identity, catalog, cart, checkout, review, seller, admin
        components/             # app layout, providers and Ant Design wrappers
        lib/api/                # server-only typed client and Problem mapping
        lib/auth/               # session cookies and route guards
        lib/config/             # validated dev/prod profile
        lib/query/              # QueryClient factory and key conventions
        styles/                 # global styles and Ant theme
      tests/
  packages/
    api-contract/               # generated from target OpenAPI
    shared/                     # pure formatting/types, no app imports
    test-config/                # shared test setup, if needed
  scripts/
    with-profile.mjs
```

Feature folders own forms, views and local presentation state. Generate the API package from [`openapi.yaml`](../api-contract/openapi.yaml), not the old 155-operation contract; CI fails on generated client drift. Pin the pnpm major through `packageManager`, commit the lockfile and use a frozen lockfile in CI. Workspace scripts should expose `dev`, `build`, `lint`, `typecheck` and `test` and delegate to the app and relevant packages.

## Route and use-case coverage

These are target **web routes**, not new backend endpoints. Exact path names may change during implementation. Each screen uses only operations in the [API inventory](../api-contract/http-api.md).

| Web area | Role and use case | Required API behavior |
| --- | --- | --- |
| Home, `/products`, `/products/[id]` | Guest and authenticated roles; UC-01 | Categories, product list/detail and visible reviews. Search, category and USD price filters use URL parameters. |
| `/cart`, `/login`, `/register` | Guest/Member; UC-02/03 | Guest/Member cart edits, registration and login. Show rejected `cartMerge` lines and refresh the cart. |
| `/checkout`, account addresses and orders | Member; UC-04/05 | Owned address list/create, COD order creation, own order list/detail and unpaid cancellation. |
| Own review view and product review form | Member; UC-08 | Paid-purchase review create, own active review list/edit/delete. Product detail shows visible public reviews. |
| Seller catalog and orders | Seller; UC-06/07 | Own product, stock and image management; own seller portions and mark-paid action. |
| Admin policy, reviews, reports and audit | Admin; UC-09/10 | Seller/category policy with reasons, moderation, bounded UTC reports and cursor-based audit reads. |

Public browsing offers cart actions to Guest and Member. Checkout requires Member login. Seller/Admin navigation is separate from public purchase flows; these roles cannot use the cart. Hide unavailable actions in the UI, but rely on backend checks for authorization. Do not add shipping, delivery, return, refund, payment-gateway, notification, profile-edit or payment-correction screens. COD is the only payment choice and all money is USD with two decimal places. See [product scope](../../BusinessAnalyst/product-scope.md) and [business rules](../../BusinessAnalyst/business-rules.md).

## Server request and session boundary

- Keep the API base URL and JWT on the Next.js server. The typed client forwards a bearer token for Member, Seller or Admin private calls. Never put JWTs in browser JavaScript storage, rendered props or client logs. Login seals the access token and login-returned account identity in an authenticated, HttpOnly, SameSite session cookie; use Secure in production and expire the session no later than the JWT. Logout clears it. On expiry, clear the session and send the user to login. There is no refresh-token flow or `/me` read.
- A Guest cart uses the backend's opaque `guest_cart` cookie. The initial `GET /cart` goes through a same-origin handler that can relay the backend's `Set-Cookie`; later cart calls and login forward the incoming Guest cookie and relay its expiry after Member consumption. Preserve HttpOnly, SameSite and production Secure behavior. An invalid bearer is an authentication failure, never a silent Guest fallback. Seller/Admin login does not merge a Guest cart.
- Protect same-origin mutations against cross-site requests. Guest cookie mutations and login with a Guest cookie send a validated Origin accepted by the backend allowlist. Forward only needed cookies, headers and fields. Never trust a browser-supplied role, owner ID, price or total. The backend remains authoritative. See [security](../system/security.md) and [authorization matrix](../api-contract/authorization-matrix.md).
- Server-render reads through the typed client. Interactive Client views use TanStack Query through narrow same-origin handlers/actions. Private pages and mutation results use request-scoped server data; do not share a cache across users. Clear the browser Query cache when the actor changes. Invalidate affected queries after a successful mutation. Checkout and other mutable eligibility facts need a fresh API read. Public discovery caching must not present unpublished products or suspended Sellers as current.
- Parse `application/problem+json` using stable `code` and safe `fieldErrors`, not message text. Keep `correlationId` available for support without showing secrets. A backend 401 during a private request clears the session and leads to login. A 403 or scoped 404 must not disclose another user's resource.

## Client state and list reads

Use URL parameters for search text, category, USD bounds and cursor so browser navigation restores the list view. Start from the first cursor when filters change. Lists follow `items`, `nextCursor`, `hasNext`; request at most 100 rows, default 20. Treat cursors as opaque and never reuse one across a different filter, actor or resource. A 400 `INVALID_CURSOR` resets to the first page with an explanation. Pagination is not a stable cross-request snapshot.

Local React state holds unsaved form input, a pending action and transient feedback. TanStack Query holds only per-tab server-response data for interactive views; it is not a source of business truth. Server responses own cart totals, stock availability, review eligibility, order status and report values. Do not compute an authoritative checkout total in the browser. Format API decimal strings as USD without binary floating-point arithmetic for totals.

For JSON edits, send the current response `version` as `expectedVersion`. DELETE sends `expectedVersion` in the query string. On `STALE_VERSION`, reload the owned record and let the user review changes before resubmitting. Product version covers product, variant-price and image edits; stock has a separate version. Image creation returns `productVersion`; after image deletion, reload the product. Cancellation and mark-paid have state rules but no detached edit versions. See [HTTP behavior](../api-contract/http-api.md).

## Critical interaction states

| Flow | Frontend behavior |
| --- | --- |
| Guest cart and login | Initialize the Guest cart on first cart read. Preserve it through the login redirect. On Member login, show rejected `cartMerge` lines and fetch the merged cart. Merge does not reserve stock. |
| Checkout | Require an owned address, current `cartVersion` and `paymentMethod=COD`. Create one `Idempotency-Key` per checkout intent and keep the same key and exact body while the outcome is unresolved. Disable duplicate submission while pending. On 201, show the order and refresh cart/order reads. |
| Checkout failure | For changed cart, stock, item or voucher conflicts, reload cart and review the new intent before using a new key. For 503 or a lost response, retry with the **same** key and body. `IDEMPOTENCY_CONFLICT` means the same key carried a different body and needs explicit review. |
| Cancellation | Show the action only while all seller portions are pending. After 200, re-read the order. On `ILLEGAL_ORDER_STATE`, re-read; do not offer a refund path. Repeated cancellation may return the already-cancelled order. |
| Seller COD payment | Label the action as recording cash already received outside the app. On success, re-read the owned portion. On 409 or uncertain failure, re-read before retry; repeated Paid returns 409. A suspended Seller may still record cash for an existing valid portion. |
| Reviews | Offer create when a Member has a Paid seller portion for the product, then let the API decide eligibility. Other portions may still be pending. Public average/count include only visible reviews; own review pages can show hidden active reviews. Editing preserves hidden status. |
| Admin changes | Collect a non-blank reason for seller status, category policy and review moderation. Send the current version for edits. Reload after success; report date filters use the API's bounded UTC interval. |

Show 400 field errors by the relevant control. A 401 leads to login; 403 explains the action is unavailable; 404 shows a neutral missing-resource state. For 409, use the flow-specific recovery above. For 413/415 image errors, show upload constraints. For 500/503, keep form input and offer a retry only where safe. Never present a failed command as completed. The [error contract](../api-contract/exceptional-errors.md) owns exact codes and statuses.

## Product images

Render image branches from the API discriminator. LINK uses the approved HTTPS URL directly in a browser image request. UPLOAD uses the returned same-origin `contentPath` to fetch PostgreSQL-backed bytes. If the API sits on another host, deployment routing or a narrow same-origin handler serves that path; it does not proxy LINK. Do not cache UPLOAD bytes against the API's `Cache-Control: no-store`. Keep title, USD price, rating and actions usable when either image fails; show a local placeholder. Image display failure does not change purchase eligibility.

Seller image forms distinguish LINK URL/provenance fields from UPLOAD multipart input. Show the 10-image limit and JPEG/PNG/WebP, 5 MiB upload limit. The backend validates approved hosts, provenance, file signature, dimensions and pixel count; frontend checks are early feedback only. Send product `expectedVersion` on add/remove, refresh after a conflict, and reload after deletion. The [image contract](../api-contract/product-images.md) owns exact rules.

If a development product seed is added later, it uses LINK and is absent from production, as required by [product scope](../../BusinessAnalyst/product-scope.md).

## Runtime profiles and verification

Validate `APP_PROFILE=dev|prod` on the server and coordinate it with the backend profile. The dev login panel invokes only the dev-only same-origin action and contains no sample passwords in client code. A production build omits the panel and action and rejects the path server-side; hiding it with CSS is insufficient. Do not ship sample account strings or seed data in the production bundle. See [runtime profiles](../system/runtime-profiles.md).

Before implementation is accepted, verify:

- Guest cart creation, cookie relay, login merge once, rejected lines and login-before-checkout redirect.
- Member, Seller and Admin route guards plus backend 401/403/404 handling, including cross-owner IDs and token expiry.
- Checkout same-key replay after a lost response, changed cart/version recovery and a payment/cancellation race.
- Seller product, stock and image stale-version recovery; LINK and UPLOAD fallback; 413/415 feedback.
- Review visibility and eligibility, Admin reason/versions, bounded report dates and cursor resets.
- Keyboard navigation, visible focus, labeled controls, responsive layouts and no horizontal overflow on small screens.
- Production build without dev quick-login UI/action or sample account strings; generated client and OpenAPI stay in sync.

These are acceptance checks for a future implementation, not evidence that the frontend already passes them. The [BA use cases](../../BusinessAnalyst/use-cases.md) and [user stories](../../BusinessAnalyst/user-stories.md) define observable outcomes; [backend sequences](../backend/sequences/README.md) define server-side command and failure behavior.
