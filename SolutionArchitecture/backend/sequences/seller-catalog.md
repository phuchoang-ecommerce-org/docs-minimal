# Seller Catalog and Stock Edits

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-06; BR-01/02/03/05. Operations: `listOwnProducts`, `createOwnProduct`, `getOwnProduct`, `updateOwnProduct`, `updateOwnStock`.

```mermaid
sequenceDiagram
  actor Seller
  participant Web as Seller HTTP adapter
  participant Command as Catalog / Inventory input port
  participant Identity as Seller directory API
  participant Data as Owning JDBC ports
  participant DB as PostgreSQL marketplace
  Seller->>Web: Create product or PATCH product / stock with expectedVersion
  Web->>Command: Trusted Account Actor + allowlisted DTO
  Command->>Identity: Resolve SellerShop ID from Account ID
  Identity-->>Command: SellerShop identity and availability
  Command->>Data: BEGIN, owner-filtered lookup for edits
  alt Missing / foreign product or variant
    Data-->>Command: Not found, ROLLBACK
    Command-->>Web: RESOURCE_NOT_FOUND
    Web-->>Seller: 404
  else Owned edit or new product
    Command->>Data: Hold current Seller eligibility through write
    Command->>Command: Require ACTIVE shop and valid fields
    Command->>Data: Check root expectedVersion for edits
    alt Stale version / SKU conflict
      Data-->>Command: ROLLBACK conflict
      Command-->>Web: STALE_VERSION / SKU_ALREADY_EXISTS
      Web-->>Seller: 409
    else Valid mutation
      Command->>Command: Invoke Product factory/method or StockItem.setOnHand
      Command->>Data: Save and increment owning version, COMMIT
      Command-->>Web: Result after commit
      Web-->>Seller: Create 201 / edit 200
    end
  end
```

Creation assigns IDs, requires at least one priced variant and initializes stock at zero. Product version guards publication, metadata, variant-price and image edits. Stock uses its own version, incremented also by checkout/cancellation. An absolute stale stock replacement is not automatically retried. Inactive Seller catalog writes return 403; unsafe/invalid input returns the operation's typed error.

Own list/detail reads use SellerShop ownership and include unpublished products and current versions, even while the shop is suspended. Public composition includes variants/stock without exposing foreign private records. PATCH omits unchanged fields; existing variant IDs must belong to the product, and omitted variants are retained. No catalog delete operation is added.
