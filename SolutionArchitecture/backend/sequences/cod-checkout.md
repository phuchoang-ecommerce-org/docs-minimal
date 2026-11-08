# Atomic COD Checkout and Replay

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-04; BR-01–07. Operation: `placeCodOrder`. The handler owns one transaction across exported Identity, Cart, Catalog, Inventory, Promotion and Audit ports; each JDBC adapter joins it. There is no event broker or separate payment service.

```mermaid
sequenceDiagram
  actor Member
  participant Web as Order HTTP adapter / facade
  participant Handler as PlaceOrder input port
  participant Ports as Exported application / JDBC ports
  participant Root as OrderFactory / CustomerOrder
  participant DB as PostgreSQL marketplace
  Member->>Web: POST /orders + JWT + Idempotency-Key + cartVersion / addressId
  Web->>Handler: Validated COD request + trusted Member
  Handler->>Ports: BEGIN, find by Member/key
  Ports->>DB: Read saved request fingerprint and immutable snapshots
  alt Existing key and same canonical body
    Ports-->>Handler: Original creation facts
    Handler->>Handler: Reconstruct PLACED + pending portions + paidAt null
    Handler->>Ports: End transaction, no mutation
    Handler-->>Web: Original creation response
    Web-->>Member: 201 replay, before reading mutable cart/address/voucher
  else Existing key with different body
    Handler->>Ports: ROLLBACK, no mutation
    Handler-->>Web: IDEMPOTENCY_CONFLICT
    Web-->>Member: 409
  else New intent
    Handler->>Ports: Lock owned cart, compare cartVersion, read owned address
    Handler->>Ports: Hold Seller/Product/Variant eligibility and prices in stable order
    Handler->>Ports: Validate optional voucher and lock its usage limit
    Handler->>Ports: Conditional stock decrements in stable variant order + version bumps
    alt Missing owned input or business conflict
      Ports-->>Handler: Missing address / stale cart / stock / voucher failure
      Handler->>Ports: ROLLBACK all writes
      Handler-->>Web: Typed failure
      Web-->>Member: 404 or applicable 409, no partial order
    else Valid protected facts
      Ports-->>Handler: Locked prices, quantities, address and allocated discounts
      Handler->>Root: Construct immutable snapshots and grouped Seller portions
      Root-->>Handler: PLACED order, all portions PENDING_PAYMENT
      Handler->>Ports: Save order/key/fingerprint, portions, lines, redemption
      Handler->>Ports: Consume cart, increment version and append audit
      alt Late persistence or audit failure
        Handler->>Ports: ROLLBACK stock, cart, order, redemption and audit
        Handler-->>Web: Safe failure
        Web-->>Member: 500 or 503, never a successful order
      else All writes succeed
        Handler->>Ports: COMMIT
        Handler-->>Web: Immutable creation response after commit
        Web-->>Member: 201 Order
      end
    end
  end
```

The canonical body contains addressId, cartVersion, optional voucherCode and paymentMethod; server totals/timestamps are excluded. Key scope is Member, retained while the order exists. Concurrent same-key requests must converge on the committed winner before treating a changed/consumed cart as a new-intent failure. Serialize the Member/key intent or recheck the winning record after the cart-lock wait; a unique-key loser rolls back fully and reads the winner in a fresh transaction. Different intent always returns 409. The implementation must test the exact chosen synchronization against real PostgreSQL.

Unknown commit outcome returns 503; retry with the same key/body. A new key needs the current cart version. No decrement-only retry is allowed. Zero configured vouchers is valid for the demo: absent code is no discount, any unknown code returns `VOUCHER_INVALID` and rolls back. This is not proof of implemented valid-voucher promotion behavior.
