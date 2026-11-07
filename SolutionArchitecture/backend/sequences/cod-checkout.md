# COD Checkout Sequence

```mermaid
sequenceDiagram
  actor Member
  participant Web as Next.js
  participant API as Spring Boot API
  participant Order as Order service
  participant DB as PostgreSQL
  Member->>Web: Submit COD checkout + idempotency key
  Web->>API: POST /orders with JWT and key
  API->>API: Verify Member role
  API->>Order: Place order
  Order->>DB: BEGIN, check Member/key and canonical body first
  Order->>DB: For a new intent: validate owned address, cartVersion and active listings<br/>Recalculate USD totals/voucher
  Order->>DB: Conditional stock decrements in stable variant order
  alt invalid stock or voucher
    DB-->>Order: Conflict
    Order->>DB: ROLLBACK
    API-->>Web: 409 problem+json
  else valid
    Order->>DB: Insert customer order, Seller portions and line snapshots
    Order->>DB: Consume cart, increment cart version, insert audit, COMMIT
    API-->>Web: 201 order with Pending Payment portions
  end
  Web-->>Member: Show order
```

A repeated key with the same canonical body reconstructs the original creation response from immutable order snapshots before reading mutable cart/address/voucher state; a different payload returns 409. The diagram shows the new-intent branch. A new key with stale cartVersion also returns 409. An unauthenticated Guest cannot enter the transaction.
