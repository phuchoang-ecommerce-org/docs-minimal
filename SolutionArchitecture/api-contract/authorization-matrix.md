# API Authorization Matrix

Roles in OpenAPI `x-roles` are necessary but do not replace owner-filtered queries. Guest means no authenticated operational role. Public discovery is available to all four human roles.

| Capability | Guest | Member | Seller | Admin | Data scope |
| --- | --- | --- | --- | --- | --- |
| Products/categories/reviews/image bytes | Yes | Yes | Yes | Yes | Published product, active Seller, visible reviews |
| Registration/login | Yes | Credential flow | Credential flow | Credential flow | Registration creates MEMBER only; no public role assignment |
| Cart | Own opaque session | Own cart | No | No | MEMBER bearer or valid Guest cookie; allowed Origin for cookie writes |
| Checkout address create/list | No | Own | No | No | Member from trusted actor; UC-04 support only |
| Orders/list/detail/cancel | No | Own | No | No | Member predicate before state check |
| Review create/list/edit/delete | No | Own | No | No | Creation requires purchased product in own Paid Seller portion; own reads include hidden reviews |
| Product/stock/images | No | No | Own | No | SellerShop ownership; writes require ACTIVE shop |
| Seller portions/mark-paid | No | No | Own | No | Portion belongs to resolved SellerShop; never another portion's data |
| Seller policy/category writes | No | No | No | Yes | Reason and audit; version required for edits |
| Moderation/reports/audit | No | No | No | Yes | Removed review content stays out of review lists; audit append-only |

Non-owned resources return 404. Wrong role returns 403 before lookup. Invalid required JWT returns 401. Allowed-Origin failure for cookie use returns 403. Owned stale edits/state conflicts return 409. Public product filters also apply to direct image/review URLs. The [error contract](./exceptional-errors.md) specifies safe payloads and exception mapping.
