# Public Discovery and Scoped Queries

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-01 and supporting reads; BR-01/05/06. Operations: `listCategories`, `listProducts`, `getProduct`, `listOwnOrders`, `getOwnOrder`, `listOwnCheckoutAddresses`, `createOwnCheckoutAddress`.

## Public discovery

```mermaid
sequenceDiagram
  actor Caller
  participant Web as HTTP adapter
  participant Query as Discovery query input port
  participant Data as Exported query ports / JDBC projections
  participant DB as PostgreSQL marketplace
  Caller->>Web: GET /products or /products/{productId} or /categories
  Web->>Query: Validated filters, cursor and limit
  Query->>Query: Verify cursor MAC, resource and filter binding
  Query->>Data: Read bounded public projection
  Data->>DB: Published product + ACTIVE Seller predicates, parameterized FTS
  DB-->>Data: Variant IDs, USD prices, stock, visible rating summary, images
  Data-->>Query: Immutable projection / limit+1 rows
  alt Product detail missing or not visible
    Query-->>Web: RESOURCE_NOT_FOUND
    Web-->>Caller: 404
  else Result available
    Query->>Query: Emit items / last-returned-row cursor, no offset
    Query-->>Web: Projection
    Web-->>Caller: 200 product or cursor page
  end
```

Category lists do not require a product match. Product filters use inclusive USD bounds and `simple` PostgreSQL FTS with immutable ID order. Empty lists are 200 with `hasNext=false`, `nextCursor=null`. Invalid or changed-filter cursors return 400. Response composition uses exported read ports; Catalog does not import Reviews.

## Checkout address and order reads

`createOwnCheckoutAddress` authenticates MEMBER, maps allowed address fields, creates an Address under the trusted Member in one transaction, and returns 201 after commit. It accepts no owner ID. `listOwnCheckoutAddresses` reads only that Member's addresses. This is UC-04 support, not profile editing.

`listOwnOrders` and `getOwnOrder` use the same read-only path with a Member predicate. Detail returns current state and immutable snapshots, including all portions of the Member's order. Foreign/missing detail returns 404. Order cursors use `(created_at,id)`; address/category/product cursors use ID. No query calls a command repository or changes data. These reads supply addresses before checkout and cancellation/payment state after commands.
