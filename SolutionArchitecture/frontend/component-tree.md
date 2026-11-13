# Component Tree

This is the target component ownership for the Next.js App Router app in [frontend design](./frontend-design.md). Route files compose feature components and call the server-only API client. Feature folders own their views, forms, query keys and same-origin request functions. Shared components contain no business rules.

```text
app/layout.tsx                         Server: document shell
└── Providers                           Client: Ant Design theme, QueryClientProvider
    ├── (store)/layout.tsx               Server: public header, search and footer
    │   ├── page.tsx                     Server: HomeSections
    │   │   ├── CategoryLinks            Server
    │   │   └── ProductGrid              Server; ProductCard and ProductImage
    │   ├── products/page.tsx            Server: catalog shell and URL parameter validation
    │   │   └── ProductResults           Client: filters, cursor list and Query states
    │   ├── products/[productId]/page.tsx Server: ProductDetail and visible review summary
    │   │   ├── ProductImageGallery      Client: image selection and fallback
    │   │   ├── AddToCartForm            Client: Guest/Member only
    │   │   ├── VisibleReviewList        Client: cursor list
    │   │   └── ReviewCreateForm         Client: Member only; API decides eligibility
    │   └── cart/page.tsx                Server: allowed-role shell
    │       └── CartView                 Client: Guest cookie initialization and edits
    ├── (auth)/login/page.tsx            Server: safe return target and profile
    │   └── LoginForm                    Client: credentials and dev-only panel
    ├── (auth)/register/page.tsx         Server
    │   └── RegistrationForm             Client
    ├── (member)/layout.tsx              Server: Member guard and account navigation
    │   ├── checkout/page.tsx            Server: protected shell
    │   │   └── CheckoutFlow             Client: address, fresh cart, COD intent
    │   ├── account/addresses/page.tsx   Server
    │   │   └── AddressBook              Client: list and create
    │   ├── account/orders/page.tsx      Server
    │   │   └── OrderList                Client: cursor list
    │   ├── account/orders/[orderId]/page.tsx Server
    │   │   └── OrderDetail              Client: current status and cancellation
    │   └── account/reviews/page.tsx     Server
    │       └── OwnReviewList            Client: edit, delete and hidden status
    ├── (seller)/seller/layout.tsx       Server: Seller guard and navigation
    │   ├── products/page.tsx            Server → SellerProductList (Client)
    │   ├── products/new/page.tsx        Server → ProductEditor (Client)
    │   ├── products/[productId]/page.tsx Server → ProductEditor (Client)
    │   │   ├── VariantPriceForm
    │   │   ├── StockEditor              separate stock version
    │   │   └── ImageManager             LINK/UPLOAD form and removal
    │   └── orders/page.tsx              Server → SellerOrderList (Client)
    │       └── MarkCashReceivedAction   Client: owned portion only
    └── (admin)/admin/layout.tsx         Server: Admin guard and navigation
        ├── sellers/page.tsx             Server → SellerPolicyList (Client)
        ├── categories/page.tsx          Server → CategoryPolicyList (Client)
        ├── reviews/page.tsx             Server → ReviewModerationList (Client)
        ├── reports/page.tsx             Server → ReportView (Client)
        └── audit/page.tsx               Server → AuditList (Client)
```

`Providers` is the smallest Client boundary shared by the app. It creates one browser `QueryClient` per tab and never a process-wide server cache. Pages may use request-scoped server prefetch and a `HydrationBoundary` when the same data is immediately consumed by a Client component. Do not dehydrate JWTs, cookies, errors or a Query cache containing another actor's data. The [caching design](./caching.md) owns query lifetimes and invalidation.

## Component contracts

| Owner | Input and responsibility |
| --- | --- |
| Route page/layout | Validate route and URL inputs, read the server session, enforce navigation guard, set metadata and compose feature views. Do not contain mutation rules. |
| Feature view | Render typed API data, loading/empty/error states, and scoped actions. Cursor pages use `items`, `nextCursor` and `hasNext`; filters live in the URL. |
| Feature form | Hold unsaved fields and pending state. Send only contract fields through a same-origin action/handler; use returned `version` for `expectedVersion`. |
| Server API client | Call the [OpenAPI contract](../api-contract/openapi.yaml), forward the required bearer or Guest cookie, and map `Problem.code` plus safe `fieldErrors`. It never reaches Client bundles. |
| Same-origin handler/action | Check origin for mutations, relay only needed cookies/headers and return safe typed data. The Guest cart initialization path must relay `Set-Cookie`. |
| Shared UI | Theme, responsive shell, USD formatter, image fallback, cursor controls and error presentation. It does not derive totals, eligibility, ownership or status. |

The homepage stays server-rendered from `listCategories` and `listProducts` as specified in [homepage design](./homepage-design.md). Product and category cards link to URL state; they do not create another homepage API. Seller/Admin see public discovery but no cart action. Product review creation is offered to a Member when the UI has evidence of a Paid portion; `createProductReview` remains authoritative.

The Product Editor uses the product `version` for product, variant-price and image changes. StockEditor uses the variant stock `version`. After `STALE_VERSION`, each editor reloads its owned record before resubmission. CheckoutFlow holds one idempotency key and an unchanged request body while an outcome is unresolved; it does not use optimistic order creation.
