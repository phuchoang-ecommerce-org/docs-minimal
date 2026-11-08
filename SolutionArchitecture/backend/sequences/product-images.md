# Product Image Write and Read Sequences

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-01/06; BR-01/05/11. Operations: `addLinkedImage`, `uploadProductImage`, `removeOwnProductImage`, `getUploadedImage`. Exact limits and primary-image rules are in the [image contract](../../api-contract/product-images.md).

## Owned writes

```mermaid
sequenceDiagram
  actor Seller
  participant Web as Image HTTP adapter
  participant Command as Catalog image input port
  participant Policy as Image validation policy
  participant Data as Catalog JDBC adapter
  participant DB as PostgreSQL marketplace
  Seller->>Web: LINK JSON or UPLOAD multipart + expectedVersion
  Web->>Web: Verify Seller, media/byte bounds and DTO fields
  Web->>Command: Trusted SellerShop + validated input
  Command->>Data: Owner-filtered product lookup
  alt Missing or foreign product
    Data-->>Command: No scoped row
    Command-->>Web: RESOURCE_NOT_FOUND
    Web-->>Seller: 404
  else Owned product
    alt LINK
      Command->>Policy: Check HTTPS, approved public host and provenance
      Policy-->>Command: URL source, no downloaded bytes
    else UPLOAD
      Command->>Policy: Decode signature/MIME, dimensions and pixel count
      Policy-->>Command: Validated bytes and metadata, no remote URL
    end
    Command->>Data: BEGIN, recheck active shop, ownership and product version
    alt Version/count conflict or validation failure
      Data-->>Command: ROLLBACK, no image or primary change
      Command-->>Web: Applicable 400 / 403 / 409 / 413 / 415
      Web-->>Seller: problem+json
    else Valid source and bounds
      Command->>Data: Save one source branch, maintain one primary, bump product version
      Data->>DB: COMMIT
      Command-->>Web: ProductImage with productVersion
      Web-->>Seller: 201
    end
  end
```

Parser/type/size validation can reject before opening a transaction. `removeOwnProductImage` checks product/image membership and expected product version in one transaction, removes only the owned image, selects the next primary if needed, increments product version and returns 204. No remote deletion or storage service call occurs. Reload the owned product for its new version.

## Public display

```mermaid
sequenceDiagram
  actor Consumer as API consumer
  participant API as Public product / image query
  participant Data as Catalog JDBC projection
  participant DB as PostgreSQL marketplace
  participant Host as Approved LINK host
  Consumer->>API: GET /products/{productId}
  API->>Data: Read published product of ACTIVE Seller
  Data->>DB: SELECT visible product and image metadata
  API-->>Consumer: ProductImage LINK or UPLOAD branch
  alt LINK
    Consumer->>Host: Fetch approved URL directly
    Note over API,Host: Backend never fetches or proxies the URL
  else UPLOAD
    Consumer->>API: GET /products/{productId}/images/{imageId}/content
    API->>Data: Check image/product membership and current public visibility
    alt Not visible, mismatched ID or LINK image
      Data-->>API: Not found
      API-->>Consumer: 404 problem+json
    else Valid UPLOAD
      Data->>DB: Read BYTEA and validated MIME
      Data-->>API: Bytes
      API-->>Consumer: 200 image bytes, nosniff, Cache-Control no-store
    end
  end
```

Consumer placeholder behavior remains outside backend implementation. A display failure does not change product eligibility or stock. Approved host configuration is an explicit deployment input, not an arbitrary-URL download permission.
