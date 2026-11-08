# 5. Backend Benchmark

Execution status: **NOT RUN**. This strategy starts after Sprint 2 passes its correctness gate; it does not add work to the 22 November 2026 demo critical path. The earliest planning slot is after the demo, from 23 November. No backend, benchmark runner or monitoring service is installed by this documentation task.

| Document | Output |
| --- | --- |
| [Strategy and staged adoption](./strategy.md) | Entry/exit gates, tool decisions, capacity and comparison rules |
| [Methods and instrumentation](./methods.md) | API/load/stress/database/profiling/JMH measurement procedures |
| [Scenario catalog](./scenarios.md) | Concrete Sprint 2 workloads, invariants and later-feature prerequisites |
| [Scenario and result templates](./templates.md) | Reproducible run manifest, results and optimization decisions |

“JHM” in the request is interpreted as **JMH**, Java Microbenchmark Harness. The [OpenJDK project](https://github.com/openjdk/jmh) supplies the harness; microbenchmarks are introduced only after profiling identifies a Java hotspot.

The [HTTP contract](../../api-contract/index.md), [sequence diagrams](../sequences/README.md) and [test-first gates](../4-automated-testing/4.%20Automated%20Testing.md) remain normative. Benchmarking cannot waive ownership, transaction, audit or idempotency requirements. Test the actual 18-operation Sprint 2 inventory, or the documented 12-operation fallback; do not benchmark unimplemented operations as successful zero-work responses.
