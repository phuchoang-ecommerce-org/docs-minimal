# Frontend Product Backlog

Status: **all TODO**. Estimates are focused frontend-developer hours, including targeted checks and integration; they are unverified until the frontend codebase and backend responses are inspected. The pre-demo slice is **25 h**, with **5 h reserve** in a 30 h week. IDs here identify web work; `PB-*` IDs remain backend-owned.

## Demo slice

| ID | Deliverable | Hours | Backend dependency | Acceptance |
| --- | --- | ---: | --- | --- |
| FE-001 | Workspace, generated API types and safe runtime configuration | 3 | PB-001; OpenAPI | Selected code root builds; generated client matches contract; server-only API URL and production profile checks run. |
| FE-002 | Login, server session, role guard and Guest-cookie relay | 4 | PB-002, PB-004 | JWT stays server-side; Guest cookie survives login and is cleared after Member merge; invalid bearer never becomes Guest; Seller/Member routes reject wrong roles. |
| FE-003 | Public product list and detail | 3 | PB-003 | Two Seller variants are visible with USD price and stock; unpublished/inactive products are absent; empty images use a placeholder. |
| FE-004 | Guest/Member cart and login merge view | 5 | PB-002–004 | Guest adds both variants, edits/removes lines and signs in; merged cart is re-read once; rejected lines and stale cart versions are shown. |
| FE-005 | Owned address selection and COD checkout | 4 | PB-005–006 | Fresh cart/address read; one key and exact body remain stable across uncertain retries; 201 opens order detail; conflicts require a fresh review. |
| FE-006 | Member order detail and unpaid cancellation | 2 | PB-007–008 | Current status is re-read; fully pending order cancels once; paid or partly paid order shows 409 without a false success state. |
| FE-007 | Seller-owned portions and cash-recording action | 2 | PB-009 | Seller sees only own portions; mark-paid re-reads state; duplicate/foreign attempts show safe errors. |
| FE-008 | Integrated browser rehearsal and evidence | 2 | FE-001–007; PB-019 | Two fresh-state runs, recorded build/check results, browser steps and known omissions; no credentials or JWT in shared evidence. |

The demo UI uses exactly these operation IDs: `logIn`, `listProducts`, `getProduct`, `getOwnCart`, `setCartLine`, `removeCartLine`, `listOwnCheckoutAddresses`, `placeCodOrder`, `getOwnOrder`, `cancelUnpaidOrder`, `listOwnSellerOrders`, `markOwnOrderPaid`. FE-001/008 add no API operations. An HTTP-only backend test remains the evidence for database atomicity, races and rollback.

The web demo uses dev-provisioned accounts and addresses. Registration, category browsing, address creation, order history, Seller product detail and stock editing are deferred from the UI in line with the backend's reduced target. No configured voucher, review, image-management, Admin or gateway flow is claimed.

## After the demo

These items complete web coverage as backend capabilities become ready. Re-estimate them at the 20 Nov review; dates and hours below are planning assumptions, not commitments.

| ID | Deliverable | Initial hours | Backend dependency |
| --- | --- | ---: | --- |
| FE-009 | Remaining six operations from the 18-operation backend target: registration, categories, address creation, order history, own product detail and stock edit | 10 | PB-002/003/005/007/010 |
| FE-010 | Seller catalog and LINK/UPLOAD image management, including byte display and stale-version recovery | 10 | PB-011 |
| FE-011 | Public and own reviews, paid-purchase create/edit/removal | 6 | PB-013 |
| FE-012 | Admin Seller/category policy with reasons and versions | 6 | PB-014 |
| FE-013 | Admin moderation, bounded reports and audit views | 6 | PB-015 |
| FE-014 | Full-contract regression, access, responsive and production-profile checks | Re-estimate | PB-011–016 |

FE-009 covers six operations; FE-010–013 cover the other 20 operations outside the backend demo. Together with the 12-operation demo slice, these map to the approved 38-operation API inventory. Voucher validation and discount display extend FE-005 after PB-012 defines the rule; they add no operation. Do not mark the full web contract done based on the demo slice.
