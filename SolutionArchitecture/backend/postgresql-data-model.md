# PostgreSQL Data Model

## Data ownership

PostgreSQL is authoritative for marketplace data, search, carts, USD prices, orders, COD state, rating/review, notifications, reports and audit. Product images support two modes. LINK stores URL/source/license metadata and the browser fetches the remote image live. UPLOAD stores validated image bytes in PostgreSQL and serves them from the application. Use Flyway migrations. No secondary data store or projection exists. PostgreSQL full-text search (`tsvector`, GIN) and indexed filters serve discovery.

| Area | Core tables / constraints |
| --- | --- |
| Identity | `account` (unique normalized login, password hash, role, status), `seller_shop`, `address` (Member owner) |
| Catalog | `category`, `product` (Seller owner, publication state), `variant` (unique SKU, USD price), `product_image` (product, mode LINK/UPLOAD, sort order, alt text; LINK has HTTPS URL/source/license metadata and null bytes; UPLOAD has PostgreSQL `BYTEA`, MIME/size/dimensions and null remote URL) |
| Stock | `stock` (variant, on_hand, version, nonnegative check) |
| Cart | `cart` (Member or opaque Guest session, expiry), `cart_line` (unique cart/variant) |
| Orders | `customer_order` (Member, USD total, idempotency key, state), `seller_order` (order, Seller, COD status), `order_line` (Seller order, product/price/discount snapshots), `order_address_snapshot` |
| Other | `voucher`, `voucher_redemption`, `review` (Member, product, rating 1–5, text, visible flag; unique Member/product), `in_app_notification`, `audit_entry` (append-only) |

Use `NUMERIC(12,2)` for USD, never floating point. Store UTC timestamps. Index `(seller_id, payment_status, created_at)`, `(member_id, created_at)`, SKU, unique `(member_id, idempotency_key)`, published products and product search. Build rating average/count from visible reviews with PostgreSQL queries; add an indexed/materialized database approach only after benchmarks justify it. No shipping, return, refund, payment-evidence or external-event tables. Bound UPLOAD count/size and monitor PostgreSQL backup growth.

## Critical transactions

```text
COD checkout:
  BEGIN
  validate authenticated Member and active listings; recalculate USD totals
  conditionally UPDATE stock SET on_hand = on_hand - requested
    WHERE variant_id = ? AND on_hand >= requested, in stable variant order
  INSERT customer_order, seller_order(s: PENDING_PAYMENT), order_line snapshots
  INSERT audit_entry
  COMMIT

Seller marks own portion Paid:
  BEGIN
  check seller_id and PENDING_PAYMENT state
  UPDATE seller_order SET payment_status = PAID, paid_at = now()
  INSERT audit_entry
  COMMIT
```

The unique idempotency constraint is the final duplicate guard. Repeated key and same request fingerprint returns the existing order; different payload returns 409. A Member cancellation is allowed only when **all** portions are Pending Payment; restore each line's stock once in the same transaction that marks the order Cancelled. A Paid portion cannot be reversed by the Seller.
