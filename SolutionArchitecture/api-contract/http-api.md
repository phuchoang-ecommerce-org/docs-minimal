# HTTP API Contract

[OpenAPI](./openapi.yaml) defines request/response fields. This document owns cross-operation behavior and the explicit scope inventory. New endpoints require a use-case reason and updates to both files.

## Transport and ownership

Use JSON, except image multipart uploads and image byte responses. Reject unknown command fields and invalid/null values with 400. PATCH omits unchanged fields; no endpoint accepts `memberId`, `sellerId`, role or payment totals as authority. IDs are UUIDs. USD amounts are decimal strings with exactly two fractional digits, bounded by PostgreSQL `numeric(12,2)`.

Bearer tokens contain one operational role. Resolve SellerShop ID from Account ID; never equate them. Missing/invalid required authentication is 401; wrong role is 403. After authorization, owner-filtered lookup returns the same 404 for missing and foreign IDs. Check ownership before version/state so a foreign ID cannot leak its existence. Public discovery exposes only published products from active Sellers, including image/review reads. Seller catalog reads include unpublished own records; catalog writes require an active shop. Suspension does not block recording cash for an existing valid portion.

## Guest cart and login

`GET /cart` creates an empty Guest session when no credential exists and sets `guest_cart` (opaque, HttpOnly, SameSite=Lax, Secure in production). Subsequent Guest edits require that cookie. MEMBER bearer takes precedence; invalid bearer never falls back to Guest. Seller/Admin cart access is forbidden. Cookie-authenticated mutations and login with a Guest cookie require an allowed Origin. The backend maintains its Origin allowlist per runtime profile.

Login consumes a Guest cart once for a Member and reports rejected variants through `cartMerge`. Sum valid quantities with existing Member lines; reject a line if unavailable or its merged quantity exceeds available stock. Merge never reserves stock. An already-consumed cookie cannot add quantities again. Invalidate the Guest cookie after consumption. Seller/Admin login does not import it. Token output contains account identity, so a general `/me` endpoint is unnecessary.

## Edits and pagination

Responses carry `version`. JSON edits require `expectedVersion`; DELETE uses a required `expectedVersion` query parameter. Missing/invalid version is 400; owned but stale data is 409 `STALE_VERSION`. Product version covers product, variant-price and image changes. Stock has its own version, incremented by Seller edits, checkout and cancellation. Cart/review/category/Seller policy edits use their own root version. Image creation returns `productVersion`; after deletion reload the product. Commands that serialize order state (cancel/mark-paid) do not use detached edit versions.

Every list accepts `cursor` and `limit` (1–100, default 20), and returns `items`, `nextCursor`, `hasNext`. Empty/final pages have `hasNext=false` and `nextCursor=null`. Fetch limit+1, then encode the last returned record. Products, categories, addresses and Sellers sort by immutable ID descending because their current schema has no creation timestamp. Orders, reviews and audit use `(created_at,id)` descending; Seller portions use `(customer_order.created_at,seller_order.id)`. Product full-text search retains ID ordering; relevance sorting is outside this contract.

Authenticate cursor contents (version, boundary, resource, actor scope, filters) with a server MAC. Reject malformed, modified, other-actor or changed-filter cursors with 400 `INVALID_CURSOR`; always reapply ownership predicates. Pagination is not a cross-request snapshot. Do not expose offset/page parameters or silently reuse a cursor on another endpoint.

## Checkout and state

`POST /orders` requires Member, owned `addressId`, current `cartVersion`, `paymentMethod=COD` and `Idempotency-Key` (1–128 characters). Optional voucher is validated inside checkout. Persist Member/key, canonical request fingerprint and immutable order snapshots in one transaction. First check the saved key: same body reconstructs the original 201 response from immutable snapshots even after the cart or order changes (PLACED, all portions PENDING_PAYMENT, paidAt null); a different body returns 409. Retain the key while the order exists. Rollback consumes neither key nor stock. A new checkout needs the latest cart version and a new key.

Successful checkout snapshots address/product/variant prices and discounts, decrements all stock, consumes the cart and audits atomically. A conflict rolls everything back. `GET /orders/{orderId}` returns current state; replay returns the original creation snapshot. Server computes all totals. Seller portion reads expose only that Seller's lines and totals, never another Seller's portion.

Cancellation and mark-paid share the customer-order lock. Cancel requires all portions pending; repeat cancellation returns the cancelled order without another stock restoration/audit. Mark-paid requires an owned pending, non-cancelled portion; repeated Paid is 409. Aggregate payment is Paid only when every portion is Paid. A Member can review a purchased product as soon as its own portion is Paid.

Admin category/status/moderation writes require a non-blank reason and append-only audit in the same transaction. Review edit preserves hidden status; deletion is soft removal. Reports use a required UTC `[from,to)` interval of at most 366 days. Metric definitions are in the OpenAPI operation.

## Operation inventory

This table is the scope allowlist checked by `npm run validate:api`; a use-case label alone does not justify an endpoint.

| Method | Path | Use case | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/login` | UC-03 | Log in. |
| POST | `/accounts` | UC-03 | Register member. |
| GET | `/categories` | UC-01 | List categories. |
| GET | `/products` | UC-01 | List products. |
| GET | `/products/{productId}` | UC-01 | Get product. |
| GET | `/products/{productId}/images/{imageId}/content` | UC-01 | Get uploaded image. |
| GET | `/products/{productId}/reviews` | UC-01 | List product reviews. |
| POST | `/products/{productId}/reviews` | UC-08 | Create product review. |
| PATCH | `/me/reviews/{reviewId}` | UC-08 | Update own review. |
| DELETE | `/me/reviews/{reviewId}` | UC-08 | Delete own review. |
| GET | `/seller/products` | UC-06 | List own products. |
| POST | `/seller/products` | UC-06 | Create own product. |
| PATCH | `/seller/products/{productId}` | UC-06 | Update own product. |
| GET | `/seller/products/{productId}` | UC-06 | Read unpublished own data and edit versions. |
| POST | `/seller/products/{productId}/images/link` | UC-06 | Add linked image. |
| POST | `/seller/products/{productId}/images/upload` | UC-06 | Upload product image. |
| PATCH | `/seller/stock/{variantId}` | UC-06 | Update own stock. |
| GET | `/cart` | UC-02 | Get own cart. |
| PUT | `/cart/lines/{variantId}` | UC-02 | Set cart line. |
| DELETE | `/cart/lines/{variantId}` | UC-02 | Remove cart line. |
| POST | `/orders` | UC-04 | Place COD order. |
| GET | `/orders` | UC-04 | Find own checkout results and cancellation targets. |
| GET | `/orders/{orderId}` | UC-04 | Get own order. |
| POST | `/orders/{orderId}/cancellation` | UC-05 | Cancel unpaid order. |
| GET | `/seller/orders` | UC-07 | List own seller orders. |
| POST | `/seller/orders/{sellerOrderId}/mark-paid` | UC-07 | Mark own order paid. |
| PATCH | `/admin/sellers/{sellerId}` | UC-09 | Update seller status. |
| PATCH | `/admin/reviews/{reviewId}/moderation` | UC-10 | Moderate review. |
| GET | `/admin/reports` | UC-10 | Get report. |
| GET | `/admin/audit` | UC-10 | List audit entries. |
| DELETE | `/seller/products/{productId}/images/{imageId}` | UC-06 | Remove own product image. |
| POST | `/admin/categories` | UC-09 | Create category. |
| PATCH | `/admin/categories/{categoryId}` | UC-09 | Update category. |
| GET | `/me/addresses` | UC-04 | Select an owned address for checkout. |
| POST | `/me/addresses` | UC-04 | Supply the valid address precondition for a new Member. |
| GET | `/me/reviews` | UC-08 | Find own visible/hidden reviews and edit versions. |
| GET | `/admin/sellers` | UC-09 | Find policy targets and current versions. |
| GET | `/admin/reviews` | UC-10 | Find visible/hidden moderation targets and versions. |
