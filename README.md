# Minimal Marketplace Documentation

**Status:** proposed target specification, written in English. It restructures the former `docs/` material for a smaller marketplace. It does not claim the current backend/frontend already implements this target.

## Documentation map

| Group | What to read |
| --- | --- |
| [Business Analyst](./BusinessAnalyst/README.md) | Scope, roles, business rules, [use-case diagram](./BusinessAnalyst/use-cases.md), [activity diagrams](./BusinessAnalyst/activity-diagrams.md), [BPMN 2.0 process](./BusinessAnalyst/bpmn-process.md) and [user stories](./BusinessAnalyst/user-stories.md) |
| [Solution Architecture](./SolutionArchitecture/README.md) | System overview, backend, PostgreSQL, frontend monorepo, homepage, [sequence diagrams](./SolutionArchitecture/sequences/README.md) and [OpenAPI 3.1 / Swagger contract](./SolutionArchitecture/api-contract/README.md) |
| [Testing & Benchmark](./TestingBenchmark/README.md) | Test strategy/examples/scenarios and benchmark method/scenarios |

## Normative conventions

- **Must** is required for the first implementation. **May** is optional. Decision IDs in [product scope](./BusinessAnalyst/product-scope.md) record accepted product choices.
- Four human roles only: Guest, Member, Seller and Marketplace Admin. Member login is required for purchase. COD and USD are the only payment method and currency.
- No shipping, return or refund workflow. Physical handoff and cash collection happen outside the application; Seller records receipt of COD cash for their own portion.
- PostgreSQL is the only persistent marketplace data system. Product images support LINK (approved remote URL fetched live; no stored bytes) and UPLOAD (bytes in PostgreSQL). Future dev product seed data uses LINK; this documentation task creates no seed records.
- Backend uses pragmatic Clean Architecture and DDD. Frontend uses Next.js and Ant Design in a pnpm monorepo. No Radix UI, Tailwind CSS, Zustand, TanStack Query, Framer Motion or Japanese Zen Ma design system.
- The [OpenAPI YAML](./SolutionArchitecture/api-contract/openapi.yaml) is the target machine-readable contract. Align implementation and generated clients with it before release. The [migration map](./SolutionArchitecture/system/migration-map.md) records the disposition of old capabilities and libraries.
