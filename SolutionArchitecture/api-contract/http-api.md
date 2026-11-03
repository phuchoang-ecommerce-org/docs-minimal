# HTTP API Contract

## Target API surface

The [OpenAPI 3.1 YAML](./openapi.yaml) is the machine-readable target. The table below summarizes it; the current code may not implement it yet.

| Area | Representative routes | Caller |
| --- | --- | --- |
| Identity | `POST /auth/login`, `POST /accounts`, `GET /me`, `PATCH /me` | Guest / own account |
| Discovery | `GET /home`, `GET /products`, `GET /products/{id}`, `GET /categories` | Public |
| Seller catalog | `POST/PATCH /seller/products`, `POST /seller/products/{id}/images/link`, `POST /seller/products/{id}/images/upload`, `DELETE /seller/products/{id}/images/{imageId}`, `PATCH /seller/stock/{variantId}` | Seller, own records |
| Cart | `GET /cart`, `PUT /cart/lines/{variantId}`, `DELETE /cart/lines/{variantId}` | Guest or Member, own cart |
| Checkout | `POST /orders` with `Idempotency-Key`, `GET /orders/{id}`, `POST /orders/{id}/cancellation` | Member, own order |
| Seller COD | `GET /seller/orders`, `POST /seller/orders/{id}/mark-paid` | Seller, own portion |
| Ratings/reviews | `GET /products/{id}/reviews`, `POST /products/{id}/reviews`, `PATCH/DELETE /me/reviews/{id}` | Public read / eligible Member |
| Admin | `POST/PATCH /admin/categories`, `PATCH /admin/sellers/{id}`, `PATCH /admin/reviews/{id}/moderation`, `GET /admin/reports`, `GET /admin/audit` | Admin |

Use JSON and stable `problem+json` errors with `code`, `message`, `correlationId` and field errors. The API checks role and ownership independent of frontend guards. No shipping, return, refund or payment gateway endpoint exists. `GET /products/{id}/images/{imageId}/content` serves UPLOAD bytes; LINK images are requested directly from approved remote hosts.
