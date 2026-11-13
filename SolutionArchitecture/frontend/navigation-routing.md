# Navigation and Routing

Next.js App Router owns web paths. The paths below are target UI routes, not additions to the [38-operation backend API](../api-contract/http-api.md). Route groups do not appear in the URL. The backend [authorization matrix](../api-contract/authorization-matrix.md) remains authoritative for role and ownership.

| Web path | Access | Backend operations used |
| --- | --- | --- |
| `/` | All | `listCategories`, `listProducts` |
| `/products` | All | `listProducts`, `listCategories` |
| `/products/[productId]` | All; review command for Member | `getProduct`, `listProductReviews`, `createProductReview`; cart action uses `getOwnCart`, `setCartLine` |
| `/cart` | Guest, Member | `getOwnCart`, `setCartLine`, `removeCartLine` |
| `/login`, `/register` | All | `logIn`, `registerMember` |
| `/checkout` | Member | `getOwnCart`, `listOwnCheckoutAddresses`, `createOwnCheckoutAddress`, `placeCodOrder` |
| `/account/addresses` | Member | `listOwnCheckoutAddresses`, `createOwnCheckoutAddress` |
| `/account/orders`, `/account/orders/[orderId]` | Member | `listOwnOrders`, `getOwnOrder`, `cancelUnpaidOrder` |
| `/account/reviews` | Member | `listOwnReviews`, `updateOwnReview`, `deleteOwnReview` |
| `/seller/products`, `/seller/products/new`, `/seller/products/[productId]` | Seller | `listOwnProducts`, `createOwnProduct`, `getOwnProduct`, `updateOwnProduct`, `updateOwnStock`, `addLinkedImage`, `uploadProductImage`, `removeOwnProductImage` |
| `/seller/orders` | Seller | `listOwnSellerOrders`, `markOwnOrderPaid` |
| `/admin/sellers` | Admin | `listSellersForPolicy`, `updateSellerStatus` |
| `/admin/categories` | Admin | `listCategories`, `createCategory`, `updateCategory` |
| `/admin/reviews` | Admin | `listReviewsForModeration`, `moderateReview` |
| `/admin/reports` | Admin | `getReport` |
| `/admin/audit` | Admin | `listAuditEntries` |

The operation names match `operationId` in [OpenAPI](../api-contract/openapi.yaml); generated method names may differ by generator. UPLOAD bytes use the image `contentPath` through a narrow same-origin route or deployment routing, which invokes `getUploadedImage`. LINK images go directly to the approved host.

## Navigation and guards

| Actor | Main navigation | Protected-path behavior |
| --- | --- | --- |
| Guest | Home, catalog, cart, login, register | `/checkout` and `/account/*` redirect to `/login` with a safe return path. Seller/Admin paths lead to login. |
| Member | Home, catalog, cart, orders, reviews, addresses | Seller/Admin paths show access denied. |
| Seller | Home, catalog, seller products and orders | Cart, checkout, account and Admin paths show access denied. |
| Admin | Home, catalog, seller policy, categories, reviews, reports and audit | Cart, checkout, account and Seller paths show access denied. |

Read the role from the server-validated, sealed session created from the login response. Do not trust a browser role parameter or an unverified JWT payload. Route guards protect navigation and avoid rendering private data before checking the session. Every backend request still enforces role and ownership. A backend 401 clears the local session and redirects to login; 403 shows a role-safe denial; 404 uses the same neutral missing-resource screen for absent and foreign IDs. Logout is a same-origin frontend action that clears the session; no backend logout endpoint is in the contract.

After Guest checkout redirects to login, preserve the `guest_cart` cookie. Accept `returnTo` only as a relative path in the app's allowlisted Member destinations; default to `/cart` if invalid. After Member login, show any rejected `cartMerge` lines, then refresh the cart before resuming checkout. Seller/Admin login never resumes a cart flow. Registration creates a Member account; it does not imply a login token, so continue to `/login` unless the contract changes.

## URL state and transitions

`/products` uses `q`, `categoryId`, `minPrice`, `maxPrice` and opaque `cursor`, matching the API query fields. A filter change removes `cursor`; the next page uses only the `nextCursor` returned for the same filter set. Other cursor lists use their API's `cursor` and `limit`. On `INVALID_CURSOR`, remove the cursor and explain that the list restarted. URL parameters restore filters and list position on browser back/forward, but cursor pagination is not a cross-request snapshot.

Checkout navigation never treats a cart badge or an old product page as proof of stock. Entering `/checkout` loads a fresh cart and addresses. A successful `placeCodOrder` navigates to `/account/orders/[orderId]` and refreshes cart/order queries. A 503 or lost checkout response keeps the same key and exact body for retry. Order cancellation and Seller mark-paid refresh the owned detail/list before showing the current state. The [frontend design](./frontend-design.md) owns these failure paths.

Use route-level `loading.tsx`, `error.tsx` and `not-found.tsx` where a data view needs them. Keep the shared header and navigation usable if one public section fails. Never include private IDs, personal data or tokens in a redirect URL. Do not prefetch protected pages before the role is known.
