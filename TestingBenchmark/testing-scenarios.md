# Testing Scenarios

## Required scenarios

| ID | Action | Expected outcome |
| --- | --- | --- |
| T1 | Guest cart → login → COD checkout | Cart merges; purchase requires Member |
| T2 | Two Members buy last SKU | One order; no negative stock |
| T3 | Retry checkout same key/body, then same key/different body | Original result, then 409 |
| T4 | Seller reads/updates another Seller's product/order | 404; no leak or Paid mutation |
| T5 | Seller marks own Pending Payment portion Paid twice | First succeeds and audits; retry does not create a second transition |
| T6 | Multi-seller order: one then all portions Paid | Customer aggregate Pending then Paid |
| T7 | Member cancels all-pending order; tries to cancel partly Paid order | Stock restored once; second case rejected |
| T8 | Member reviews unpaid/non-owned/paid product | Denied/denied/accepted; 1–5 star validation |
| T9 | Admin hides review | Public average/count excludes it |
| T10 | LINK URL fails at display time or UPLOAD image cannot be read | Placeholder; product and checkout remain available |
| T11 | Seller submits disallowed LINK URL or oversized/non-image UPLOAD | Rejected; only valid UPLOAD persists image bytes |
| T12 | Dev versus prod profile | Sample accounts/quick login only in dev |
| T13 | Database failure during checkout | No success or partial order |

Tie each scenario to BR IDs and the reduced OpenAPI contract. Do not mock the core rule under test.
