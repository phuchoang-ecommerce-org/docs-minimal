# Benchmark Strategy and Adoption Gates

One developer owns preparation, execution, analysis and changes. Start from the frozen Sprint 2 revision and its real PostgreSQL correctness evidence. Record which demo target actually shipped. Full-contract benchmarking waits for the remaining backlog items; approval of a design is not evidence that a feature exists.

## Phases

| Phase | Add only now | Work and entry condition | Exit / next decision |
| --- | --- | --- | --- |
| B0 — reproducible baseline | k6 CLI, existing PostgreSQL diagnostic SQL | Sprint 2 GREEN, disposable environment, fixed dataset and resource limits. Run API smoke and low-rate per-operation benchmarks. | Three repeatable runs with valid assertions, raw results and resource manifest. If adequate, retain this lightweight gate and stop adding tools. |
| B1 — explain server time | Spring Boot Actuator + Micrometer, local diagnostic metrics | B0 shows a regression, latency budget breach or unexplained variation. Reuse Actuator if already present; add no duplicate registry. | Correlate HTTP timing with JVM/GC, thread and JDBC-pool signals. Confirm a CPU, allocation, connection or SQL hypothesis before changing code. |
| B2 — expected load and SQL | Reuse k6; B1 meters if enabled; PostgreSQL plans/statistics | A stable baseline exists. Run sustained arrival-rate workloads, dataset scaling and targeted database scenarios. | Determine sustainable offered/achieved load, tail latency, pool/lock limits and database cost. A SQL issue goes to plan/index analysis; a Java issue goes to B4. |
| B3 — saturation and recovery | Prometheus, then Grafana only if history/comparison is needed | Repeated load tests need aligned time series, or short samples miss queue/GC/lock behavior. Configure Micrometer Prometheus registry and private scrape first; add Grafana for repeated analysis. | Stress/spike runs identify knee, failure boundary and recovery. Export dashboards/queries and raw evidence. A single explainable run does not justify a permanent monitoring stack. |
| B4 — isolate a proven hotspot | JDK 21 JFR profiling; JMH only for the isolated Java operation | Evidence points to CPU/allocation/lock cost. JFR may be used directly from B1/B2; it does not require Prometheus/Grafana. | A micro-level improvement must also improve the original end-to-end scenario without violating correctness or shifting cost elsewhere. |
| B5 — regression gate | Retain only useful tools | A fix has passed repeated before/after runs and functional tests. | Short deterministic smoke per relevant change; full load periodically/on performance-sensitive changes. Stress/profile runs remain controlled investigations. |

These phases are decision gates, not a requirement to install every tool. SQL diagnosis can precede B1; profiling can bypass B3. JMH is neither the first step nor a substitute for API/database measurements.

## Scope and isolation

Use a disposable benchmark database and synthetic identities. PostgreSQL remains the only persistent **marketplace** store. Prometheus, if introduced, stores operational time series in a separate, bounded observability environment; it never stores orders, image bytes, reviews or domain projections. This user-requested monitoring capability does not authorize Redis, Kafka, another business database or new public marketplace APIs.

Keep Actuator and scrape endpoints on a private management interface with explicit authentication/network controls; expose only needed endpoints. Do not expose env, heapdump or configuration endpoints publicly. No account/order/variant IDs, JWTs, raw search terms, URLs with IDs or correlation IDs as metric labels. Use bounded route templates, method, outcome and scenario class. Correlation IDs belong in sanitized logs/run evidence.

Do not run stress/spike or destructive fixture resets against production/shared data. Reset by recreating only the named disposable database. Audit remains append-only. Pin tool/library versions compatible with the actual Boot/JDK baseline during implementation; no floating latest versions in reproducible runs.

## Capacity after Sprint 2

Reserve an initial **6 focused hours for B0**: fixture/manifest 2 h, runner/assertions 2 h, three runs/analysis 2 h. This is a planning estimate, not measured velocity. Time-box B0 to BM-01 discovery, BM-04 checkout and BM-05 replay at low rate, with three 10-minute combined measurement runs after calibration/warm-up. Report per-operation samples separately. The remaining catalog is staged work, not a claim of full benchmark coverage within 6 h. If fixture/runner setup or sample volume exceeds this allowance, record partial evidence and re-estimate before expanding scope. B1/B2 investigation is an additional 4–8 h only when triggered; B3/B4 require a fresh estimate from the observed issue.

The existing Sprint 3 forecast already has 25 h of feature work plus 5 h reserve. Do not quietly add benchmark work to it or consume all defect reserve. At the Sprint 2 review, schedule B0 by deferring 6 h of lower-priority feature/setup work or extending the post-demo forecast. PB-016 owns benchmark evidence; baseline work is a slice of that item, not a second duplicate allocation. Its old 5 h hardening estimate must be re-estimated because it also includes non-performance release checks. Sprint 1/2 commitments stay unchanged.

## Baselines and decision criteria

Start with a calibration ladder of 1, 5 and 10 iterations/second, 2 minutes each, using a fixed read operation and a resettable transactional journey separately. These are experimental inputs, not expected production traffic. Pick R as the highest tested rate with stable achieved throughput, no dropped iterations and healthy headroom. Freeze R before comparison; do not redefine it downward to make a candidate pass.

Initial diagnostic budgets: read p95 <=300 ms, write p95 <=800 ms, p99 <=2 s, unexpected failure rate <1%, zero invariant failures and zero dropped iterations at R. These are planning hypotheses, not an approved production SLO or a measured claim. Owner and developer review them against baseline hardware, payloads and intended traffic before making them release gates. A threshold failure is an investigation result; it cannot be removed from the report.

Warm up for at least 2 minutes and until throughput/JIT/GC signals stabilize; measure 10 minutes for a baseline, excluding warm-up. Run at least three independent repeats on the same fixture/configuration. Report p50/p95/p99, sample count, run-to-run range, offered versus completed rate and failures per operation. Do not average percentiles across runs or routes. A low-sample p99 is inconclusive; lengthen the run. A >10% p95 increase against baseline triggers investigation only when it exceeds observed repeat variability; re-run if noise overlaps the effect.

A candidate passes only with all correctness assertions, agreed latency/error budgets and no load-generator bottleneck. Report insufficient data as INCONCLUSIVE, missing execution as NOT_RUN and setup failure as BLOCKED, never PASS.
