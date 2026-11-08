# Product Scope

## Product goal

A USD-only marketplace where Members buy products from Sellers and Marketplace Admins govern the platform. Guests can discover products and prepare a cart, but must sign in before checkout. The application runs with Next.js, Spring Boot and PostgreSQL. Product images have two modes: LINK stores a source URL and fetches the image live; UPLOAD stores image bytes in PostgreSQL. Approved public image sources are the only runtime external-source exception for LINK images.

## Four roles

| Role | Identity | Main capabilities |
| --- | --- | --- |
| Guest | Anonymous browser session | Browse categories and published products; search/filter; read ratings and reviews; maintain a guest cart; register and sign in |
| Member | Authenticated buyer | Create/list own checkout addresses and manage own cart; place and view own COD orders; cancel an unpaid order; rate and review products from paid orders |
| Seller | Authenticated seller | Manage own shop, products, LINK/UPLOAD images, variants, USD prices and stock; view own seller orders; mark their own COD portions Paid after receiving cash |
| Marketplace Admin | Authenticated platform account | Manage Seller status and shared categories with reasons/audit; moderate reviews and inspect bounded reports/audit |

An account has one operational role in the first implementation. A Seller shops only through a separate Member account. Seller reads/writes require a matching `seller_id`; Member private reads/writes require a matching `member_id`. An Admin sees platform-wide records but cannot erase audit history.

## Included

Identity and JWT login; catalog/categories; seller-managed LINK and UPLOAD product images; PostgreSQL search/filter; seller stock; guest and Member carts with merge on login; authenticated COD checkout; customer and seller order records; seller payment-status transition; simple vouchers; one-to-five-star Member ratings and written reviews for paid purchases; Admin policy, reports and audit. See [business rules](./business-rules.md).

## Excluded

No software shipping, tracking, delivery status, shipping fee, carrier integration or shipping API. No return, exchange, refund or reverse-payment workflow. No bank transfer, card or gateway payment. No email/SMS, external identity provider, separate image store, object storage/CDN operated by the platform, ERP/CRM, Kafka, Redis, MongoDB or Elasticsearch. No fifth human role, personalized recommendation, loyalty or multi-currency. The physical handoff and cash collection for COD happen outside the application; the Seller records only whether cash was received.

## Approved product choices

| ID | Decision |
| --- | --- |
| D1 | A Member login is required to purchase. Guest cart lines may merge on login. |
| D2 | One checkout may contain multiple Sellers. It creates one customer order with a seller order per Seller; each Seller can mark only its own portion Paid. The customer order is Paid when all seller portions are Paid. |
| D3 | COD is the only payment method. A Seller may change their portion from `PENDING_PAYMENT` to `PAID` after receiving cash outside the application. |
| D4 | No shipping or return/refund workflow is implemented. |
| D5 | USD is the only currency; prices and order snapshots use USD with two decimal places. |
| D6 | Seller chooses LINK (approved HTTPS URL, fetched live; URL/source/license metadata in PostgreSQL) or UPLOAD (validated image bytes and metadata in PostgreSQL). Missing images show a local placeholder. Future dev product seed data uses LINK; none is created by this documentation task. |
| D7 | If a future scoped feature needs notifications, only in-app PostgreSQL storage is allowed. Notification triggers and Admin-assisted recovery have no current UC/API operation and are not release work. Email remains excluded. |
| D8 | Members can rate and review a product after a seller order containing that product is Paid. |
| D9 | The four-role model, one role per account and multi-seller order split from the previous draft are accepted. |

D6 is an explicit exception to the previous blanket ban on external services for LINK display. UPLOAD is served from PostgreSQL and needs no remote image source at display time. Production supports both modes.

## Current release boundary

The owner approved the current documentation on 2026-11-08. Implementation is restricted to [UC-01–UC-10](./use-cases.md) and the [38-operation API inventory](../SolutionArchitecture/api-contract/http-api.md). Earlier broad descriptions of profile edits, notifications, Seller onboarding, product moderation and Admin payment corrections do not add endpoints. The [backend backlog](../ProductManager/product-backlog.md) separates the first demo from full-contract completion.
