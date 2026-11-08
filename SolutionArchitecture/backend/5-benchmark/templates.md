# Benchmark Run and Decision Templates

Store executed evidence in the backend implementation repository under `benchmark/results/<run-id>/`, with scripts under `benchmark/`. This documentation repository holds the plan. Never commit tokens, real customer data or recordings containing secrets. Keep a sanitized report and artifact checksums; store large raw/JFR files in access-controlled storage. Record retention/expiry per run and preserve before/after evidence through the release review.

## Run manifest

Copy this template and fill every applicable field before execution. Null means unrecorded, not zero. B0 does not require fields for tools that have not been introduced; mark those `not_enabled` with a reason.

```yaml
run_id: null
status: NOT_RUN # PASS | FAIL | INCONCLUSIVE | BLOCKED after execution
owner: null
scenario_ids: []
phase: B0
started_at_utc: null
implementation_revision: null
script_revision: null
contract_revision: null
correctness_report: null
shipped_operation_ids: []
omitted_operations_and_dependencies: []
versions: {jdk: null, spring_boot: null, postgres: null, k6: null}
optional_tools_and_versions: {}
environment:
  os_arch: null
  cpu_model_and_quota: null
  app_memory_limit_and_jvm_flags: null
  db_cpu_memory_disk_limits: null
  generator_host_and_limits: null
  topology_network_tls: null
  background_work: null
  pool_size_timeouts: null
  management_security: null
fixture:
  seed_and_revision: null
  row_counts_before_after: null
  distributions_and_stock_budget: null
  migration_revision: null
  indexes_statistics: null
  reset_command_and_target_guard: null
  cache_state_and_warmup: null
workload:
  executor: null
  operation_payloads_and_mix: null
  rate_unit: iterations_per_second
  calibration_and_frozen_R: null
  stages_duration_rates: []
  warmup_excluded_seconds: null
  measurement_seconds: null
  preallocated_max_vus: null
  credential_renewal_and_identity_pool: null
  repetitions: 3
measurement:
  latency_and_error_budgets: null
  budget_status: hypothesis # Record owner/date if agreed as a release gate.
  stop_limits_and_operator: null
  sample_count_requirement: null
  post_run_invariant_queries: null
  instrumentation_and_sampling: null
  baseline_run_ids: []
artifacts:
  raw_k6_and_summary: null
  server_metrics_plans_logs_jfr: null
  correctness_and_invariant_report: null
  checksums_and_retention: null
```

## Result record

| Field | Record after execution |
| --- | --- |
| Validity | Status, setup deviations, generator headroom, token/fixture exhaustion, dropped iterations and instrumentation overhead |
| Latency per operation per repeat | Sample count, p50/p95/p99/max, successful versus expected-conflict versus unexpected-failure samples; timeouts retained |
| Throughput | Offered/started/completed iterations/s, request count/RPS and committed successful orders/s; full journey duration separate from request latency |
| Errors | Exact status/Problem code counts, transport/timeouts, expected conflicts and failed assertions |
| Resources | App/DB/generator CPU and memory; JVM GC/heap, pool wait/active/pending, SQL/lock/commit data when instrumented |
| Correctness | Order/stock/cart/audit reconciliation, replay outcomes and in-flight committed effects; link evidence |
| Capacity/recovery | First breached budget/resource, stop timestamp, saturation knee and time to baseline; NOT_RUN for unexecuted overload scenarios |
| Repeatability | All repeat IDs, run-to-run range, sample adequacy and first/warm-cache differences |
| Decision | Adequate baseline, investigate, optimize or reject comparison; supporting evidence and next phase/tool trigger |

## Optimization comparison

Record the hypothesis, source scenario, one changed variable and expected signal before editing. Use the same hardware, fixture, R, workload, budget and tool settings for at least three baseline and three candidate runs. Alternate baseline/candidate order where possible to reduce host drift. If required instrumentation changes, establish a new instrumented control before attributing an effect to the code change.

| Scenario / operation | Baseline run IDs and p95 range | Candidate run IDs and p95 range | Throughput/error/allocation/DB effect | Correctness | Decision |
| --- | --- | --- | --- | --- | --- |
| Fill from executed evidence | Unmeasured | Unmeasured | Unmeasured | NOT_RUN | No optimization accepted |

Keep a change only when its benefit exceeds repeat variability, all agreed budgets and invariants pass, and it does not transfer unacceptable cost to another route or database writes. Otherwise revert or record INCONCLUSIVE with the next measurement. Owner sign-off records the accepted performance budget separately from feature design approval.
