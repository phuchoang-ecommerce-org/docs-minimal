# Frontend Demo Plan

Target: **2026-11-22**. Rehearsal and freeze: **2026-11-20**. This is a conditional browser demonstration alongside the [backend API demo](../demo-plan.md), using the same disposable PostgreSQL fixtures and the backend's 12-operation reduced target. The frontend is not yet implemented or assigned to a developer.

## Browser run

| Step | Actor and action | Observable result |
| --- | --- | --- |
| 1 | Open product list/detail as Guest | Two published active-Seller products show variant IDs, USD prices and stock; missing images have a placeholder. |
| 2 | Add variants from Seller A and B; change/remove a line | Guest cart shows server totals and current cart version; no stock reservation is claimed. |
| 3 | Sign in as dev-provisioned Member A | Guest cookie is consumed once; merged cart is re-read; rejected lines appear if present. Token remains in the server session. |
| 4 | Select a seeded owned address and place a COD order | One 201 creates two pending Seller portions; Member order detail uses the returned ID. A lost response retries the same key and exact body. |
| 5 | Sign in separately as Seller A and Seller B; record cash for each owned portion | Each Seller sees only its own portion; after the first payment the Member order remains pending, after the second it is Paid. |
| 6 | Attempt cancellation of the paid order; place and cancel a separate pending order | Paid cancellation shows 409; pending cancellation succeeds once and a repeat does not restore stock twice. |
| 7 | Show backend runner and PostgreSQL test reports | Same-key replay, last-unit, cancel/payment, two-Seller payment and late-audit rollback evidence comes from the backend suite. |

Use different synthetic accounts for Member and Sellers, with Account IDs distinct from SellerShop IDs. Fixture reset must target only the disposable demo database. No passwords, tokens or signing keys enter recordings, committed scripts or shared results. The frontend reads response IDs/versions; it does not edit PostgreSQL by hand.

## Acceptance gate

- A production-mode build and the generated OpenAPI client check pass. The dev login panel/action and sample account strings are absent from the production build.
- The 12 named demo operations work through the UI against a fresh backend fixture. UI assertions cover Guest-cookie relay, login merge, role guards, fresh cart/address reads, stable checkout key/body, order status refresh and safe 401/403/404/409 handling.
- Two full browser runs succeed after independent disposable resets, without manual database corrections. The backend [demo acceptance gate](../demo-plan.md#demo-acceptance-gate) supplies transaction, concurrency and rollback proof; UI success alone cannot replace it.
- Evidence records frontend and backend revisions, check results, operation coverage, known omissions and any blocked flow. No unimplemented route is described as complete.

If FE Sprint 1 does not reach a real cart merge or FE Sprint 2 does not reach safe checkout, demonstrate only the verified browser slice and use the backend API runner for the full technical flow. If no separate frontend developer is assigned, use the API demo alone as already planned.
