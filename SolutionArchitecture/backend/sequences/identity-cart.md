# Identity, Guest Merge and Cart

Approved design baseline: 2026-11-08. Implementation and test execution are tracked separately in the [backend backlog](../../../ProductManager/product-backlog.md).

UC-02/03; BR-05/06. Operations: `registerMember`, `logIn`, `getOwnCart`, `setCartLine`, `removeCartLine`. Cart commands never reserve stock.

## Registration and credential login

```mermaid
sequenceDiagram
  actor Guest
  participant Web as HTTP adapter
  participant Identity as Identity input port
  participant Data as Identity JDBC adapter
  participant DB as PostgreSQL marketplace
  Guest->>Web: POST /accounts with login, password, displayName
  Web->>Identity: Validated registration, no role field
  Identity->>Identity: Hash password, create MEMBER through factory
  Identity->>Data: Create account in transaction
  Data->>DB: INSERT with normalized-login uniqueness
  alt Login already exists
    DB-->>Data: Known uniqueness conflict
    Data-->>Identity: Rollback
    Identity-->>Web: LOGIN_ALREADY_EXISTS
    Web-->>Guest: 409 problem+json
  else Created
    Data->>DB: COMMIT
    Identity-->>Web: Public Account result
    Web-->>Guest: 201 Account, no password/hash
  end
```

Seller/Admin accounts use controlled provisioning or guarded synthetic dev fixtures. Registration cannot assign their roles. Invalid fields return 400; deployment does not expose a production quick-login route.

## Login and exactly-once Guest consumption

```mermaid
sequenceDiagram
  actor Caller
  participant Login as Login orchestration at composition boundary
  participant Identity as Identity credential / token ports
  participant Cart as Cart merge input port
  participant Data as Cart ports / JDBC adapters
  participant DB as PostgreSQL marketplace
  Caller->>Login: POST /auth/login + optional Guest cookie / Origin
  Login->>Login: Validate allowed Origin if Guest cookie supplied
  Login->>Identity: Verify credentials and current account availability
  alt Credentials invalid
    Identity-->>Login: Generic authentication failure
    Login-->>Caller: 401, no cart mutation
  else Credentials valid
    Identity-->>Login: Trusted Account ID and operational role
    alt MEMBER with valid unconsumed Guest cart
      Login->>Cart: Merge once for trusted Member and Guest session
      Cart->>Data: BEGIN and lock source/target carts in stable order
      Data->>DB: Re-read ownership and consumed marker
      alt Already consumed by a concurrent login
        DB-->>Data: Consumed marker
        Data-->>Cart: No second merge
      else Unconsumed source
        Cart->>Data: Read current purchasability / stock facts
        Cart->>Cart: Sum valid quantities, reject unavailable or over-stock lines
        Cart->>Data: Save target + version, mark Guest consumed, COMMIT
      end
      Cart-->>Login: Merge result and rejected lines, after transaction ends
    else Seller/Admin or no eligible Guest cart
      Login->>Login: No cart import
    end
    Login->>Identity: Issue normal access JWT for authenticated account
    Identity-->>Login: Access token and expiry
    Login-->>Caller: 200 token + Account + cartMerge, expire consumed Guest cookie
  end
```

Identity never imports Cart. The composition layer invokes exported input ports; Cart owns the merge transaction. A consumed source owned by another Member cannot be reassigned. Transaction failure returns an error, not a successful merge; retry cannot duplicate consumption. The no-op consumed branch ends its read transaction before returning. No `/cart/merge` HTTP operation exists.

## Get, set and remove cart lines

```mermaid
sequenceDiagram
  actor Caller
  participant Web as HTTP adapter / security
  participant Cart as Cart query / command ports
  participant Data as Owned cart JDBC adapter
  participant DB as PostgreSQL marketplace
  Caller->>Web: GET /cart
  Web->>Cart: MEMBER Actor or opaque Guest session
  alt No credentials
    Cart->>Data: Create empty Guest cart/session
    Data->>DB: Persist owner hash + expiry
    Cart-->>Web: Empty versioned cart + session cookie
  else Existing authorized owner
    Cart->>Data: Read scoped cart with current price projection
    Data->>DB: SELECT by Member or Guest session hash
    Cart-->>Web: Versioned cart
  end
  Web-->>Caller: 200 cart, Set-Cookie only when needed
  Caller->>Web: PUT or DELETE /cart/lines/{variantId} + expectedVersion
  Web->>Cart: Trusted owner + validated command
  Cart->>Data: BEGIN, lock owned cart and compare version
  alt Stale version or unavailable variant for PUT
    Data-->>Cart: Conflict, ROLLBACK
    Cart-->>Web: STALE_VERSION / ITEM_UNAVAILABLE
    Web-->>Caller: 409
  else Valid edit
    Cart->>Cart: Set positive quantity or remove line
    Cart->>Data: Save + increment version, COMMIT
    Cart-->>Web: Result after commit
    Web-->>Caller: PUT 200 cart / DELETE 204
  end
```

Seller/Admin cart access is 403. Invalid JWT never falls back to Guest. Cookie mutations require an allowed Origin. Missing owned resources return 404 before checking version. DELETE requires version in query; PUT requires it in JSON. Quantity and version syntax failures return 400.
