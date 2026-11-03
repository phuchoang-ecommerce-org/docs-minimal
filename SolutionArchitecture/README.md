# Solution Architecture

| Topic | Documents |
| --- | --- |
| System | [Overview](./system/system-overview.md), [security](./system/security.md), [runtime profiles](./system/runtime-profiles.md), [migration map](./system/migration-map.md) |
| Backend | [Backend design](./backend/backend-design.md), [PostgreSQL data model](./backend/postgresql-data-model.md) |
| Frontend | [Frontend design and pnpm monorepo](./frontend/frontend-design.md), [homepage design](./frontend/homepage-design.md) |
| Interaction | [Sequence diagrams](./sequences/README.md) |
| API | [OpenAPI 3.1 / Swagger contract](./api-contract/README.md), [HTTP conventions](./api-contract/http-api.md), [image contract](./api-contract/product-images.md) |

[Business rules](../BusinessAnalyst/business-rules.md) define behavior; these documents define implementation boundaries. The [OpenAPI YAML](./api-contract/openapi.yaml) is the machine-readable API contract. Example routes in prose must be reconciled with that file before implementation.
