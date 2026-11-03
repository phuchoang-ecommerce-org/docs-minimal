# User Stories and Acceptance Criteria

Stories correspond to [use cases](./use-cases.md). Server-side rules are specified in [business rules](./business-rules.md); these criteria describe observable outcomes.

| Story | As a… I want… | Acceptance criteria |
| --- | --- | --- |
| US-01 / UC-01 | Guest, I want to find products | Only active/published products appear; prices use USD; visible rating/count and image fallback render |
| US-02 / UC-02 | Guest or Member, I want a cart | Add/change/remove works for own cart; Guest lines merge once on login; invalid lines are reported |
| US-03 / UC-03 | User, I want to sign in | Valid credentials issue JWT; failed login reveals no account existence; dev sample buttons are absent in prod |
| US-04 / UC-04 | Member, I want to buy with COD | Guest must log in; COD is the only choice; totals are recalculated; one transaction creates per-Seller portions and decrements stock |
| US-05 / UC-05 | Member, I want to cancel an unpaid order | All-pending order cancels and stock returns once; any Paid portion blocks cancellation |
| US-06 / UC-06 | Seller, I want to manage my listings | Only own products/stock can change; USD price; LINK stores URL only; UPLOAD stores validated bytes in PostgreSQL |
| US-07 / UC-07 | Seller, I want to record COD cash receipt | Only own Pending Payment portion changes to Paid; change is audited; customer aggregate is Paid when all portions are Paid |
| US-08 / UC-08 | Member, I want to rate and review a paid product | Only own Paid purchase qualifies; stars 1–5; one active review per Member/product; public summary excludes hidden reviews |
| US-09 / UC-09 | Admin, I want to manage Sellers/categories | Only Admin may act; suspension hides listings from new purchases; action and reason are audited |
| US-10 / UC-10 | Admin, I want to moderate reviews and inspect audit | Hidden review leaves public average/count; audit is append-only and searchable |
| US-11 / UC-01 | Guest, I want a useful homepage | Search, categories, product cards, USD prices and ratings are available; slow/missing image does not block browsing |
| US-12 / UC-06 | Seller, I want two image options | LINK accepts approved licensed URLs; UPLOAD accepts bounded JPEG/PNG/WebP; unsafe input fails without creating an image |

No story introduces shipping, returns, refunds, non-COD payment or a fifth human role. These stories are target requirements, not implementation status.
