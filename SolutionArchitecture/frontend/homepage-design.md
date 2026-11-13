# Homepage Design Specification

## Purpose and style

The homepage helps Guests and Members discover products quickly and reach product detail or cart. Build it in the Next.js App Router with standard Ant Design components and restrained theme tokens. Use a clear, ordinary marketplace layout; no Japanese Zen Ma motif, custom animation system, Tailwind or Radix layer. The page works before login, but purchase requires Member authentication.

## Desktop page order

| Section | Content | Suggested Ant Design building blocks |
| --- | --- | --- |
| Header | Logo/home link, search field, category entry, cart count, login/account menu | `Layout.Header`, `Input.Search`, `Menu`, `Badge`, `Button`, `Dropdown` |
| Intro/featured area | Short heading, one featured category or product collection, direct “Browse products” action | `Typography`, `Card`, `Button` |
| Categories | Bounded list of active categories with clear text labels | `Card` or `List` in responsive grid |
| Product grid | Published items from active Sellers: image, name, Seller, USD price, average rating/count, product link | `Card`, `Rate` (read-only), `Typography`, responsive `Row/Col` or CSS grid |
| Footer | Essential account, catalog and policy links | `Layout.Footer`, simple links |

Do not show a shipping promise, shipping fee, return policy, non-COD payment choice or personalized recommendation rail. Price format is `$12.34` with USD semantics; no currency selector. Rating is shown as stars plus numeric average and review count; show “No reviews yet” when count is zero. Keep reviews and rating visible on the product detail page as well, with a Member review form only after a Paid purchase.

## Navigation and interaction

Search submits a keyword to `/products?q=...`; category cards link to `/products?categoryId=...`; product cards link to details. Add-to-cart is available to Guest/Member and reports the server result. Checkout from cart sends Guest to login, then returns to checkout with the valid merged cart; rejected Guest lines are shown. Seller/Admin navigation appears only after login and is separate from public discovery. The server still checks role and ownership.

The homepage is server-rendered where possible from `GET /categories` and `GET /products` with a bounded `limit`. There is no `GET /home` in the [target API](../api-contract/http-api.md). Featured placement is a page composition choice using returned categories/products; no ranking or recommendation endpoint is implied. Use URL query parameters for search/filter state, TanStack Query for interactive catalog/cart reads and local React state for input/feedback. The [caching design](./caching.md) owns query policy. Use Ant Design theme tokens and simple responsive CSS; avoid a separate visual design system.

## Images and states

Both image modes appear identically in cards: LINK requests approved remote source live; UPLOAD uses the same-origin PostgreSQL-backed content route. Reserve a fixed aspect-ratio box to avoid layout shift. Show descriptive alt text. On failed/slow image load, render a local placeholder while title, USD price, rating and link remain usable. Do not fetch all product images through the JSON homepage endpoint; it returns image references/IDs only.

| State | Required behavior |
| --- | --- |
| Loading | Stable card placeholders/skeletons without layout jump |
| No featured products | Plain empty state and link to full catalog |
| Category or product API unavailable | Error message with retry for the affected section; header and navigation remain usable |
| LINK source unavailable | Local placeholder; no blocked product action |
| UPLOAD content unavailable | Local placeholder; log/monitor backend issue |
| Small screens | Header condenses; search stays reachable; grid reduces columns without horizontal scroll |

## Accessibility and acceptance

Use semantic headings, one page `h1`, labeled search, keyboard-accessible cards/actions, visible focus and sufficient contrast. Read-only stars have a text rating label. Product image alt text describes the product rather than repeating “image.” Confirm at desktop and mobile widths with browser tests.

Acceptance checks: Guest can search and cart but is redirected to login before COD checkout; all prices display USD; both image modes and fallback work; rating count/average matches visible reviews; no shipping/return/payment alternatives appear; Seller/Admin tools are absent from Guest navigation; homepage remains usable when remote LINK images fail. Backend query performance is tracked in the [product backlog](../../ProductManager/product-backlog.md); this does not claim a measured homepage benchmark.
