# Backend Sprint Backlog

One developer. Time zone: Asia/Ho_Chi_Minh. Planning date: 2026-11-08. Demo: **Sunday 2026-11-22**. Two one-week sprints use **Monday 09/11–Friday 20/11**, with rehearsal and feature freeze on 20/11. The weekend is contingency availability to agree with the developer, not planned delivery capacity.

## Capacity and working rule

| Window | Productive capacity assumption | Planned tasks | Reserve |
| --- | ---: | ---: | ---: |
| Sprint 1: 09–13 Nov | 30 h | 25 h | 5 h |
| Sprint 2: 16–20 Nov | 30 h | 25 h | 5 h |
| Demo preparation total | 60 h | 50 h | 10 h |

All estimates include relevant tests and verification. A day has 5 h scheduled task effort plus 1 h reserve within 6 productive hours; remaining calendar time is not assumed available for extra features. Reserve covers defects, unknown integration and dependency setup. Do not spend it on P1 features before the demo gate passes. Re-estimate after two working days using actual completion evidence.

All tasks below are **TODO**, owned by the single backend developer. They are not in-progress or done because the design was approved. For every feature task, fill its scenario and observe valid behavioral RED before coding. Shared harness/type shells in S1-01 may precede RED; business behavior may not. Each task closes only with GREEN and the [common Done gate](./README.md#delivery-gates).

## Sprint 1 — Authenticate, discover and prepare a purchase

Goal: real PostgreSQL-backed registration/login, product discovery, Guest/Member cart and owned addresses. Checkout scenarios and tests are ready with valid RED before its Sprint 2 implementation. An executable order checkout is not claimed at the end of this sprint.

| Task | Backlog | Effort | Day | Concrete work and exit evidence |
| --- | --- | ---: | --- | --- |
| S1-01 | PB-001 | 4 h | Mon 09 | Select code root, inventory existing code, pin toolchain/dependencies, Compose/Flyway, 12 module declarations/type shells, test/security/error harness and deterministic dev fixtures. Clean/repeat startup, suite inventory and prod fixture guard pass. |
| S1-02a | PB-002 | 1 h | Mon 09 | Fill credential/role/JWT scenarios and write tests; record behavioral RED for missing login/registration behavior. |
| S1-02b | PB-002 | 4 h | Tue 10 | Implement registration, role-safe login, token validation and Problem mapping; GREEN for invalid token/role/no secret leaks. Login orchestration exposes Cart input port for S1-04 integration. |
| S1-03a | PB-003 | 1 h | Tue 10 | Write visibility, variant/price, filter/cursor tests and record RED. |
| S1-03b | PB-003 | 4 h | Wed 11 | Implement public category/product queries with seeded data; GREEN for inactive/unpublished exclusions and bounded cursors. |
| S1-04a | PB-004 | 1 h | Wed 11 | Define Guest TTL config, write cookie/origin/owner/version/merge scenarios and tests; record RED. |
| S1-04b | PB-004 | 5 h | Thu 12 | Implement cart commands and login merge through exported ports; verify concurrent once-only consumption, rejected lines and no reservations. |
| S1-05 | PB-005 | 2 h | Fri 13 | Scenario → tests → RED → owned address create/list → GREEN. No profile management. |
| S1-06 | PB-006 | 3 h | Fri 13 | Fill multi-Seller checkout/replay/rollback/last-unit scenarios; implement executable domain/application/PostgreSQL tests and minimal compile shells; record expected RED. No checkout business implementation yet. |

Sprint 1 acceptance: startup from an empty disposable DB; login with distinct Account/SellerShop fixtures; Guest builds cart and Member receives it once; products expose purchasable variant IDs; Member owns a valid checkout address. Checkout RED is documented and isolated from completed-feature regression checks; no disabled test or false-green report is used to hide it. This intermediate branch is not a release candidate.

## Sprint 2 — Place orders, cancel safely and record COD

Goal: a repeatable multi-Seller COD demo with rollback, replay, ownership and concurrency evidence. No gateway or independent payment module.

| Task | Backlog | Effort | Day | Concrete work and exit evidence |
| --- | --- | ---: | --- | --- |
| S2-01 | PB-006 | 5 h | Mon 16 | Implement against S1-06 RED: lock owned cart/eligibility, split Seller portions, snapshots, stock decrement, replay, cart consumption and audit in one transaction. GREEN on same-key/changed-key/late-failure tests; unknown voucher fails. |
| S2-02 | PB-007 | 2 h | Tue 17 | Scenario → tests → RED → current own order/history queries → GREEN; owner and snapshot checks included. |
| S2-03 | PB-008 | 3 h | Tue 17 | Write cancellation and cancel/payment race scenarios/tests before behavior; implement shared root lock and one-time stock restore. Repeat cancel 200, any Paid portion 409. |
| S2-04 | PB-009 | 4 h | Wed 18 | Tests first for owner/duplicate/cancelled/two-Seller/audit failure; implement portion list and mark-paid through CustomerOrder. Return only owned portion after commit. |
| S2-05a | PB-010 | 1 h | Wed 18 | Write owned product/stock/version scenarios and stale-after-checkout PostgreSQL test, record RED. |
| S2-05b | PB-010 | 2 h | Thu 19 | Implement owned product read and expectedVersion stock replacement; GREEN for no lost decrement and wrong Seller 404. |
| S2-06a | PB-018 | 3 h | Thu 19 | Run cross-flow real-DB suite, module/mapper/source checks and response-schema checks; fix regressions using failing tests. Collect repeatable race evidence. |
| S2-06b | PB-018 | 1 h | Fri 20 | Close remaining integrated test failures, check executed suite counts and prod profile guards. |
| S2-07 | PB-019 | 4 h | Fri 20 | Build API demo runner/collection and setup/reset guide; rehearse twice from fresh disposable state; record commit, results and omitted capabilities; freeze feature work. |

Sprint 2 acceptance: the [demo gate](./demo-plan.md#demo-acceptance-gate) passes with no manual database corrections. Mandatory failures block “ready for demo”; document exactly what works instead of weakening ownership, transaction, version or idempotency semantics.

## Checkpoints and replanning

| Checkpoint | Required evidence | Action if missed |
| --- | --- | --- |
| Tue 10 end | Environment stable; credential tests/implementation run; discovery RED ready | Spend reserve on bootstrap; inventory reusable existing code. Do not start P1 work or assume extra agent capacity. |
| Fri 13 end | Auth/cart/address flow GREEN; checkout tests have meaningful RED | Switch to the explicitly reduced demo target if needed. Preserve cart/checkout tests; use existing synthetic identities/addresses rather than adding more CRUD. |
| Mon 16 end | Real two-Seller checkout + replay/rollback GREEN | Stop optional history/registration/stock-management completion; concentrate on checkout and later payment/cancel safety. Flag the full target as at risk. |
| Thu 19 end | Cancel/payment and last-unit races pass | Reserve goes only to failing core behavior. If invariants still fail, demonstrate the last verified slice and disclose the missing flow. |
| Fri 20 end | Two successful fresh-state rehearsals, no secret/dev-in-prod leakage | Freeze known-good revision. Do not count unconfirmed weekend work as guaranteed recovery. |

The fallback is a **12-operation demo** listed in [Demo plan](./demo-plan.md#reduced-demo-target). Deferred tasks stay in the Product Backlog with their remaining effort; they are not deleted or marked Done. The first 18-operation target remains the working plan until a checkpoint shows it cannot fit.

## Post-demo forecasts

These are sequencing forecasts, not commitments validated by velocity. The feature allocations below predate the new benchmark scope and require re-planning before commitment. Re-estimate at the 20/11 review; unresolved policy input and unfinished P0 work take precedence. No frontend tasks enter these sprints.

| Forecast window | Task allocation | Planned hours | Capacity assumption |
| --- | --- | ---: | ---: |
| S3: 23–27 Nov | PB-011 complete catalog/images 10 h; PB-014 governance 5 h; PB-013 reviews 6 h; PB-012 policy/tests 4 h | 25 h | 30 h, 5 h reserve |
| S4: 30 Nov–04 Dec | PB-012 remaining voucher implementation 2 h; PB-015 moderation/report/audit 6 h; PB-016 former hardening allowance 5 h (re-estimate); PB-017 approved skills setup 6 h | 19 h | 30 h, 11 h reserve |

PB-013 starts only after initial visibility is defined; PB-012 behavior starts only after its rule/rounding/quota definitions and RED gate. Complete six-skill setup is deliberately outside the two-week critical path; existing documentation and manual gates remain enforceable meanwhile.

## Post-Sprint 2 benchmark allocation

PB-016 starts with [B0](../SolutionArchitecture/backend/5-benchmark/strategy.md) after the demo, earliest 23 Nov: fixture/manifest 2 h, k6 runner/assertions 2 h, repeated baseline/analysis 2 h. All three tasks are TODO and owned by the same developer. Exit evidence is three valid repeatable runs on the actual shipped slice with raw results and correctness assertions.

At the Sprint 2 review, move at least 6 h of lower-priority post-demo feature work out of the selected window or extend the forecast. Keep defect reserve; do not add these hours to the 25 h S3 feature allocation. Re-estimate PB-016 remaining release checks and replace its obsolete 5 h S4 allowance. B1/B2 need another 4–8 h only when evidence triggers them; estimate B3/B4 separately. Unfinished P0 correctness work takes precedence over all benchmark execution.

## Daily evidence record

For each task record: date, task/PB ID, remaining hours, scenario IDs, test-source revision, RED result/cause, implementation revision, GREEN command/report, blockers and next action. A design decision may be Approved while its implementation task remains TODO/IN_PROGRESS/BLOCKED. Use DONE only after its acceptance and common gate pass.
