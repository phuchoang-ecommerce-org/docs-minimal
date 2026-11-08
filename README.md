# Minimal Marketplace Documentation

**Status: Approved.** The project owner approved the existing project documentation and setup plan on **2026-11-08**. Written in English. Approval accepts the documented design and defaults; it does not mean implementation, automated tests or deployment have completed. Missing configuration values and policies that were never defined remain explicit implementation inputs.

## Documentation map

| Group | What to read |
| --- | --- |
| [Business Analyst](./BusinessAnalyst/README.md) | Scope, roles, business rules, [use-case diagram](./BusinessAnalyst/use-cases.md), [activity diagrams](./BusinessAnalyst/activity-diagrams.md), [BPMN 2.0 process](./BusinessAnalyst/bpmn-process.md) and [user stories](./BusinessAnalyst/user-stories.md) |
| [Solution Architecture](./SolutionArchitecture/README.md) | System overview, backend, PostgreSQL, frontend monorepo, homepage, [sequence diagrams](./SolutionArchitecture/backend/sequences/README.md) and [OpenAPI 3.1 / ReDoc contract](./SolutionArchitecture/api-contract/index.md) |
| [Product Manager — backend](./ProductManager/README.md) | Ordered product backlog, two-week sprint plan and backend demo acceptance |
| [Automated Testing](./SolutionArchitecture/backend/4-automated-testing/4.%20Automated%20Testing.md) | Scenario templates, test-first gates and architecture checks |

## Normative conventions

- **Must** is required for the first implementation. **May** is optional. Decision IDs in [product scope](./BusinessAnalyst/product-scope.md) record accepted product choices.
- Four human roles only: Guest, Member, Seller and Marketplace Admin. Member login is required for purchase. COD and USD are the only payment method and currency.
- No shipping, return or refund workflow. Physical handoff and cash collection happen outside the application; Seller records receipt of COD cash for their own portion.
- PostgreSQL is the only persistent marketplace data system. Product images support LINK (approved remote URL fetched live; no stored bytes) and UPLOAD (bytes in PostgreSQL). Future dev product seed data uses LINK; this documentation task creates no seed records.
- Backend uses pragmatic Clean Architecture and DDD. Frontend uses Next.js and Ant Design in a pnpm monorepo. No Radix UI, Tailwind CSS, Zustand, TanStack Query, Framer Motion or Japanese Zen Ma design system.
- The [OpenAPI YAML](./SolutionArchitecture/api-contract/openapi.yaml) is the target machine-readable contract. Align implementation and generated clients with it before release. The [migration map](./SolutionArchitecture/system/migration-map.md) records the disposition of old capabilities and libraries.

## Approved implementation baseline

The ten [use cases](./BusinessAnalyst/use-cases.md), 38-operation [API inventory](./SolutionArchitecture/api-contract/http-api.md) and current backend decisions define implementation scope. Older broad capability lists do not authorize extra endpoints. The [backend delivery plan](./ProductManager/sprint-backlog.md) targets a demo on **2026-11-22** with one developer; planned tasks remain TODO until evidence is recorded. Frontend implementation is outside that backlog.

Existing documented defaults, including UUIDs, PostgreSQL 18, 900-second access JWTs, merge behavior, cursor/version contracts, image bounds and the described discount-allocation method, are approved. Undefined voucher rule details, initial review visibility, Guest-session TTL and deployment host/key/version values must be specified in their owning backlog items. Do not reopen approved decisions merely because an older source called them proposals.
