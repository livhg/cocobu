# Implementation Tasks: Simplify MVP Authentication to User ID Login

## Phase 1: Spec and Schema Alignment

### Task 1.1: Confirm user identifier field
- [x] Audit existing Prisma User model for a suitable `userId`/`slug` field.
- [x] If missing, add a new column that stores the plain-text user ID (allow duplicates).
- [x] Ensure the field is indexed for lookup by login service.

### Task 1.2: Update backend auth endpoints
- [x] Replace magic link request endpoint with `POST /auth/login` accepting `{ userId: string }`.
- [x] Create or reuse user record based on provided `userId`.
- [x] Issue JWT session cookie containing the canonical user identifier.
- [x] Remove token issuance, email delivery, and rate-limiting logic.

## Phase 2: Frontend Changes

### Task 2.1: Simplify login page UI
- [x] Replace email input with single "User ID" field and helper text explaining MVP sharing behavior.
- [x] Submit form to new login endpoint and handle success by redirecting to dashboard.
- [x] Display inline validation for invalid characters or empty IDs.

### Task 2.2: Session handling updates
- [x] Ensure frontend client stores/reads session cookie without assuming email.
- [x] Update any profile or header components to display the current user ID string.

## Phase 3: Cleanup and Testing

### Task 3.1: Remove unused services
- [x] Delete magic link token tables/migrations if not needed.
- [x] Remove email provider configuration, env vars, and docs references for MVP.

### Task 3.2: Testing
- [x] Add backend tests covering new login flow (new user, existing user reuse, invalid ID).
- [x] Add frontend integration test for login form submission.
- [x] Manually verify that two browsers using the same user ID see shared data.
