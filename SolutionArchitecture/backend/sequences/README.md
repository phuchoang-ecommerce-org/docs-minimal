# Backend Sequence Diagrams

**Status: Approved design baseline, 2026-11-08.** These sequences reconcile the current UC-01–UC-10, 38-operation HTTP contract and backend module/transaction design. They describe target behavior, not completed code.

| Use case / boundary | Sequence | Critical behavior |
| --- | --- | --- |
| All HTTP operations | [Security and errors](./request-boundary.md) | Trusted Actor, 401/403/404 separation, safe errors, response after commit |
| UC-02/03 | [Identity and cart](./identity-cart.md) | MEMBER registration, login, one Guest merge, versioned cart edits |
| UC-01 and UC-04 reads | [Discovery, addresses and orders](./discovery.md) | Visibility/ownership filters, scoped cursors, snapshot reads |
| UC-06 | [Seller catalog and stock](./seller-catalog.md) | SellerShop != Account ID, root versus stock versions |
| UC-01/06 | [LINK and UPLOAD images](./product-images.md) | Owner/version checks, source exclusivity, no backend URL fetch |
| UC-04 | [COD checkout](./cod-checkout.md) | Replay before mutable reads, all-or-nothing stock/order/cart/audit |
| UC-05 | [Cancellation](./order-cancellation.md) | Shared order lock, all-pending guard, restore once |
| UC-07 | [Seller records COD](./seller-payment.md) | Shared root lock, duplicate Paid 409, only owned portion returned |
| UC-01/08/10 | [Reviews and moderation](./rating-review.md) | Paid portion eligibility, active uniqueness, hidden stays hidden |
| UC-09/10 | [Admin policy and reads](./administration.md) | Required reason, atomic audit, bounded read-only reports |

Each file lists the exact OpenAPI operation IDs it covers. [HTTP inventory](../../api-contract/http-api.md) remains the path/method allowlist; sequence participants do not create endpoints. Public image fetching is performed by an API consumer; no frontend implementation is scheduled here.

A participant labeled “ports/JDBC adapters” is a synchronous in-process call through the owning module's exported API; it is not a remote service or permission to access another module's mutable repository. All command collaborators join the handler's transaction. Read projections are immutable; MapStruct stays at adapter boundaries. Security/parsing failures may return before a transaction starts, while persistence/audit failures roll back before an error response. Error details use [Problem](../../api-contract/exceptional-errors.md).

[Activity diagrams](../../../BusinessAnalyst/activity-diagrams.md) cover actor choices. The [demo plan](../../../ProductManager/demo-plan.md) selects the first implementation slice; other approved sequences remain later backlog work. Undefined initial review visibility and voucher details are explicit prerequisites, not inferred approvals or demo blockers for the no-voucher purchase flow.
