# Admin Policy, Reports and Audit

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-09/10. Operations: `createCategory`, `updateCategory`, `listSellersForPolicy`, `updateSellerStatus`, `getReport`, `listAuditEntries`. Review moderation follows [review sequences](./rating-review.md).

```mermaid
sequenceDiagram
  actor Admin
  participant Web as Admin HTTP facade
  participant Handler as Owning Identity / Catalog command port
  participant Data as Owning repository + Audit port
  participant DB as PostgreSQL marketplace
  Admin->>Web: Category create/edit or Seller status edit, non-blank reason
  Web->>Handler: Trusted Admin, target, expectedVersion for edit
  Handler->>Data: BEGIN, find current target
  alt Missing target
    Handler->>Data: ROLLBACK
    Web-->>Admin: 404
  else Target exists or category creation
    Handler->>Data: Check current version for edit
    alt Stale edit
      Handler->>Data: ROLLBACK
      Web-->>Admin: 409 STALE_VERSION
    else Valid policy change
      Handler->>Handler: Invoke root policy with validated values
      Handler->>Data: Save policy + version and append actor/target/reason audit
      alt Save or audit failure
        Data->>DB: ROLLBACK both changes
        Handler-->>Web: Safe failure
        Web-->>Admin: 500 / 503
      else Both writes succeed
        Data->>DB: COMMIT
        Handler-->>Web: Result only after commit
        Web-->>Admin: Category create 201 / edit 200
      end
    end
  end
```

Seller status is ACTIVE or SUSPENDED. Suspension and checkout serialize through the same Seller eligibility row; already placed orders retain immutable snapshots and can complete COD. Lists supply target IDs/versions. Category selection uses `listCategories`; no additional Admin category-list endpoint is needed.

`getReport` and `listAuditEntries` pass Admin authorization, validate interval/cursor, invoke read-only JDBC projections and return 200. Report interval is UTC `[from,to)`, maximum 366 days. Metric definitions remain in OpenAPI. Audit is append/read only, cursor-scoped and never editable/deletable. Admin policy/report scope adds no payment correction, product moderation, notification or account-recovery endpoint.
