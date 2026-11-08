# Benchmark Scenario Catalog

All scenarios start as **NOT_RUN**. Operation IDs below refer to the [OpenAPI contract](../../api-contract/openapi.yaml). Run only operations present in the frozen Sprint 2 build; mark fallback omissions BLOCKED with their backlog dependency. Run functional ownership, rollback and race tests before performance measurements.

## Fixtures and workload isolation

Use deterministic synthetic data and record seed, migration revision and row counts. Start with two Sellers, distinct Seller Account/Shop IDs, two Members, owned addresses and a two-Seller cart for smoke assertions. For scaling, an initial experimental fixture is 1,000 Members, 100 Sellers, 10,000 products, 20,000 variants, 50,000 historical orders and 100,000 lines. These counts are test inputs, not production forecasts. Increase one cardinality at a time, up to 10x only when disk/memory limits permit; record visibility, order-state and popular-product distributions.

Assign each concurrent worker an exclusive Member/cart/address, except in named contention tests. Allocate enough identities for max VUs; do not wrap an exhausted identity pool. Generate unique checkout keys from run/worker/iteration. Pre-create pending orders for isolated payment/cancel tests and size stock for the full write workload plus warm-up. Validate fixture capacity before starting. Use a fresh disposable database per comparison repeat, then apply the same warm-up. Record order/audit growth at run end. Do not delete audit rows through application behavior to reset tests.

Long runs need a credential renewal schedule: log in again before the 900-second expiry, outside measured business steps, and report this traffic separately. A shared expired token invalidates the run. Guest cookies and cart versions remain worker-local. Fixture preparation and post-run database assertions are outside the latency sample; their time is recorded separately.

## Scenarios

| ID / phase / trace | Workload and operations | Evidence and required assertions |
| --- | --- | --- |
| BM-01 / B0, B2 / UC-01 | `listCategories`, `listProducts`, `getProduct`; separate unfiltered, category/filter, common/rare/no-result search; first and subsequent cursor pages at limits 20 and 100 | Per-operation p50/p95/p99, rows and response bytes. Published/active visibility, valid nextCursor, stable ordering and no duplicates on a fixed dataset. Never reuse a cursor across filters. |
| BM-02 / B0 / UC-03 | `logIn` with independent Members, then bounded separate `registerMember` if shipped; isolate password verification from business traffic | Login latency/CPU and failure counts; valid role/token and no secret output. Registration uses unique identities, records database growth and does not inflate login samples. |
| BM-03 / B0, B2 / UC-02/03 | `getOwnCart`, `setCartLine`, `removeCartLine`; Guest cart then `logIn` merge; separate normal edits and same-version conflicts | Fresh version per successful edit, exact `STALE_VERSION` on stale edit, no lost updates, once-only merge and no stock reservation. Cookie/Origin behavior must match the contract. |
| BM-04 / B0, B2 / UC-04 | `listOwnCheckoutAddresses`, optional shipped `createOwnCheckoutAddress`; two-Seller cart → `placeCodOrder` → `getOwnOrder`; separate `listOwnOrders` cursor reads | End-to-end journey and each request timing. Exactly one customer order, correct Seller portions/snapshots/totals, stock decrement, consumed cart and atomic audit. No voucher in the Sprint 2 success path. |
| BM-05 / B0, B2 / UC-04 | Same-key/same-body `placeCodOrder` replay, concurrent replay, then same key with changed body | Replay 201 retains original creation snapshot, including after order state changes; changed body 409. Count newly created orders separately from responses. No duplicate stock decrement or audit. |
| BM-06 / B2 / UC-04/06 | Many independent carts compete for one last unit; separate adequate-stock hot-variant run | One successful last-unit checkout, other contract-defined conflicts, no negative stock or partial order/key/audit. Report conflict rate and successful orders/s separately. Adequate-stock run measures lock pressure without fixture exhaustion. |
| BM-07 / B0, B2 / UC-05/07 | `cancelUnpaidOrder`, `listOwnSellerOrders`, `markOwnOrderPaid`; independent orders for normal throughput; separate cancel/payment and two-Seller payment races | Cancel restores stock once; repeat cancel 200 has no second restore/audit. Any Paid portion prevents cancel. Each Seller sees/updates only its portion; repeated Paid 409. No lost aggregate state; lock wait and commit latency recorded. |
| BM-08 / B0, B2 / UC-06 | `getOwnProduct`, `updateOwnStock`; normal owned replacement then version captured before checkout/cancel | Fresh version succeeds; stale stock update 409 cannot overwrite checkout decrement/cancel restore. Foreign Seller read/write is non-disclosing 404. Record pool versus SQL versus lock time. |
| BM-09 / B2 / UC-01/04/07 | Actual JDBC queries behind product search, own order cursor and Seller portion listing; small/scaled data; separate hot-order lock test | Saved SQL plan/parameters without private data, estimates versus actual rows, buffers/spills, pool acquisition, execution/commit and blocking chain. Recheck affected write cost after any new index. |
| BM-10 / B2 / UC-01–07 implemented slice | Fixed 70/20/10 discovery/cart-read/checkout-lifecycle iteration mix at R then 2R; isolate each Member and record requests per journey | Achieved versus offered iterations/s and requests/s, dropped iterations, per-route tails, successful orders/s, invariant report. Split checkout lifecycle fixtures evenly into cancel and COD payment branches; never cancel a successfully paid order in the normal mix. |
| BM-11 / B3 / same slice | BM-01 read stress/spike first, then BM-10 writes with enough stock; use bounded schedules in methods | Saturation knee, first limiting resource, exact stop trigger, in-flight outcome and five-minute recovery. No throughput success claim if assertions or generator checks fail. |
| BM-12 / B1/B4 / observed hotspot | Reproduce the specific failing BM scenario; correlate HTTP/JVM/pool/SQL, then bounded JFR sample | Time-aligned evidence and an explicit CPU/allocation/GC/lock/SQL hypothesis. Compare profiler-on/off overhead. A slow API alone does not justify JMH. |
| BM-13 / B4 / observed Java method | JMH for the isolated measured fingerprint, arithmetic or mapping operation; representative input sizes and concurrency | Functional equivalence, harness parameters, score/error, allocation and original API before/after. Keep only a change with repeated end-to-end benefit. |

Exact negative-path error codes and schemas come from OpenAPI and section 4 tests, not from a benchmark-specific reinterpretation. Expected contention is a separate result class; an unexpected 4xx/5xx on a normal path fails the scenario. Post-run assertions must reconcile successful command identities, persisted counts, stock deltas and audit effects for the entire run, not only sampled responses.

## BM-04 transaction journey

1. Select a worker-owned address and two purchasable variants from different Sellers. Read the current cart and set lines with the latest returned version.
2. Submit COD checkout with a new key and current cart version. Record request time and full journey time separately; never reuse a key for the next purchase.
3. Assert 201, both Seller portions and server-calculated totals. Read current order state and verify the cart was consumed.
4. For a replay run, resend the original body/key. For normal throughput, continue with a new cart/key. Read-only history iterations use a pre-seeded stable population.
5. For lifecycle load, either cancel an entirely unpaid order or have each owning Seller mark its portion paid. Record all HTTP calls in the workload mix.
6. After the measurement window, reconcile stock, order and audit effects using read-only assertions on the disposable database. Record failed/unfinished iterations, including any timed-out response whose transaction committed.

## Features added after Sprint 2

| Backlog prerequisite | Extend only after GREEN | Extra evidence |
| --- | --- | --- |
| PB-011 catalog/images | Catalog writes and upload/image-byte delivery | Fixed payload sizes, multipart/byte throughput, product version and PostgreSQL image-storage cost |
| PB-012 voucher rules | Voucher-success and quota contention branches of checkout | Exact rounding/allocation, quota rollback and hot-voucher serialization |
| PB-013 reviews | Eligible review create/update/read and summaries | Paid-portion eligibility, uniqueness, visibility and aggregate query cost |
| PB-014/015 governance/reports | Seller policy, moderation, bounded reports/audit queries | Ownership/role checks, audit effects, date-range/cardinality and exclusion behavior |

These additions require new manifest baselines. They do not expand the approved API inventory or delay the core Sprint 2 demo.
