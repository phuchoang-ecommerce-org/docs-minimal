# OpenAPI / Swagger Contract

[openapi.yaml](./openapi.yaml) is the machine-readable **OpenAPI 3.1** target contract and can be loaded by Swagger UI. It defines paths, methods, request/response schemas, JWT bearer security and stable error responses. The `x-roles` and `x-use-case` extensions connect operations to [Business Analyst use cases](../../BusinessAnalyst/use-cases.md).

- [HTTP API conventions and capability map](./http-api.md)
- [Product image LINK/UPLOAD contract](./product-images.md)
- [Role and ownership matrix](./authorization-matrix.md)

The YAML is a **target specification**, not proof the existing backend implements those 34 operations. During implementation, update it together with controllers and generated clients; check Swagger rendering and schema lint in CI. Do not copy the old 155-operation OpenAPI or its provider endpoints. The production API has no dev quick-login path; [runtime profiles](../system/runtime-profiles.md) define that local-only feature.
