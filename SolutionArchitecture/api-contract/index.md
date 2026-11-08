# API Contract

**Status: Approved by the project owner on 2026-11-08.** Runtime conformance remains an implementation gate.

[Open ReDoc on the documentation website](/redoc.html) · [OpenAPI 3.1 source](./openapi.yaml)

OpenAPI is the target HTTP contract for **UC-01–UC-10**. It contains 38 operations. The ReDoc link works after starting the reader in `util/`; it is not a hosted service or a filesystem page.

- [HTTP behavior and complete use-case inventory](./http-api.md)
- [Role and ownership matrix](./authorization-matrix.md)
- [Product images: LINK and UPLOAD](./product-images.md)
- [Exceptional errors and class diagram](./exceptional-errors.md)
- [Reader setup and validation](../../util/README.md)

## Scope audit

The previous contract had 34 operations. Removed `GET /home` because it duplicated product/category discovery, and `GET /me` / `PATCH /me` because general profile management is not a UC-03 goal. Login now returns trusted account identity with its token.

Added seven supporting operations: list/create owned checkout addresses (UC-04), list own orders (UC-04), read one own product (UC-06), list own active reviews (UC-08), list Sellers for policy (UC-09) and list active reviews for moderation (UC-10). These supply IDs and versions needed by the existing commands. No notification, profile edit, wishlist, voucher-management, shipping, refund, gateway or production quick-login operation is included. Voucher validation remains inside checkout. Seller/Admin provisioning and development quick-login stay outside this production contract.

## Implementation readiness

The contract defines variant IDs/prices/stock, owned reads, cursor envelopes, edit preconditions, Guest cart sessions/merge results, checkout replay semantics, order snapshots, moderation reasons and typed errors. The scope validator rejects operations absent from the inventory, missing use cases, dangling references and unused schemas; Redocly checks OpenAPI structure.

These are design outputs, not evidence of working controllers. Implement each slice with the [scenario and test-first workflow](../backend/4-automated-testing/4.%20Automated%20Testing.md). Before release, verify JWT/ownership, concurrent stock and cancel/payment races, same-key replay, image decoding and response schemas against real PostgreSQL.

Contract revision 0.2.0 selects `expectedVersion`, cursor limit 1–100/default 20, registration password length 12–128, image limits and a 366-day maximum report interval as implementation defaults. They are contract design decisions, not newly discovered BA requirements. The approved LINK host/license list, compatible backend dependency versions and operational secrets are still deployment inputs; a valid OpenAPI file cannot supply them.
