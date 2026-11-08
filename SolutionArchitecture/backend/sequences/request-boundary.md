# HTTP, Security and Error Boundary

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

All operations use this boundary. Role/ownership rules and the exact error-code subset come from [OpenAPI](../../api-contract/openapi.yaml); the [error class diagram](../../api-contract/exceptional-errors.md) defines rendering.

```mermaid
sequenceDiagram
  actor Caller
  participant Security as Security filters
  participant Web as HTTP adapter / facade
  participant Handler as Input use-case port
  participant Data as Owning query / repository port
  participant Errors as Error mapper
  Caller->>Security: HTTP request + credentials + correlation context
  alt Invalid required JWT / Guest session
    Security->>Errors: Authentication failure
    Errors-->>Caller: 401 problem+json + Bearer challenge
  else Wrong role or disallowed cookie Origin
    Security->>Errors: Access failure
    Errors-->>Caller: 403 problem+json
  else Authorized or public request
    Security->>Web: Trusted Actor, request fields
    Web->>Web: Validate DTO, media type, cursor/version syntax
    Web->>Handler: MapStruct structural DTO + trusted Actor separately
    Handler->>Data: Owner-filtered lookup / visible projection
    alt Missing or foreign resource
      Data-->>Handler: No scoped result
      Handler->>Errors: RESOURCE_NOT_FOUND
      Errors-->>Caller: 404, no existence detail
    else Owned / public-visible resource
      Handler->>Handler: Invoke command transaction or read-only query
      alt Invalid input / stale state / dependency failure
        Handler->>Errors: Typed failure, after rollback if writing
        Errors-->>Caller: Applicable 400 / 409 / 413 / 415 / 503
      else Success
        Handler-->>Web: Immutable result, after command commit
        Web-->>Caller: Allowlisted response DTO
      end
    end
  end
```

Validation failures can occur before the handler. Unexpected exceptions produce safe 500 responses. Security entry-point/access-denied handlers share the renderer with controller advice. Product and address creation have no existing resource owner lookup, but validate referenced category/address ownership where applicable. Domain classes contain neither HTTP status nor JWT parsing. For public reads, no credential is required; a supplied invalid credential is never an alternative route into a private API.
