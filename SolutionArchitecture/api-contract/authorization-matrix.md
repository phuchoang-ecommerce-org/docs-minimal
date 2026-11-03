# API Authorization Matrix

The [OpenAPI YAML](./openapi.yaml) lists permitted roles through `x-roles` per operation. These constraints also require row-level ownership checks in Spring Boot; a valid JWT role alone is insufficient.

| Capability | Guest | Member | Seller | Admin | Instance scope |
| --- | --- | --- | --- | --- | --- |
| Browse/search/home/categories/read reviews/images | Yes | Yes | Yes | Yes | Published active listings for public reads |
| Register/login | Yes | Sign-in when logged out | Sign-in when logged out | Sign-in when logged out | Credential flow |
| Cart | Own Guest session | Own Member cart | No | No | Opaque session or `member_id` |
| COD checkout/order/cancel | No | Own | No | No | Authenticated `member_id` |
| Submit/edit review | No | Own Paid purchase | No | No | `member_id`, product and Paid Seller portion |
| Product/stock/images | No | No | Own | Admin policy via separate operations | `seller_id` |
| Mark COD portion Paid | No | No | Own | No | `seller_id` |
| Manage Sellers/moderate/reports/audit | No | No | No | Yes | Platform-wide; audit append-only |

A non-owned record returns 404, missing/expired JWT returns 401, wrong role returns 403, and illegal state/stock/idempotency conflict returns 409. Public operations may omit JWT. Guest cart ownership uses an opaque HttpOnly cookie.
