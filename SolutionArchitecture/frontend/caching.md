# Caching

TanStack Query v5 is the browser cache for interactive views. It calls narrow same-origin Next.js handlers/actions, which call Spring Boot through the server-only typed client. The Query cache is in memory per browser tab, with no persistence or cross-user sharing. The server creates a new `QueryClient` per request when it prefetches and hydrates a Client view. The [component tree](./component-tree.md) defines those boundaries.

## Cache ownership

| Data | Next.js server/HTTP | Browser Query policy |
| --- | --- | --- |
| Public categories, product lists/details, visible reviews | Fetch with `cache: 'no-store'` while publication, Seller status and moderation have no invalidation channel. Render the homepage from fresh API reads. | Interactive catalog/review queries use `staleTime: 0`; refetch on mount/focus/reconnect. While refetching, mark any retained result as old and disable purchase actions until the fresh result arrives. |
| Guest/Member cart and address/order/review reads | `no-store`; Guest `GET /cart` goes through a same-origin handler that relays `Set-Cookie`. Private responses use `Cache-Control: private, no-store`. | `staleTime: 0`; refetch on route entry and after related writes. No persisted cache. |
| Seller/Admin reads and reports | `no-store`; private responses use `Cache-Control: private, no-store`. | `staleTime: 0`; query keys include resource, filters and actor scope. Reports include the UTC `[from,to)` interval. |
| Checkout eligibility and command results | Fresh request at checkout entry and immediately before a new intent; never cache `POST /orders` or its idempotency result as a query. | Keep pending key/body in flow state until resolved. Disable duplicate submit; never optimistic-update stock, totals, order or payment status. |
| UPLOAD image bytes | Preserve backend `Cache-Control: no-store`; same-origin routing must not replace it. | No Query cache or image optimizer cache for bytes. |
| LINK image bytes | Browser requests the approved remote host directly. | Host response controls browser caching; failed loads show a local placeholder. No Query or Next image optimizer cache. |
| Hashed frontend assets | Static asset caching may use immutable versioned filenames. | Normal browser asset cache. |

These are target policies, not measured cache durations. The application does not add Redis or a shared server cache. `router.refresh()` refreshes the current route payload but does not invalidate a persistent server data cache; `no-store` makes its next API read fresh. Public data can receive a bounded server TTL only after publication, suspension and moderation invalidation are specified and tested.

## Query keys and invalidation

Use one key factory per feature. Include every input that can change the response: resource, ID, normalized filters, cursor and actor scope. Cursor strings are opaque. Do not place JWTs, Guest cookies, passwords, addresses or raw personal data in keys. Clear the entire browser Query cache on login, logout and account change before loading the new actor's data; this also removes the Guest cart view after merge.

| Successful command | Invalidate/refetch |
| --- | --- |
| Cart line set/remove or Member login merge | Cart; refresh header count. Login also clears the old actor cache. |
| COD order creation | Cart, own orders, relevant product detail/stock views. Navigate using returned order ID after the 201 response. |
| Order cancellation or Seller mark-paid | Owned order/portion detail and list; product/stock reads after cancellation; relevant review eligibility after payment. |
| Review create/edit/delete or Admin moderation | Own reviews, visible product reviews and product rating/count; Admin moderation list. |
| Seller product, stock or image edit | Own product detail/list, public product detail/list and image references. Re-read the separate product or stock version before another edit. |
| Admin Seller/category policy | Affected policy list/detail plus public categories/products and product detail. |

Await invalidation for an active view before showing a confirmed final state. A successful mutation response may update one matching query directly when it contains the complete authoritative record, but related lists still invalidate. Never treat optimistic UI as a committed cart total, stock level, order status, review visibility or report result. A failed mutation keeps form input and leaves server-derived cache entries stale until they are re-read. On `STALE_VERSION` or state conflict, fetch the owned record and require review before a new command.

## Request behavior and checks

Same-origin handlers send `Cache-Control: private, no-store` for authenticated, Guest-cookie and mutation responses, including errors. They do not cache `Set-Cookie` responses. Server fetches explicitly set `cache: 'no-store'`; do not rely on framework defaults or static prerender detection. Request-scoped duplicate reads may be deduplicated within one render, but no result crosses request or actor boundaries.

Verify that switching accounts never shows the previous user's order, cart or policy data; browser back/forward and focus refresh mutable views; a Seller suspension or product unpublish disappears from a new public read; review moderation changes public counts; UPLOAD content and failed image responses are never served from a stale cache. Test checkout replay with the same key/body separately from Query invalidation: invalidating a view must not create a new checkout intent.

Implementation references: [TanStack Query server rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr), [mutation invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations), [Next.js fetch caching](https://nextjs.org/docs/app/api-reference/functions/fetch), and [Next.js route refresh](https://nextjs.org/docs/app/api-reference/functions/use-router).
