# Backend Delivery Plan

Design baseline: **Approved by the project owner on 2026-11-08**. Delivery capacity: **one backend developer**. Demo: **2026-11-22**, two weeks after the planning request, in Asia/Ho_Chi_Minh time. The plan assumes work starts Monday 2026-11-09; confirm any change at Sprint 1 kickoff.

| Document | Purpose |
| --- | --- |
| [Product Backlog](./product-backlog.md) | Ordered backend work, dependencies, acceptance and the 38-operation coverage map |
| [Sprint Backlog](./sprint-backlog.md) | Two one-week sprints, daily tasks, capacity, checkpoints and later forecasts |
| [Demo plan](./demo-plan.md) | Reproducible API demonstration, fixtures, acceptance evidence and reduced scope if needed |

The demo uses HTTP requests and PostgreSQL-backed evidence. Frontend pages, browser journeys and frontend skills are not work items. ReDoc documents the contract; it is not the backend or an API execution tool. Use an HTTP request collection or shell runner in the implementation repository for demonstration.

The owner has approved the existing design and skills/subagents plan. Newly planned work below is **TODO**, not already implemented. No code repository, team velocity or runtime evidence was inspected for this planning task. Repository selection and a compatible dependency matrix are PB-001 inputs. Approval does not create deployment secrets, choose values absent from the design or authorize new endpoints.

## Delivery gates

Every functional task includes the [mandatory test-first workflow](../SolutionArchitecture/backend/4-automated-testing/4.%20Automated%20Testing.md): filled scenario, test source, expected behavioral RED, implementation, GREEN and refactor. Tests, JDBC migration work and contract checks are inside each estimate. A compile/environment failure is not RED; an already-correct behavior uses regression evidence.

Done requires an implementation revision, UC/BR/scenario-to-test links, executed test reports, applicable architecture/security/profile checks and reproducible HTTP results. Domain/MVC mocks do not prove PostgreSQL concurrency or rollback. Shared build/module declarations are bootstrapped once; later features use exported interfaces and keep MapStruct at adapters and Lombok constructors handwritten.

One developer owns all execution. Specialist agents, if installed later, assist that developer; they do not count as extra capacity or remove review/testing time. Approval of the setup note does not imply the setup has been installed.
