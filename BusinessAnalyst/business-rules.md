# Business Rules and Core Flows

## Invariants

| ID | Rule | Verification |
| --- | --- | --- |
| BR-01 | Only published products of active Sellers appear in public discovery and checkout. | Suspended/unpublished listings are rejected at purchase. |
| BR-02 | Product and voucher prices, totals and USD currency are snapshotted on order lines. All money uses USD and two decimals. | Later catalog edits do not change existing orders. |
| BR-03 | Available stock cannot go below zero. Checkout atomically decreases on-hand quantity in PostgreSQL for all lines. | Concurrent checkouts never oversell; a failed checkout changes no stock. |
| BR-04 | A client idempotency key is unique per Member and checkout intent. Same key/payload returns the original order; a different payload returns 409. | No duplicate order or stock decrement. |
| BR-05 | Seller reads/mutates only their own products, stock and seller-order payment status. | Cross-seller IDs return 404. |
| BR-06 | Member sees/mutates only their own private cart, address, order and review. Checkout requires an authenticated Member. | Guest purchase returns 401; cross-member IDs return 404. |
| BR-07 | Voucher validity, limit and eligibility are checked on the server before commit; discount is snapshotted. | Invalid voucher rolls back checkout. |
| BR-08 | A seller order starts `PENDING_PAYMENT` and can move to `PAID` once, by its Seller after receiving COD cash. The customer order is Paid only when all seller orders are Paid. | Unauthorized/duplicate transitions fail; audit records actor/time. |
| BR-09 | A Member may cancel an order only while every seller portion is Pending Payment. Cancellation restores stock once. Paid orders cannot be cancelled in this minimal product. | No refund or return state exists. |
| BR-10 | A Member may submit one active one-to-five-star rating and optional written review per product after a Paid seller order containing that product. Rating and text are moderated by Admin. | Unpaid, unpurchased, invalid or duplicate review fails. |
| BR-11 | Seller chooses LINK or UPLOAD per image. LINK stores an approved HTTPS URL and source/license metadata, then loads live. UPLOAD validates type/size and stores bytes in PostgreSQL. | Invalid/unavailable image shows a local placeholder; arbitrary internal URLs and unsafe uploads are rejected. |

## Main flows

1. **Discover:** Guest or Member sees active Sellers' published products, USD prices and review summaries. PostgreSQL performs product search/filter. A LINK image is requested live from its approved source URL; an UPLOAD image is served from PostgreSQL. Failure in either mode never hides product text, price or purchase controls.
2. **Cart and login:** Guest and Member can edit their own carts. Guest cart uses an opaque HttpOnly session cookie. On login, valid guest lines merge once into Member cart. Checkout redirects Guest to login and resumes after authentication.
3. **COD checkout:** Member selects an owned address and reviews a USD total. Server recalculates prices, stock and voucher. One PostgreSQL transaction decrements stock, creates the customer order and seller portions, snapshots lines, writes `PENDING_PAYMENT` for each seller portion and audits the action. No shipping method or fee is collected. Failure rolls back everything.
4. **COD payment recording:** Cash handoff takes place outside the application. Each Seller views only its own seller order and selects **Mark as paid** after receiving cash. The backend checks seller ownership, current state and order status, then records `PAID` and an append-only audit entry in one transaction. One Seller cannot mark another Seller's portion. The customer order is fully Paid only when every portion is Paid.
5. **Cancellation:** Member may cancel only before any portion is Paid. Stock restoration and audit commit atomically. No return, exchange, refund or reverse-payment path is provided.
6. **Ratings and reviews:** After a portion is Paid, its buying Member can submit a 1–5 star rating and optional review text for its products. The Member may edit/delete their own review under a simple published policy; Admin can hide abusive reviews. Public average/count use visible reviews only and query PostgreSQL. No purchase status is inferred from delivery.
7. **Admin:** Admin manages Seller status, categories, moderation and audit/report views. Reports query PostgreSQL with bounded date ranges.

## Failure behavior and acceptance

A stock conflict, invalid voucher or illegal state has a stable error code and no partial write. Missing/non-owned resources return 404, invalid input 400, unauthenticated calls 401, denied role 403 and conflicting idempotency 409. A PostgreSQL outage cannot produce a successful checkout/payment response. Image-source failure displays a local placeholder; it never blocks ordering a product.

- Guest builds a cart, signs in, then purchases with COD.
- A mixed-Seller order creates separate Pending Payment portions; each Seller marks only its own portion Paid.
- Two Members race for the last unit; only one purchase commits.
- A Member cancels a fully unpaid order once and stock returns. A partly Paid order cannot be cancelled.
- A Member rates a Paid product; an unpaid/non-buyer cannot. Admin can hide a review and the public average updates.
- A missing LINK image or unreadable UPLOAD image shows the placeholder while product information remains usable.
