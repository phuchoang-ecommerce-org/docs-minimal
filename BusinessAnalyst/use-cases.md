# Use Cases and Use-Case Diagram

This diagram maps human goals to the application boundary. The use-case diagram is authored in PlantUML and rendered to SVG; the table below defines each goal and its exception.

![Use-case diagram for the four marketplace roles](./diagrams/use-cases.svg)

[PlantUML source](./diagrams/use-cases.puml)

| ID | Primary actor | Preconditions | Success outcome | Main exception |
| --- | --- | --- | --- | --- |
| UC-01 | Guest/Member | Product published, Seller active | List/detail with USD price, rating and image | LINK image failure shows placeholder |
| UC-02 | Guest/Member | Own cart session | Add/change/remove variant; Guest cart merges on login | Invalid/unavailable item reported |
| UC-03 | Guest | Valid credentials or registration data | Member/Seller/Admin obtains JWT as appropriate | Invalid credentials; dev quick-login exists only in dev |
| UC-04 | Member | Signed in, valid cart/address | One customer order plus Seller portions, COD Pending Payment; stock decreases atomically | Stock/voucher conflict rolls back; duplicate key returns original |
| UC-05 | Member | Own order; every portion Pending Payment | Order Cancelled and stock restored once | Any Paid portion blocks cancellation |
| UC-06 | Seller | Own active shop | Own product, USD price, stock and LINK/UPLOAD image maintained | Cross-Seller resource denied; unsafe image rejected |
| UC-07 | Seller | Own non-cancelled portion Pending Payment; cash received outside app | Portion Paid and audited; aggregate Paid when all portions Paid | Wrong Seller or repeated/illegal transition rejected |
| UC-08 | Member | Bought product in a Paid Seller portion | One 1–5-star rating and optional review saved | Unpaid/non-buyer/duplicate review rejected |
| UC-09 | Admin | Authenticated Admin | Seller/category policy changed and audited | Invalid state or missing reason rejected |
| UC-10 | Admin | Authenticated Admin | Review visibility changed; reports/audit viewed | Review not found or invalid decision rejected |

The [activity diagrams](./activity-diagrams.md) show decisions and rollback points. API authorization is defined in the [OpenAPI contract](../SolutionArchitecture/api-contract/index.md); UI visibility alone is never authorization.
