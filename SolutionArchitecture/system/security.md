# Security and Authorization

## Simple JWT model

Spring Security authenticates a login name/password (strong one-way hash). The API issues a signed, short-lived access JWT containing subject, one role, issued/expiry times and issuer. Use the existing Spring Security JWT support; validate signature, issuer and expiry on each request. Configure signing key from a secret file/environment in production; never commit it. A 15-minute access lifetime is a starting configuration, not a universal policy. Avoid token blacklists, external key services and distributed session infrastructure.

Next.js holds the access token in a secure, HttpOnly, SameSite cookie and forwards it from server code to the API. Do not put the token in localStorage or render it into client props. Require HTTPS and Secure cookies in production. Login and logout set/clear the cookie. When the access token expires, require a new login for this minimal version; do not add refresh-token rotation until a documented need exists. Same-origin mutation endpoints/server actions must check origin/CSRF protection as appropriate. Passwords, JWTs and personal data must not appear in logs.

Authorize both role and owner/seller scope in the backend. Next.js layout guards improve navigation only. `GUEST` is an unauthenticated capability, never a signed JWT role. A `SELLER` claim does not authorize an arbitrary seller ID. A Seller can mark only their own Pending Payment order portion Paid. Admin actions that change seller status, categories or review visibility require an audit reason. Audit rows are append-only via application permission and database grants where practical.

## Security acceptance checks

- Correct Member, Seller and Admin JWTs succeed on permitted routes; wrong role returns 403; cross-owner access returns 404.
- Missing, expired, altered or wrong-issuer JWT returns 401.
- An unauthenticated Guest can use public catalog/cart, but cannot checkout. A Seller cannot mark another Seller's portion Paid.
- Dev quick login works only with the dev profile and allowlisted sample users.
- In prod, seed never runs, quick-login API returns 404, frontend action rejects, and sample account strings are absent from the built client assets.
- Logs and API errors contain no password, token or sensitive personal data.
