# Proposal: Simplify MVP Authentication to User ID Login

## Change ID
`update-mvp-auth-flow`

## Summary
Introduce a minimal authentication flow for the MVP release that lets users pick any user ID and immediately access the product. Remove the dependency on email-based magic links so we can unblock user testing without waiting for mail service setup.

## Motivation

### Problem
The current authentication specification assumes working email delivery for magic link login. We have not integrated an email provider yet, and wiring it up introduces infrastructure cost and operational overhead before we validate product-market fit.

### Why Now
- The team needs a frictionless way to dogfood the app and collect early feedback.
- Configuring email sending, rate limiting, and token storage is unnecessary for the earliest tests.
- Allowing duplicate user IDs is acceptable for the MVP because shared IDs simply surface the same data, which matches the lightweight expectations in early research interviews.

## Proposed Solution
- Replace magic link login with a plain user ID claim screen: users type any ID (slug format) and immediately receive a session.
- Automatically create the user record the first time an ID appears. Reusing the same ID reuses the same record; collisions are acceptable during MVP.
- Continue using HTTP-only session cookies backed by JWTs, but encode the chosen user ID instead of an email.
- Remove requirements tied to email delivery, magic link tokens, and request rate limiting because they no longer apply.
- Add minimal validation (slug characters, length) so IDs remain URL safe for future profile links.

## Impact
- **Specs affected**: Authentication capability
- **Code areas**: Auth routes/pages in Next.js frontend, NestJS auth controller/service, Prisma user model seeding.
- **Data**: User table needs a unique slug column (or reuse existing unique identifier) but we accept collisions by design.
- **Risks**: User impersonation is possible; this is acknowledged and acceptable for MVP scope.

## Alternatives Considered
1. **Delay release until email infrastructure is ready** – rejected because it blocks MVP feedback loops.
2. **Temporary shared password** – rejected because passwords contradict the long-term passwordless strategy and add UX friction.
3. **Invite codes** – rejected because it still requires distribution overhead and does not reduce setup complexity.
