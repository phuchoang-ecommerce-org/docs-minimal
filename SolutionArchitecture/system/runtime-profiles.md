# Development and Production Profiles

## Two coordinated profiles

Use `dev` and `prod` on **both** frontend and backend. The application must fail on unknown profile values and refuse mixed profiles in deployment. Profile names are local convention; `SPRING_PROFILES_ACTIVE=dev|prod` selects backend configuration and `APP_PROFILE=dev|prod` selects Next.js server configuration. Default to `prod` in non-interactive scripts and deployments. CI tests may use an isolated test configuration, never a shipped login profile.

| Concern | dev | prod |
| --- | --- | --- |
| Backend account seed | Idempotently create one sample Member, Seller and Admin plus a public Guest path. Clearly marked synthetic data; fixed local-only credentials read from a developer fixture/secret and resettable. | No sample account seed, fixture credentials or dev-login endpoint. Startup fails if the dev seed flag is set. |
| Backend login | Normal password login plus an optional dev-only quick-login endpoint that selects an allowlisted sample account and issues the same normal JWT. Bound to loopback or local development environment; never compiled as a prod-exposed handler. | Normal password login only; quick-login route is absent (404), even if a request guesses its URL. |
| Frontend login | Displays a “Development accounts” panel with role-labeled buttons; each button invokes the dev-only same-origin action. Never embed sample passwords in browser code. | Panel/action are absent and server rejects calls. No sample names or credentials in public bundle. |
| Secrets/config | Local `.env.dev.local` or equivalent, gitignored; sample values only in a template. | Deployment secret injection, HTTPS, secure cookie, fixed key file/secret and explicit PostgreSQL connection. |
| Data | Disposable local PostgreSQL with migrations and seed. | Production PostgreSQL with migrations, backup/restore procedure and no synthetic account seed. |

A Guest is not a sample account. The three dev account buttons cover the authenticated roles; a fourth link can open the public storefront. Seed passwords must be replaced for any shared development environment. Production's lack of the panel is insufficient: server and API must independently reject the dev path.

### Suggested configuration and commands

```text
backend/app/src/main/resources/application.yml
backend/app/src/main/resources/application-dev.yml
backend/app/src/main/resources/application-prod.yml
frontend/apps/web/src/lib/config/profile.ts
frontend/apps/web/src/features/identity/dev-login/   # dev-only server code
frontend/scripts/with-profile.mjs
```

```sh
SPRING_PROFILES_ACTIVE=dev ./gradlew :app:bootRun
APP_PROFILE=dev pnpm --filter web dev
SPRING_PROFILES_ACTIVE=prod ./gradlew :app:bootRun
APP_PROFILE=prod pnpm --filter web build
```

These are target commands; adapt the workspace package name if it differs. Dev seed is guarded by both the Spring profile and an explicit local-development flag. Frontend profile branching must be evaluated on the server at build and request time as appropriate. Build a separate prod artifact; do not use a runtime CSS hide of a dev panel.
