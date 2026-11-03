# Benchmark Method

## Method and tools

Benchmark the new PostgreSQL-backed API, both LINK/live and UPLOAD/PostgreSQL image rendering, and the Next.js/Ant Design UI. Use k6 for HTTP workloads, Spring Boot Actuator/Micrometer for server time and JVM/pool metrics, PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` and `pg_stat_statements` when available for query diagnosis, and Lighthouse/Playwright traces for page rendering. Record tool versions, host/container resources, commit, profile, dataset and raw results. LINK hosts are a separate, variable network dependency: measure normal and blocked/slow LINK sources. Measure UPLOAD image serving from PostgreSQL separately; do not mix remote latency into database API thresholds.

Use an isolated production-profile build and benchmark PostgreSQL. Seed 20 Sellers, 10,000 published variants, 2,000 Members, 20,000 orders and visible/hidden reviews. No destructive benchmark against production. Warm up 2 minutes, measure baseline workloads 5 minutes, repeat three times and compare medians. Report p50/p95/p99, throughput, unexpected errors, CPU, memory, DB pool, query time and lock waits. Reset mutable data between scenarios.

## k6 smoke template

Use the future OpenAPI paths and deterministic fixture IDs. Add authenticated scenarios as separate scripts after endpoints exist.

```javascript
import http from 'k6/http';
import { check } from 'k6';

const base = __ENV.API_BASE_URL || 'http://127.0.0.1:8080';
export const options = {
  scenarios: { catalog: { executor: 'constant-vus', vus: 20, duration: '5m' } },
  thresholds: {
    'http_req_duration{scenario:catalog}': ['p(95)<400'],
    'http_req_failed{scenario:catalog}': ['rate<0.01'],
  },
};
export default function () {
  const id = 1 + (__VU % 1000);
  const response = http.get(`${base}/products/${id}`);
  check(response, { 'product returned': r => r.status === 200 });
}
```

Seed isolated DB → start API and a production Next.js build → run `k6 run bench/catalog.js` → save k6 summary/server timers/SQL plans → reset DB. Compare client and server time before diagnosing latency. A short smoke run cannot establish peak capacity or monthly availability; B5 checks contention correctness, B9 checks slow resource growth. Publish results with hardware and observed values.
