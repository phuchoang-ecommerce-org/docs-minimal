# Benchmark Scenarios and Gates

## Scenarios and proposed gates

These are starting targets to confirm on the actual deployment size, not claims inherited from the old system.

| ID | Workload | Load | Starting gate |
| --- | --- | --- | --- |
| B1 | Homepage/catalog and product detail | 30 VUs | API p95 < 400 ms, unexpected error < 1% |
| B2 | PostgreSQL keyword search + category/USD price filters | 20 VUs, common/rare terms | API p95 < 700 ms; inspect plans for selective queries |
| B3 | Guest/Member cart add/change/read | 20 VUs, isolated carts | Write p95 < 600 ms; correct totals |
| B4 | Authenticated mixed-Seller COD checkout | 10 VUs, unique keys/accounts | p95 < 1200 ms; no duplicate order or stock decrement |
| B5 | Hot SKU contention | 100 simultaneous attempts for 10 units | Exactly 10 orders; remaining attempts expected stock conflicts, no 5xx |
| B6 | Seller order list and Mark as paid | 20 Sellers scoped to own orders | List p95 < 700 ms; mutation < 900 ms; zero cross-Seller access |
| B7 | Admin report during B1–B4 mix | 5 report + 30 commerce VUs | Report p95 < 3 s; commerce p95 regression < 25% |
| B8 | Rating/review list and summary | 30 VUs, products with many reviews | p95 < 500 ms; correct visible average/count |
| B9 | 30-minute soak of B1–B4 and B8 | 30 VUs | No sustained memory, pool, lock-wait or error growth |
| B10 | Homepage with LINK normal/slow/failed images and UPLOAD PostgreSQL images | Desktop/mobile browser profiles | Product text/CTA remain usable; failure shows placeholder; record LCP, layout shift and database image response time |

Expected stock-conflict 409s in B5 are business outcomes and should be tracked separately from unexpected errors. B10 separates LINK source failures from UPLOAD/PostgreSQL failures. Use synthetic accounts and products.
