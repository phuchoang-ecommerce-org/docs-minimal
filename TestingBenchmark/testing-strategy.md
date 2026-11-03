# Testing Strategy

## Method

Test domain invariants first, then HTTP/security and PostgreSQL behavior, then four-role journeys. Use deterministic fixtures, a fixed test clock and isolated database state. Backend rules are authoritative; frontend tests verify interactions and server errors. CI: compile/typecheck → unit → MVC slice → PostgreSQL integration → browser E2E → benchmark smoke. Benchmark only after correctness passes.

| Layer and tools | Scenario | Assertion |
| --- | --- | --- |
| Pure domain: JUnit 5 + AssertJ | USD total, voucher boundaries, legal COD status changes | Correct `NUMERIC` rounding; only Pending Payment → Paid |
| Pure domain: JUnit 5 parameterized | Rating 0, 1, 5, 6 and text-length limits | Only 1–5 accepted; defined text policy enforced |
| Application: JUnit 5 + Mockito + AssertJ | Seller A marks Seller B portion Paid | Ownership failure; no update or audit call |
| Application: JUnit 5 + Mockito | Same checkout idempotency key retried | One stock decrement/order creation |
| Web slice: Spring Boot Test MVC slice + Spring Security Test | Guest checkout, Member checkout, Seller paid endpoint | 401/authorized/role denial with stable errors |
| Persistence: Spring Boot Test + Testcontainers PostgreSQL + Flyway | Two Members buy last unit | One commit, one conflict, nonnegative stock |
| Full API: Spring Boot Test + Testcontainers PostgreSQL | Multi-seller COD order; each Seller marks own portion Paid; review eligibility | Aggregate Paid only after all portions; Member review then allowed |
| Frontend component + browser E2E | Homepage, login, cart merge, checkout, seller Paid action, review form | Accessible Ant Design controls, USD display and accurate errors |
| Image behavior | LINK approved/disallowed/unavailable URL; UPLOAD valid/invalid type and size | LINK stores URL only; UPLOAD stores bytes in PostgreSQL; both fall back safely |
| Profile gate | dev quick login versus prod build/startup | Sample accounts and quick login only in dev |

Spring Boot 4 may use its dedicated web MVC test starter for the MVC slice, as the current backend build does. Keep Spring Boot Test, JUnit, AssertJ and Mockito under Spring Boot-managed test dependencies unless compatibility requires a pin. Testcontainers PostgreSQL verifies actual locking and SQL; H2 is not a substitute.
