# Specification: Authentication

## Overview
Defines passwordless authentication using magic links with JWT-based session management.

## ADDED Requirements

### Requirement: Magic Link Login
The system SHALL support passwordless login via email-based magic links.

**Rationale**: Eliminates password management burden for users while maintaining security. Aligns with privacy-first principles.

#### Scenario: User requests magic link
- **GIVEN** a user visits the login page
- **WHEN** they enter their email address and submit
- **THEN** the system SHALL generate a single-use magic link token
- **AND** the token SHALL be valid for 15 minutes
- **AND** an email SHALL be sent to the user with the magic link
- **AND** the response SHALL confirm "Check your email for login link"

#### Scenario: User clicks magic link
- **GIVEN** a user received a magic link email
- **WHEN** they click the link within 15 minutes
- **THEN** the system SHALL validate the token
- **AND** the system SHALL create or retrieve the user account
- **AND** a session token SHALL be generated
- **AND** the user SHALL be redirected to the dashboard
- **AND** the session token SHALL be set as an HTTP-only cookie

#### Scenario: Magic link expires
- **GIVEN** a user received a magic link
- **WHEN** they click the link after 15 minutes have passed
- **THEN** the system SHALL reject the token
- **AND** an error message SHALL display "Link expired, please request a new one"
- **AND** no session SHALL be created

#### Scenario: Magic link is reused
- **GIVEN** a user has already used a magic link
- **WHEN** they try to use the same link again
- **THEN** the system SHALL reject the token
- **AND** an error message SHALL display "Link already used"
- **AND** no new session SHALL be created

### Requirement: Session Management
The system SHALL use JWT tokens for session management with 7-day expiration.

**Rationale**: JWTs are stateless, scalable, and work well with distributed systems. 7 days balances convenience and security.

#### Scenario: Authenticated request is made
- **GIVEN** a user has a valid session token
- **WHEN** they make an API request with the token
- **THEN** the system SHALL validate the JWT signature
- **AND** the system SHALL extract the user ID from the token
- **AND** the request SHALL be authorized
- **AND** the user context SHALL be available to the endpoint

#### Scenario: Session token expires
- **GIVEN** a user's session token was issued 8 days ago
- **WHEN** they make an API request
- **THEN** the system SHALL reject the expired token
- **AND** a 401 Unauthorized response SHALL be returned
- **AND** the client SHALL prompt for re-authentication

#### Scenario: Invalid token is provided
- **GIVEN** an attacker provides a forged or corrupted token
- **WHEN** they make an API request
- **THEN** the system SHALL reject the invalid token
- **AND** a 401 Unauthorized response SHALL be returned
- **AND** no user context SHALL be loaded

### Requirement: User Registration
The system SHALL automatically create user accounts when first logging in with a new email.

**Rationale**: Simplifies onboarding - no separate registration flow needed.

#### Scenario: New user logs in
- **GIVEN** a user with email "alice@example.com" has never logged in before
- **WHEN** they complete magic link authentication
- **THEN** a new User record SHALL be created
- **AND** the email SHALL be stored (encrypted)
- **AND** a default name SHALL be derived from the email (e.g., "alice")
- **AND** a session SHALL be created for the new user

#### Scenario: Existing user logs in
- **GIVEN** a user with email "bob@example.com" already exists
- **WHEN** they complete magic link authentication
- **THEN** the existing User record SHALL be retrieved
- **AND** no duplicate user SHALL be created
- **AND** a new session SHALL be created

### Requirement: Rate Limiting
The system SHALL rate-limit magic link requests to prevent abuse using database-backed counters.

**Rationale**: Prevents email flooding attacks and protects email quota without requiring Redis.

#### Scenario: User requests multiple magic links
- **GIVEN** a user has requested 2 magic links in the past hour
- **WHEN** they request a 3rd magic link
- **THEN** the request SHALL succeed
- **AND** a new magic link SHALL be sent

#### Scenario: Rate limit is exceeded
- **GIVEN** a user has requested 3 magic links in the past hour
- **WHEN** they request a 4th magic link
- **THEN** the request SHALL be rejected
- **AND** a 429 Too Many Requests response SHALL be returned
- **AND** the response SHALL indicate "Try again in X minutes"
- **AND** no email SHALL be sent

#### Scenario: Rate limit window expires
- **GIVEN** a user exceeded the rate limit 61 minutes ago
- **WHEN** they request a new magic link
- **THEN** the request SHALL succeed
- **AND** the rate limit counter SHALL reset

### Requirement: Secure Cookie Configuration
The system SHALL use secure, HTTP-only cookies for session tokens.

**Rationale**: Prevents XSS attacks by making tokens inaccessible to JavaScript. Ensures tokens are only sent over HTTPS.

#### Scenario: Session cookie is set
- **GIVEN** a user completes authentication
- **WHEN** the session token is issued
- **THEN** the cookie SHALL have the `HttpOnly` flag set
- **AND** the cookie SHALL have the `Secure` flag set (HTTPS only)
- **AND** the cookie SHALL have the `SameSite=Lax` attribute
- **AND** the cookie SHALL expire in 7 days

### Requirement: Logout
The system SHALL support user logout by clearing the session cookie.

**Rationale**: Users need the ability to explicitly end their session.

#### Scenario: User logs out
- **GIVEN** a user is authenticated
- **WHEN** they click logout
- **THEN** the session cookie SHALL be cleared
- **AND** the user SHALL be redirected to the login page
- **AND** subsequent requests SHALL be unauthenticated

### Requirement: Auth Guards
The system SHALL provide auth guards to protect endpoints requiring authentication.

**Rationale**: Centralized authorization logic reduces code duplication and security risks.

#### Scenario: Protected endpoint requires auth
- **GIVEN** an endpoint is decorated with `@UseGuards(AuthGuard)`
- **WHEN** an unauthenticated user tries to access it
- **THEN** a 401 Unauthorized response SHALL be returned
- **AND** the endpoint handler SHALL NOT execute

#### Scenario: Protected endpoint with valid auth
- **GIVEN** an endpoint is decorated with `@UseGuards(AuthGuard)`
- **WHEN** an authenticated user accesses it
- **THEN** the request SHALL proceed to the endpoint handler
- **AND** the user context SHALL be available via decorator

### Requirement: Email Delivery
The system SHALL send magic link emails using SMTP configuration.

**Rationale**: Email is the delivery mechanism for magic links.

#### Scenario: Magic link email is sent
- **GIVEN** a user requests a magic link
- **WHEN** the email is sent
- **THEN** the email SHALL include the magic link URL
- **AND** the email SHALL include a clear call-to-action button
- **AND** the email SHALL indicate the link expires in 15 minutes
- **AND** the email SHALL be sent from a configured sender address

#### Scenario: Email delivery fails
- **GIVEN** the SMTP service is unavailable
- **WHEN** a user requests a magic link
- **THEN** the system SHALL log the error
- **AND** a 500 Internal Server Error response SHALL be returned
- **AND** the user SHALL see a message "Unable to send email, please try again"

### Requirement: Token Storage
The system SHALL use the database to track used magic link tokens.

**Rationale**: Prevents token reuse attacks by maintaining a record of used tokens without requiring additional infrastructure.

#### Scenario: Magic link token is used
- **GIVEN** a user clicks a valid magic link
- **WHEN** the token is validated
- **THEN** the token ID SHALL be stored in the database
- **AND** the database entry SHALL include an expiry timestamp (15 minutes from creation)
- **AND** subsequent attempts to use the same token SHALL be rejected
- **AND** expired token records SHALL be cleaned up periodically

### Requirement: Development Mode Auth
The system SHALL support a development-only auth bypass for testing.

**Rationale**: Simplifies local testing without needing email infrastructure.

#### Scenario: Developer uses dev auth
- **GIVEN** the environment is set to development mode
- **WHEN** a developer accesses `/auth/dev-login?email=test@example.com`
- **THEN** a session SHALL be created immediately
- **AND** no email SHALL be sent
- **AND** the user SHALL be redirected to the dashboard

#### Scenario: Dev auth is disabled in production
- **GIVEN** the environment is set to production mode
- **WHEN** someone tries to access `/auth/dev-login`
- **THEN** a 404 Not Found response SHALL be returned
- **AND** no session SHALL be created
