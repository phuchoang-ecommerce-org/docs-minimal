# Record Seller COD Cash Receipt

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-07; BR-05/08/09. Operations: `listOwnSellerOrders`, `markOwnOrderPaid`. CustomerOrder owns portion transitions; no independent SellerOrder write repository or payment module exists.

```mermaid
sequenceDiagram
  actor Seller
  participant Web as Seller order HTTP adapter
  participant Identity as Seller directory API
  participant Handler as RecordCodPayment input port
  participant Data as Ordering repository / Audit ports
  participant Root as CustomerOrder
  participant DB as PostgreSQL marketplace
  Seller->>Web: POST /seller/orders/{sellerOrderId}/mark-paid
  Web->>Identity: Resolve authenticated Account ID to SellerShop ID
  Identity-->>Web: Trusted SellerShop identity
  Web->>Handler: Portion ID + trusted Actor / SellerShop
  Handler->>Data: BEGIN, find owned portion and lock parent order
  Data->>DB: SELECT parent FOR UPDATE, reload portions
  alt Missing / foreign portion
    Data-->>Handler: No owned target
    Handler->>Data: ROLLBACK
    Handler-->>Web: RESOURCE_NOT_FOUND
    Web-->>Seller: 404
  else Owned portion
    Handler->>Root: recordCod(portion, SellerShop, time)
    alt Cancelled parent or already Paid portion
      Root-->>Handler: ILLEGAL_ORDER_STATE
      Handler->>Data: ROLLBACK
      Handler-->>Web: Conflict
      Web-->>Seller: 409
    else Pending portion of placed order
      Root->>Root: Mark portion Paid, derive all-portions payment status
      Handler->>Data: Persist portion paidAt and actor/time audit
      alt Audit / database failure
        Handler->>Data: ROLLBACK payment and audit
        Handler-->>Web: Safe failure
        Web-->>Seller: 500 / 503
      else Saved
        Handler->>Data: COMMIT
        Handler-->>Web: Owned SellerOrder only
        Web-->>Seller: 200 SellerOrder
      end
    end
  end
```

`listOwnSellerOrders` uses SellerShop ownership on every page and `(customer_order.created_at,seller_order.id)` cursor order. It never returns another Seller's lines or the Member's entire order. Aggregate payment is observable to the Member through `getOwnOrder`; mark-paid does not add an undeclared aggregate-status response field. Suspension blocks new sales/catalog writes, not recording cash for existing valid orders. Duplicate Paid is 409, not idempotent 200.
