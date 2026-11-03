# Backend Design

## Backend: pragmatic Clean Architecture and DDD

Keep one deployable Spring Boot application. Domain rules live in entities/value objects and focused domain services; application services coordinate transactions and permissions; HTTP controllers validate/translate requests; PostgreSQL adapters implement persistence. A simple feature may have fewer layers when extra indirection would add no useful boundary. Business invariants must not reside only in controllers or the frontend.

Recommended packages, not mandatory Gradle subprojects:

```text
backend/
  app/src/main/java/.../
    identity/        # account, JWT login, seller status
    catalog/         # shop, category, product, variant, media
    inventory/       # stock and atomic checkout decrement
    cart/            # guest/member cart
    ordering/        # order, seller order, checkout, unpaid cancellation
    payment/         # seller-confirmed COD status
    promotion/       # voucher
    review/          # rating and review after paid purchase
    administration/  # admin orchestration and reports
    shared/
      domain/        # Money, IDs, domain error types, clock abstraction
      core/          # transaction, auth context, pagination, audit helpers
    api/             # REST configuration and error translation
  app/src/main/resources/db/migration/
  app/src/test/java/
  app/src/integrationTest/java/
```

A shared type enters `shared/domain` only if two features truly use the same semantics. `shared/core` holds technical cross-cutting helpers, not a catch-all for business logic. Prefer direct in-process application calls between related features over events or unnecessary ports. Keep ports only for replaceable boundaries such as persistence or time. A seller order is the unit of seller ownership and COD payment status; the customer order coordinates its USD total and derives Paid status from all seller portions.

PostgreSQL transactions protect checkout stock decrement, unpaid cancellation stock restoration, seller COD state and audit together. Use conditional updates or row locks for stock, unique constraints for idempotency and optimistic versioning where useful. No distributed transaction, outbox, external event contract or asynchronous projection is needed. Use Flyway for schema changes. Retain Spring Security, validation, JDBC/JPA as already useful, Spring Modulith/jMolecules/ArchUnit if their small set of checks helps; do not require one module per domain.
