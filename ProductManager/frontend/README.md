# Frontend Delivery Plan

Planning baseline: **2026-11-13**. Target demo: **Sunday 2026-11-22**; integration rehearsal and feature freeze: **Friday 2026-11-20**, Asia/Ho_Chi_Minh. All frontend work below is **TODO**. The documentation repository contains a target design, not an inspected implementation or measured team velocity.

| Document | Purpose |
| --- | --- |
| [Product backlog](./product-backlog.md) | Demo slice, operation ownership, dependencies and deferred web scope |
| [Sprint backlog](./sprint-backlog.md) | Two short catch-up sprints, daily capacity and backend handoffs |
| [Demo plan](./demo-plan.md) | Browser journey, API evidence, acceptance gate and fallback |

This forecast requires **one frontend developer separate from the backend developer**, with 6 focused hours on each weekday from 16–20 Nov. The [backend plan](../sprint-backlog.md) has allocated its only known developer to backend work and explicitly has no frontend team member. A frontend owner, code repository and runnable baseline have not been confirmed. Do not present the web demo as committed until those inputs and the first integration gate are verified. If no separate capacity is assigned, keep the approved [API demo](../demo-plan.md) as the 22 Nov target.

The web slice implements the backend's [12-operation reduced demo target](../demo-plan.md#reduced-demo-target). It uses the approved [OpenAPI contract](../../SolutionArchitecture/api-contract/openapi.yaml), [frontend design](../../SolutionArchitecture/frontend/frontend-design.md), [routing](../../SolutionArchitecture/frontend/navigation-routing.md) and [caching](../../SolutionArchitecture/frontend/caching.md). It does not change backend priorities or add endpoints. The full 18-operation backend demo may still run through its HTTP runner; a web screen is not required for every operation in that target.

The client has approved TanStack Query v5 for interactive server-response caching. Use the [caching design](../../SolutionArchitecture/frontend/caching.md) for its scope and invalidation rules. This approval does not change the operation or demo boundary in this plan.
