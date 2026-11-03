# Testing and Benchmark

| Document | Purpose |
| --- | --- |
| [Testing strategy](./testing-strategy.md) | Layers, tools and CI gates |
| [Backend test examples](./backend-test-examples.md) | Spring Boot Test, JUnit, AssertJ and Mockito usage |
| [Testing scenarios](./testing-scenarios.md) | Required business and profile cases |
| [Benchmark method](./benchmark-method.md) | Tooling, dataset, repeatability and k6 template |
| [Benchmark scenarios](./benchmark-scenarios.md) | Workloads and proposed thresholds |

Tests trace to [business rules](../BusinessAnalyst/business-rules.md), [use cases](../BusinessAnalyst/use-cases.md) and the [OpenAPI contract](../SolutionArchitecture/api-contract/README.md). Benchmark gates are proposed until measured on target hardware. This folder specifies tests; it does not create product seed records or change the application code.
