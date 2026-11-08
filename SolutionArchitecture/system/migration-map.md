# Migration Map from the Existing Documentation

This is a documentation migration, not an instruction to edit the current backend/frontend repositories in this task. The old OpenAPI, role matrix, benchmarks and ADRs are historical inputs; they are not automatically normative here.

| Former area | New disposition |
| --- | --- |
| Guest/customer identity, catalog, cart, checkout, inventory, ordering, promotion | Keep core behavior; rewrite for four roles, seller ownership, COD-only checkout and USD |
| Review | Expand to one-to-five-star rating and written review for Members with a Paid purchase; Admin moderation |
| Staff catalog duties | Assign Seller-owned product/price/stock duties to Seller; shared category policy to Admin |
| Warehouse/support duties | Keep only necessary Seller/Admin actions; remove their distinct roles |
| Payment provider / bank transfer | Remove callbacks, capture, settlement and evidence; Seller marks own COD portion Paid |
| Shipping, carrier, returns, exchanges, refunds | Remove all business flows, data, UI, endpoints and tests; physical handoff is outside software |
| Email/SMS | Remove external channels and account flows requiring them; in-app notification may remain in PostgreSQL |
| Kafka, outbox, Redis, MongoDB, Elasticsearch | Remove; use in-process calls, PostgreSQL transactions, search, reporting and persistence |
| Product images | Two modes: LINK loads approved URL live and stores metadata only; UPLOAD stores bytes in PostgreSQL. Future dev product seed uses LINK; no seed created now |
| Old API/event schemas | Replace with reduced OpenAPI 3.1; remove provider, shipping, return and removed-role operations |
| Fourteen-module/CQRS infrastructure | Pragmatic Clean Architecture and DDD; small shared domain/core and direct in-process calls |
| Old frontend Radix/Tailwind/shadcn, Japanese Zen Ma and state/motion stack | Next.js + Ant Design in pnpm monorepo; no Zustand, TanStack Query or Framer Motion |
| Old QA/performance assumptions | Use the [approved test-first scenarios](../backend/4-automated-testing/4.%20Automated%20Testing.md); performance evidence belongs to the backend hardening backlog |
| Existing unrelated libraries | Keep if useful and compatible; remove only when unused or tied to an excluded system |

## Dependency audit before implementation

The current backend Gradle app includes Kafka and Redis starters and Kafka Testcontainers; these must leave a new implementation. PostgreSQL, Flyway, security/JWT, web MVC, validation and test libraries remain relevant. Spring Modulith, jMolecules, ArchUnit, MapStruct and Lombok may remain where useful, without old event/module rules. The current frontend's Next.js, React, TypeScript and Zod remain relevant; its Redis client, Radix UI, Tailwind and shadcn tooling leave the new target. Ant Design and pnpm are target additions. Image URL display has a narrowly approved external source dependency; UPLOAD uses PostgreSQL. No version change is prescribed here.

## Consistency checklist

- Exactly four human roles; no shipping, return, refund, non-COD payment or non-USD currency path.
- Every checkout, stock, COD status and review rule has a database transaction or ownership check as appropriate.
- Guest cannot purchase; Seller can mark only own Pending Payment portion Paid.
- LINK stores URL only; UPLOAD stores bytes only; development seed policy is documented, not implemented.
- Dev/prod profile behavior is enforced in both applications.
- Benchmarks and tests reference the reduced target API and actual PostgreSQL queries.
- [Homepage design](../frontend/homepage-design.md) shows USD prices, rating/review and login-before-purchase behavior.
