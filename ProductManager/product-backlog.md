# Backend Product Backlog

Design baseline: Approved, 2026-11-08. Backlog execution status: **all items TODO**. One developer; demo 2026-11-22. Order is dependency-aware and prioritizes a working purchase/payment flow. The [Sprint Backlog](./sprint-backlog.md) assigns tasks and dates.

## Priority and estimates

P0 is required for the first demo target. P1 completes the approved backend after the demo. P2 improves implementation tooling. These delivery priorities do not change DDD core/supporting classifications or remove required product scope. Identity, stock and audit are supporting capabilities that must exist before the core flow can be demonstrated safely.

Estimates are **focused developer hours**, including scenario/test-first work, implementation, relevant verification and documentation. They are planning assumptions without measured velocity, not promises. Planned demo work is **50 h**, with **10 h reserve**, within a 60 h productive capacity assumption (10 weekdays × 6 h). There are no separate QA or frontend team members. Unknown repository/bootstrap complexity may invalidate this forecast at the first checkpoint.

## Ordered items

| ID | Priority | Deliverable | Hours | Dependencies | Target |
| --- | --- | --- | ---: | --- | --- |
| PB-001 | P0 | Foundation and reproducible local environment | 4 | — | S1 |
| PB-002 | P0 | Registration, JWT and trusted Actor | 5 | PB-001 | S1 |
| PB-003 | P0 | Discover purchasable variants | 5 | PB-001 | S1 |
| PB-004 | P0 | Guest/Member cart and login merge | 6 | PB-001, PB-002, PB-003 | S1 |
| PB-005 | P0 | Owned checkout addresses | 2 | PB-002 | S1 |
| PB-006 | P0 | Atomic multi-Seller COD checkout | 8 | PB-003, PB-004, PB-005 | S1 tests / S2 implementation |
| PB-007 | P0 | Own order inspection and history | 2 | PB-006 | S2 |
| PB-008 | P0 | Cancel fully unpaid orders | 3 | PB-006, PB-007 | S2 |
| PB-009 | P0 | Record COD cash by Seller portion | 4 | PB-006 | S2 |
| PB-010 | P0 | Versioned Seller stock adjustment | 3 | PB-001, PB-002, PB-003 | S2 |
| PB-018 | P0 | Cross-flow regression and race evidence | 4 | PB-004, PB-006, PB-008, PB-009, PB-010 | S2 |
| PB-019 | P0 | Repeatable demo and rehearsal | 4 | PB-002–010, PB-018 | S2 |
| PB-011 | P1 | Complete Seller catalog and images | 10 | PB-003, PB-010 | S3 forecast |
| PB-012 | P1 | Configured vouchers and allocation | 6 | PB-006, PB-008 | S3 definition / S4 forecast |
| PB-013 | P1 | Paid-purchase ratings and own reviews | 6 | PB-007, PB-009 | S3 forecast |
| PB-014 | P1 | Admin Seller and category policy | 5 | PB-002, PB-003 | S3 forecast |
| PB-015 | P1 | Moderation, reports and audit reads | 6 | PB-013, PB-014 | S4 forecast |
| PB-016 | P1 | Full-contract release hardening | 5 | PB-011–015, PB-018 | S4 forecast |
| PB-017 | P2 | Install and verify approved backend skills/agents | 6 | PB-001 | S4 forecast |

## PB-001 — Foundation and reproducible local environment

**P0 · TODO · 4 h.** Trace: TECH; ARCH-01–10. Dependencies: —.

Java 21/Gradle, pinned compatible Boot/Modulith/jMolecules/JUnit 5/MapStruct/Lombok, PostgreSQL 18 + Flyway in marketplace, module shells/ArchUnit, error/security harness and guarded fixtures.

Acceptance: Clean DB migration and repeat startup work; expected suites run; fixture IDs distinguish Account and SellerShop; prod rejects seed/quick-login. No business implementation before its own RED gate.

## PB-002 — Registration, JWT and trusted Actor

**P0 · TODO · 5 h.** Trace: UC-03; BR-05/06. Dependencies: PB-001.

MEMBER-only registration, password login for provisioned roles, JWT validation, safe Problem responses; login connects to Cart merge after PB-004.

Acceptance: No public role assignment; invalid signature/issuer/audience/expiry gives 401; denied role gives 403; no credential disclosure. Integrated login consumes Guest cart once before response.

## PB-003 — Discover purchasable variants

**P0 · TODO · 5 h.** Trace: UC-01; BR-01/02. Dependencies: PB-001.

Read seeded categories, published products and detail with variant IDs, USD prices/stock, current public visibility, FTS/price filters and bounded cursors.

Acceptance: Unpublished/inactive Seller product detail is 404; empty page is valid; tampered/filter-changed cursor is 400; no extra homepage endpoint. Empty image/review fixtures return valid empty metadata/counts.

## PB-004 — Guest/Member cart and login merge

**P0 · TODO · 6 h.** Trace: UC-02/03; BR-05/06. Dependencies: PB-001, PB-002, PB-003.

Own cart get/set/remove, opaque Guest session, Origin checks, expectedVersion; login sums valid lines and consumes Guest source once.

Acceptance: Foreign access fails; stale edit is 409; invalid JWT cannot fall back; concurrent merges cannot add twice; rejected lines are reported; cart changes never reserve stock. Define Guest TTL as runtime configuration at kickoff.

## PB-005 — Owned checkout addresses

**P0 · TODO · 2 h.** Trace: UC-04; BR-06. Dependencies: PB-002.

Create/list only the authenticated Member's addresses; address validation and bounded list.

Acceptance: No input owner ID; foreign address cannot be selected at checkout; stored fields satisfy AddressValue; no general profile/address editing API.

## PB-006 — Atomic multi-Seller COD checkout

**P0 · TODO · 8 h.** Trace: UC-04; BR-01–07. Dependencies: PB-003, PB-004, PB-005.

Place order with cartVersion + Member/key, protected eligibility/prices, conditional stock decrement, snapshots, Seller portions, cart consumption and audit.

Acceptance: Two-Seller order commits atomically; identical concurrent replay gives one original 201 result; changed body/stale cart conflicts; late failure rolls back all effects. No configured vouchers for demo: unknown voucherCode returns 409, never silently ignored. Valid-voucher behavior remains PB-012.

## PB-007 — Own order inspection and history

**P0 · TODO · 2 h.** Trace: UC-04/05; BR-02/06/08. Dependencies: PB-006.

Current own order detail and cursor history from immutable price/address snapshots.

Acceptance: Foreign ID is 404; later price/address data cannot alter snapshots; aggregate payment is Paid iff all portions Paid; owner/cursor predicates apply on every page.

## PB-008 — Cancel fully unpaid orders

**P0 · TODO · 3 h.** Trace: UC-05; BR-03/06/09. Dependencies: PB-006, PB-007.

Shared customer-order lock, all-portions-pending guard, stock restoration/version bumps and atomic audit.

Acceptance: Repeat cancellation returns 200 with no second stock/audit effect; any Paid portion blocks cancel with 409; foreign order is 404; race with payment preserves a legal outcome.

## PB-009 — Record COD cash by Seller portion

**P0 · TODO · 4 h.** Trace: UC-07; BR-05/08/09. Dependencies: PB-006.

Owned Seller-order list and mark-paid under parent lock; resolve SellerShop from Account ID; append audit.

Acceptance: Foreign portion 404; duplicate Paid/cancelled order 409; two Sellers can pay distinct portions without lost updates; response contains only owned SellerOrder; audit failure rolls back payment.

## PB-010 — Versioned Seller stock adjustment

**P0 · TODO · 3 h.** Trace: UC-06; BR-03/05. Dependencies: PB-001, PB-002, PB-003.

Read owned product and replace stock with expectedVersion; active shop and ownership checks.

Acceptance: Foreign ID 404; inactive own shop write 403; stale absolute edit 409 after checkout/cancel changes stock version; no silent retry/lost decrement; new stock stays nonnegative.

## PB-018 — Cross-flow regression and race evidence

**P0 · TODO · 4 h.** Trace: UC-02/04/05/06/07; BR-03–09. Dependencies: PB-004, PB-006, PB-008, PB-009, PB-010.

Integrate and rerun already test-first scenario suites on real PostgreSQL; close cross-flow gaps and record evidence.

Acceptance: Last-unit, same-key, late-audit rollback, cancel/payment, two-Seller payment, Guest merge and stale-stock scenarios pass with bounded synchronization; expected suites nonempty. This is not the first time feature tests are written.

## PB-019 — Repeatable demo and rehearsal

**P0 · TODO · 4 h.** Trace: Demo gate D1. Dependencies: PB-002–010, PB-018.

API runner/collection, safe disposable fixture reset, state assertions, run instructions and recorded rehearsal.

Acceptance: A fresh local environment reproduces the demo twice with synthetic accounts, no manual DB repair and no secrets committed; prod fixture guards pass; known omitted capabilities are listed.

## PB-011 — Complete Seller catalog and images

**P1 · TODO · 10 h.** Trace: UC-01/06; BR-01/05/11. Dependencies: PB-003, PB-010.

Owned product list/create/patch with variants; LINK/UPLOAD add, image removal and public image bytes.

Acceptance: SKU/parent versions enforced; source branches exclusive; approved host configuration supplied; 5 MiB/dimension/pixel/count limits, primary replacement, public visibility and no-store tested. Product writes initialize stock at zero.

## PB-012 — Configured vouchers and allocation

**P1 · TODO · 6 h.** Trace: UC-04; BR-02/07. Dependencies: PB-006, PB-008.

Specify rule JSON, final percentage rounding and cancellation quota behavior; implement validation/limits/atomic redemption using approved proportional cent allocation.

Acceptance: Definitions recorded before dependent test RED; fixed fixtures verify totals, last redemption race, no partial consumption, replay and cancellation quota rule. No voucher-management endpoint is added.

## PB-013 — Paid-purchase ratings and own reviews

**P1 · TODO · 6 h.** Trace: UC-01/08; BR-06/10. Dependencies: PB-007, PB-009.

Define initial visibility, then public list, create, own list, edit and soft removal.

Acceptance: Paid portion qualifies even if aggregate pending; non-buyer/unpaid 409; one active review per Member/product; hidden stays hidden on edit; removal permits eligible resubmission; public aggregate excludes hidden/removed.

## PB-014 — Admin Seller and category policy

**P1 · TODO · 5 h.** Trace: UC-09; BR-01/05. Dependencies: PB-002, PB-003.

Category create/update and Seller policy list/status update, expectedVersion and required reason.

Acceptance: Wrong role 403; missing target 404; stale version 409; policy+audit atomic; suspension blocks new discovery/checkout while existing valid COD remains operable.

## PB-015 — Moderation, reports and audit reads

**P1 · TODO · 6 h.** Trace: UC-10; BR-10. Dependencies: PB-013, PB-014.

Admin review list/moderation, bounded reports and cursor audit read.

Acceptance: Reason required; hidden review excluded from next public summary; no audit mutations; UTC intervals <=366 days and exact gross/paid metric definitions match OpenAPI.

## PB-016 — Full-contract release hardening

**P1 · TODO · 5 h.** Trace: UC-01–10; ARCH-01–10. Dependencies: PB-011–015, PB-018.

All 38 operations, migration compatibility, real query plans, deployment/profile checks, secrets and operational runbook.

Acceptance: All declared operations and request/response/error schemas covered; query measurements recorded rather than claimed; no dev handlers/seeds in prod; unresolved release inputs closed. Demo sign-off alone cannot close this item.

## PB-017 — Install and verify approved backend skills/agents

**P2 · TODO · 6 h.** Trace: Approved setup note. Dependencies: PB-001.

Implement the approved six-skill/six-specialist setup in the selected code repository; verify task contracts, ownership and test-first gates.

Acceptance: No frontend logic; no credentials in setup; invalid library/module/constructor choices caught; reviewer checks actual evidence. Setup is not counted as already installed and does not block manual core implementation.

## API ownership and demo boundary

Each OpenAPI operation has one delivery owner below. PB-012 extends the voucher branch of PB-006; it adds no route. PB-001/018/019/016/017 are enabling or verification work, not extra APIs. All 38 operations are mapped; the demo targets 18 operations and does not claim full UC-01/04/06 completion.

| Backlog owner | OpenAPI operation IDs | Demo target |
| --- | --- | --- |
| PB-002 | `logIn`, `registerMember` | Yes |
| PB-003 | `listCategories`, `listProducts`, `getProduct` | Yes |
| PB-004 | `getOwnCart`, `setCartLine`, `removeCartLine` | Yes |
| PB-005 | `listOwnCheckoutAddresses`, `createOwnCheckoutAddress` | Yes |
| PB-006 | `placeCodOrder` | Yes |
| PB-007 | `listOwnOrders`, `getOwnOrder` | Yes |
| PB-008 | `cancelUnpaidOrder` | Yes |
| PB-009 | `listOwnSellerOrders`, `markOwnOrderPaid` | Yes |
| PB-010 | `getOwnProduct`, `updateOwnStock` | Yes |
| PB-011 | `listOwnProducts`, `createOwnProduct`, `updateOwnProduct`, `addLinkedImage`, `uploadProductImage`, `removeOwnProductImage`, `getUploadedImage` | After demo |
| PB-013 | `listProductReviews`, `createProductReview`, `listOwnReviews`, `updateOwnReview`, `deleteOwnReview` | After demo |
| PB-014 | `createCategory`, `updateCategory`, `listSellersForPolicy`, `updateSellerStatus` | After demo |
| PB-015 | `listReviewsForModeration`, `moderateReview`, `getReport`, `listAuditEntries` | After demo |

## Scope controls and unresolved inputs

The [approved API inventory](../SolutionArchitecture/api-contract/http-api.md) is the release allowlist. General profile edits, notifications, payment corrections/reversals, extra onboarding/recovery APIs and product moderation have no current UC-backed endpoint. They are not hidden tasks in this backlog. Domain/module shells or old broad BA descriptions do not authorize implementing them.

PB-001 records the actual code repository, dependency matrix, database image digest, local keys/Origin allowlist and Guest TTL. PB-011 records approved LINK hosts/licenses. PB-012 defines missing voucher details; PB-013 defines initial review visibility. These inputs were not concrete values in the approved documents. Do not label unknown values approved or spend the first demo sprint adding their dependent features.

The **demo uses zero configured vouchers and no review/image feature claims**. An unknown voucher must still fail atomically; no silent discount bypass is allowed. Later features remain required for full-contract release. Full implementation requires all P1 acceptance criteria, not just the demo script.
