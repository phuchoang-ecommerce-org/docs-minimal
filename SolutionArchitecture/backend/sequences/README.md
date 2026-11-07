# Sequence Diagrams

These diagrams show transaction and authorization boundaries for the main flows. Solid arrows are synchronous calls; a PostgreSQL transaction is shown explicitly. No broker, shipping system, return or refund participant exists.

- [COD checkout](./cod-checkout.md)
- [Seller marks COD Paid](./seller-payment.md)
- [Member rating and review](./rating-review.md)
- [Product image modes](./product-images.md)

The [activity diagrams](../../../BusinessAnalyst/activity-diagrams.md) show actor decisions; these diagrams show the components and persistence calls.
