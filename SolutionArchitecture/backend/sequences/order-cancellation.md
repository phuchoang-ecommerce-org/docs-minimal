# Unpaid Order Cancellation

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-05; BR-03/06/09. Operation: `cancelUnpaidOrder`. The customer-order row is the same lock used by [mark-paid](./seller-payment.md).

```mermaid
sequenceDiagram
  actor Member
  participant Web as Order HTTP adapter
  participant Handler as CancelOrder input port
  participant Data as Ordering and Inventory / Audit ports
  participant Root as CustomerOrder
  participant DB as PostgreSQL marketplace
  Member->>Web: POST /orders/{orderId}/cancellation
  Web->>Handler: Trusted Member + order ID
  Handler->>Data: BEGIN, owner-filtered order lookup + root row lock
  Data->>DB: SELECT owned order FOR UPDATE, reload portions
  alt Missing or foreign order
    Data-->>Handler: No scoped root
    Handler->>Data: ROLLBACK
    Handler-->>Web: RESOURCE_NOT_FOUND
    Web-->>Member: 404
  else Already cancelled
    Data-->>Handler: Current cancelled order
    Handler->>Data: End transaction, no restoration or audit append
    Handler-->>Web: Current order
    Web-->>Member: 200, unchanged
  else Placed order
    Handler->>Root: cancel() only when every portion is pending
    alt Any portion Paid
      Root-->>Handler: ILLEGAL_ORDER_STATE
      Handler->>Data: ROLLBACK
      Handler-->>Web: ILLEGAL_ORDER_STATE
      Web-->>Member: 409
    else All portions pending
      Root-->>Handler: Cancelled root and restoration quantities
      Handler->>Data: Restore stock once in variant order + stock version bumps
      Handler->>Data: Save CANCELLED root, append audit, COMMIT
      Handler-->>Web: Cancelled order after commit
      Web-->>Member: 200
    end
  end
```

Seller portion `status` is derived from the parent order; its stored payment status remains PENDING_PAYMENT on cancellation. Audit/stock/save failure rolls everything back. If payment wins the shared lock, cancellation fails; if cancellation wins, payment fails. Voucher quota restoration is not defined and is tracked in PB-012 before enabling configured vouchers. No refund/reverse-payment path exists.
