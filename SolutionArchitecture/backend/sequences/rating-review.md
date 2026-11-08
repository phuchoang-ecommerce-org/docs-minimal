# Paid-Purchase Reviews and Moderation

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-01/08/10; BR-06/10. Operations: `listProductReviews`, `createProductReview`, `listOwnReviews`, `updateOwnReview`, `deleteOwnReview`, `listReviewsForModeration`, `moderateReview`.

## Create and read

```mermaid
sequenceDiagram
  actor Member
  participant Web as Review HTTP adapter
  participant Handler as CreateReview input port
  participant Ordering as Paid-purchase query API
  participant Data as Review JDBC repository
  participant DB as PostgreSQL marketplace
  Member->>Web: POST /products/{productId}/reviews + rating/text
  Web->>Handler: Trusted Member + validated rating 1-5
  Handler->>Ordering: Paid-purchase evidence for Member/product
  Ordering-->>Handler: Evidence from owned PAID Seller portion
  alt No eligible paid purchase
    Handler-->>Web: REVIEW_NOT_ELIGIBLE
    Web-->>Member: 409, no review write
  else Eligible, even if other portions are pending
    Handler->>Data: BEGIN, create Review using defined initial visibility
    Data->>DB: INSERT, partial uniqueness for active Member/product
    alt Active review already exists
      Data->>DB: ROLLBACK
      Handler-->>Web: REVIEW_ALREADY_EXISTS
      Web-->>Member: 409
    else Saved
      Data->>DB: COMMIT
      Handler-->>Web: Review after commit
      Web-->>Member: 201
    end
  end
```

PB-013 defines the missing initial-visibility value before its test-first gate; this diagram does not choose it silently. Missing public product is 404, invalid rating is 400; ineligible purchase is 409, not 403. Public review reads recheck product publication/Seller activity and filter visible, nonremoved reviews. Average/count cover all visible reviews, not one page. Own review reads include hidden active reviews; Admin reads include visible/hidden active reviews.

## Owner edits, removal and Admin moderation

```mermaid
sequenceDiagram
  actor Caller as Member or Admin
  participant Web as Review HTTP adapter
  participant Handler as Review command input port
  participant Data as Review / Audit JDBC ports
  participant DB as PostgreSQL marketplace
  Caller->>Web: Owner PATCH/DELETE or Admin moderation PATCH
  Web->>Handler: Trusted role/Actor + expectedVersion, reason for Admin
  Handler->>Data: BEGIN, active review lookup scoped to role/ownership
  alt Missing, removed or foreign owner target
    Data-->>Handler: No scoped review
    Handler->>Data: ROLLBACK
    Web-->>Caller: 404
  else Target permitted
    Handler->>Data: Compare version
    alt Stale version
      Handler->>Data: ROLLBACK
      Web-->>Caller: 409 STALE_VERSION
    else Current version
      alt Owner PATCH
        Handler->>Handler: Edit rating/text, preserve hidden status
      else Owner DELETE
        Handler->>Handler: Soft-remove, do not revive this record
      else Admin moderation
        Handler->>Handler: Set visibility with non-blank reason
        Handler->>Data: Append actor/target/reason audit
      end
      Handler->>Data: Save review + version and COMMIT atomically
      Handler-->>Web: Result after commit
      Web-->>Caller: PATCH 200 Review / DELETE 204
    end
  end
```

Subsequent public summary reads use committed visible records; no asynchronous rating projection is required. Removal frees the active uniqueness slot for eligible resubmission as a new record; repeated removal is 404. Failed moderation audit rolls back visibility/version. No notification trigger is implied.
