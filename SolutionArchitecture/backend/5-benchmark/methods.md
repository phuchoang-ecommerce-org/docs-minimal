# Benchmark Methods and Tool Use

## API Benchmark — k6 first

Measure each operation with a known payload and valid prerequisites at low concurrency before mixing workflows. Separate authentication cost from business API cost: provision accounts/tokens outside measured business requests, and benchmark login separately. Refresh credentials between bounded runs when needed; the approved 900-second JWT lifetime must not turn a long load test into an accidental expired-token test. Report setup/token refresh separately.

Use stable route names and scenario tags. Apply per-operation latency thresholds and custom failure counters. k6 checks alone do not define a failing performance gate: add thresholds for checks/business invariants and unexpected outcomes. Treat expected 409 contention as its own scenario/result, not success for the normal checkout throughput metric. Do not globally whitelist all 4xx; assert exact expected status/code and persisted effects.

The [k6 documentation](https://grafana.com/docs/k6/latest/) describes executors, checks and thresholds. Pin a local CLI version; cloud execution is not required. Save summary and raw results with the run manifest; avoid logging tokens or large response bodies.

## Load Testing — controlled offered load

Use [arrival-rate executors](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/arrival-rate-vu-allocation/) for an offered workload independent of response speed. Record dropped iterations, preallocated/max VUs and generator CPU/memory/network; insufficient VUs or a saturated generator invalidates a server-capacity conclusion. A closed VU journey is useful for session behavior, but its offered rate falls when responses slow; report that distinction.

Start with 70% public discovery journeys, 20% cart/read journeys and 10% checkout/lifecycle journeys. Percentages refer to **iterations**, not HTTP requests; record actual endpoint request counts. This mix is a hypothesis until traffic exists. Run R for 15 minutes, then 2R for 15 minutes only if the first plateau is healthy; allow 5 minutes recovery. Shared hot-product traffic and owner-isolated normal traffic are separate runs.

## Stress and Spike Testing — bounded experiments

Stress: 0.5R, R, 1.5R and 2R for 5 minutes each, then increments of 0.5R only while stop limits permit, capped initially at 3R. The measured saturation knee, not the configured peak, defines the result. Return to 0.5R for 5 minutes and verify recovery and persisted invariants.

Spike: R for 5 minutes, 3R for 30 seconds, R for 5 minutes; repeat once only after recovery. Begin with a read spike, then an isolated write spike with sufficient fixture stock. An exhausted fixture is not a capacity limit.

Stop new load immediately on any invariant violation, database disk free <20%, application/container memory >90% of its limit for 60 seconds, unexpected errors >5% for 60 seconds, or p99 >5 seconds for 60 seconds. These are conservative laboratory stop defaults; log exact trigger and in-flight request completion. Do not kill database processes to simulate ordinary overload. Observe recovery: baseline latency/throughput and pool wait return within 5 minutes, no leaked connections, continuing heap growth or stranded transactions. If not, classify recovery as failed and investigate before repeating.

## Database Benchmark — PostgreSQL before new infrastructure

Use production-shaped JDBC queries and the current single-schema migration, with real cardinalities, skew, indexes and current statistics. Capture `EXPLAIN (ANALYZE, BUFFERS)` for owned order cursor pages, product search/filter and Seller portion joins. Record actual/estimated rows, scan type, buffers, sorts/spills and total execution time. A sequential scan on a tiny fixture is not automatically a defect.

ANALYZE executes the statement. Run mutating plans only on the disposable database in a rollback-controlled experiment; sequence advances and external side effects are not universally undone by rollback. Measure real transaction completion separately. Never issue diagnostic writes against shared data.

Measure connection acquisition separately from query execution and commit time. Inspect `pg_stat_activity`, `pg_locks` and blocked transaction chains during contention. Add `pg_stat_statements` only when aggregate SQL evidence is needed; document extension/preload/restart requirements and compare interval deltas rather than unrelated lifetime totals. No new database service or exporter is necessary initially.

Compare small versus scaled datasets and first-run versus warm-cache plans separately; do not flush OS caches on a shared host. Change one index/query/pool setting at a time, then rerun API load. A faster query can still make writes slower through index maintenance. PostgreSQL documents [EXPLAIN behavior](https://www.postgresql.org/docs/current/using-explain.html).

## Profiling and observability — add evidence, not dashboards first

Actuator provides integration with Micrometer; use local diagnostic meters first. Inspect HTTP request duration/count, JVM heap/GC, process CPU, live threads and JDBC pool active/idle/pending/timeout signals. Verify actual meter names/tags against the pinned Boot release. Add bounded custom timers for checkout total, connection wait and lock-sensitive command sections only when existing meters cannot answer the question. [Spring Boot metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html).

When time-series history is needed, add the Prometheus registry and private scrape endpoint; use an initial 15-second scrape interval, a bounded 24-hour local retention and fixed storage limits with disk headroom for the WAL and compaction; see [Prometheus storage](https://prometheus.io/docs/prometheus/latest/storage/). Add Grafana only for repeated correlation: offered/completed RPS, per-route p95/p99, errors, GC/heap, CPU and pool pressure on one time axis. Configure duration histograms/buckets before deriving quantiles; do not average precomputed quantiles. A 15-second scrape can miss short peaks, so retain k6 time series and bounded JFR recordings. [Management endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html).

Capture a 60–120 second [Java Flight Recorder](https://docs.oracle.com/en/java/javase/21/jfapi/) sample during a reproduced steady plateau or spike window. Inspect CPU samples, allocation, GC pauses, monitor contention and thread states. Compare an unprofiled run to assess instrumentation overhead. JVM blocked threads alone do not prove a PostgreSQL lock; correlate database waits. Profiling supplements metrics and does not require another tracing backend. Do not introduce OpenTelemetry collectors, Loki or Tempo as hidden dependencies.

## Microbenchmark — JMH only after a Java hotspot is found

Candidates are pure USD arithmetic/discount allocation, checkout fingerprint canonicalization or a measured DTO conversion bottleneck. Do not use JMH to represent JDBC, login HTTP latency or complete checkout. Verify functional equivalence first; optimization must retain the section 4 test-first gates.

Use a separate benchmark module/source set outside the production artifact. Initial harness settings: 3 forks, 5 warm-up iterations of 1 second, 10 measurement iterations of 1 second; increase duration if convergence/variance requires it. Parameterize 1/10/100-line inputs and realistic text lengths; explicitly choose per-thread versus shared state. Return the result or consume it with Blackhole to avoid dead-code elimination, avoid constant-only inputs, and keep fixture construction out of timing unless creation is what is being measured. Report ns/op or ops/s with score error, allocation bytes/op and GC observations, JDK/JVM flags and hardware.

A shared-state contention benchmark must identify the sharing pattern; do not infer multithread safety from a thread-local benchmark. A JMH win is only a candidate: reproduce the original API scenario and reject it if p95, allocations, database cost or correctness regresses. See [JMH source and samples](https://github.com/openjdk/jmh).
