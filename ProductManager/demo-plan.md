# Backend Demo Plan

Demo date: **2026-11-22**. Rehearsal/feature freeze: **2026-11-20**. One developer. Format: a 10–15 minute API demonstration against disposable local PostgreSQL, followed by recorded automated-test evidence. No frontend application is required.

## Fixtures and execution

PB-001/PB-019 create the actual implementation fixtures and runner. This documentation task does not create application data or claim an executable backend exists. Fixture reset recreates only the explicitly disposable demo database; it never deletes production data or mutates append-only audit history.

Use Member A/B, Seller A/B and an Admin test account, each with a unique Account ID; SellerShop IDs differ from those Account IDs. Seed an active category, two published products from different Sellers, an unpublished product and one inactive-Seller product for exclusion checks. Each purchasable product has a known variant/price and enough stock for a paid-order run and a separate cancellation run. A last-unit fixture is isolated for the concurrency suite.

Addresses belong to their Members; Guest is an opaque session, not an account. Use a fixed clock/known data in automated tests and capture returned IDs/versions in the demo runner. Keep passwords/signing keys out of committed scripts and recordings. Seed runs only with the guarded dev profile. Image arrays may be empty for this backend demo; if future image fixtures are added, use approved LINK metadata. No valid voucher is configured, so absent code yields no discount and an unknown code must fail with rollback.

ReDoc is the contract reader. The HTTP runner/collection sends requests and asserts responses; PostgreSQL tests prove durable state and races. Do not claim clicking ReDoc alone tests the backend.

## Demonstration order

| Step | Caller / action | Visible result and evidence |
| --- | --- | --- |
| 1 | Start backend and PostgreSQL with migrations | Healthy local startup; fixture/profile marker; no secret values shown |
| 2 | Guest browses products and adds variants from Seller A/B | Only eligible products visible; USD price/variant IDs; Guest cart owns its lines |
| 3 | Register/sign in as Member A and merge Guest cart | MEMBER token and account identity; valid lines merge once; replayed Guest source adds nothing twice |
| 4 | Select/create owned address; checkout with current cartVersion and key K1 | 201 with one customer order, two pending Seller portions, snapshots and decremented stock |
| 5 | Retry identical K1/body, then reuse K1 with changed body | Original 201 creation response with same order ID; changed body 409; no second decrement/order/audit |
| 6 | Seller B attempts Seller A portion, then each Seller pays own portion | Foreign portion 404; first valid payment leaves aggregate pending; second makes it Paid; repeated Paid is 409 |
| 7 | Member A attempts to cancel that paid/partly-paid order | 409, unchanged stock and payment history |
| 8 | Build and place a fresh fully pending order using a new key; cancel twice | First cancel 200 restores stock once; second 200 changes neither stock nor audit count |
| 9 | Member B requests Member A order; Seller uses pre-checkout stock version | Foreign detail 404; stale stock edit 409; fresh read shows current version |
| 10 | Show automated concurrency/rollback reports | Last-unit winner, same-key convergence, cancel/payment serial outcomes, two-Seller payment and audit rollback all passed on real PostgreSQL |

For the paid order, optionally show cancellation after the first Seller payment to prove that “not fully Paid” does not mean cancellable. `markOwnOrderPaid` returns only its own SellerOrder; use Member `getOwnOrder` for aggregate status. Evidence uses IDs captured from responses, not hand-edited database rows.

## Demo acceptance gate

- All 18 target operation IDs assigned to PB-002–010 are implemented for their demo-relevant branches with schema validation; any branch outside demo (configured vouchers) is declared explicitly. This does not claim all 38 operations are complete.
- Guest merge, role/owner errors, stock versions, atomic multi-Seller checkout, Member/key replay, cancel-once and per-Seller COD work from a fresh database.
- Real PostgreSQL tests prove last-unit, same-key, cancel/payment and two-Seller races, plus rollback on a late audit failure. No sleep-based race claim, mocked-lock evidence, zero-test pass or ignored failing test.
- Approved architecture, mapping, constructor and prod fixture guards pass for implemented slices. No new endpoint, persistent store, shipping/refund or gateway path.
- The runner succeeds twice on clean disposable fixtures; saved evidence includes revision, request/results, test counts and known omissions. No password/token/key is included in shared evidence.

## Reduced demo target

If the checkpoint forecast exceeds remaining capacity, use **12 operations** with dev-provisioned accounts, category/products and owned addresses. Defer public registration, category-list demonstration, address creation, own-order history, Seller product detail and stock-management interaction. Stock correctness is still observed through product queries and mandatory integration tests.

| Kept operation IDs | Reason |
| --- | --- |
| `logIn` | Real credential/JWT login and Guest merge |
| `listProducts`, `getProduct` | Purchasable variants and post-command stock observation |
| `getOwnCart`, `setCartLine`, `removeCartLine` | Owned Guest/Member purchase intent |
| `listOwnCheckoutAddresses` | Select a seeded owned address |
| `placeCodOrder`, `getOwnOrder` | Atomic multi-Seller order and state inspection |
| `cancelUnpaidOrder` | All-pending cancellation and one-time restoration |
| `listOwnSellerOrders`, `markOwnOrderPaid` | Per-Seller COD recording |

This changes demonstration breadth, not security or transaction rules. Do not bypass JWT, use direct DB edits for payment, omit idempotency/version fields, disable audit or remove mandatory race tests to meet the date. If these 12 cannot pass the invariant gate by rehearsal, report the last verified slice and the unfinished work instead of describing an unsafe end-to-end flow as complete.
