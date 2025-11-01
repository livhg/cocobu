# Specification Delta: Authentication

## Overview
Updates the MVP authentication flow to let users claim a user ID directly without relying on email delivery or magic link tokens.

## RENAMED Requirements

### Requirement: Magic Link Login -> User ID Claim Login
The system SHALL let users authenticate by entering a user ID instead of requesting an email-based magic link.

**Rationale**: Eliminates the dependency on email infrastructure so the MVP can be tested immediately.

#### Scenario: First-time user claims an ID
- **GIVEN** a visitor is on the login page
- **WHEN** they enter a user ID that matches slug rules and submit
- **THEN** the system SHALL create a new User record (if not existing)
- **AND** the system SHALL start a session for that user
- **AND** the user SHALL be redirected to the dashboard immediately

#### Scenario: Returning user reuses an ID
- **GIVEN** a user previously logged in with the ID "bujiro"
- **WHEN** another session submits the same ID
- **THEN** the system SHALL load the existing User record
- **AND** the system SHALL start a session bound to that record
- **AND** the dashboard SHALL show the same data shared under that ID

#### Scenario: Invalid ID submission
- **GIVEN** a visitor enters an ID containing disallowed characters (e.g., spaces or emoji)
- **WHEN** they submit the form
- **THEN** the system SHALL reject the request with a validation error
- **AND** the response SHALL explain allowed characters (lowercase letters, numbers, hyphen)

## ADDED Requirements

### Requirement: User ID Validation
The system SHALL enforce simple slug rules on user IDs to keep them URL-safe.

**Rationale**: Prevents later migrations when building profile URLs or shared book links.

#### Scenario: Valid ID passes validation
- **GIVEN** an ID `my-friend-2`
- **WHEN** the login request is processed
- **THEN** the system SHALL accept the ID
- **AND** the normalized ID SHALL be stored exactly as submitted

#### Scenario: ID too short
- **GIVEN** an ID with fewer than 3 characters
- **WHEN** the login request is processed
- **THEN** the system SHALL return a validation error stating "User ID must be at least 3 characters"
- **AND** no session SHALL be created

## MODIFIED Requirements

### Requirement: Session Management
The system SHALL continue to use JWT tokens with HTTP-only cookies, encoding the claimed user ID instead of an email address.

**Rationale**: Keeps session handling intact while aligning payload with the new login model.

#### Scenario: Authenticated request is made
- **GIVEN** a user session cookie contains the user ID `bujiro`
- **WHEN** the API receives a request with that cookie
- **THEN** the system SHALL verify the JWT signature
- **AND** the system SHALL look up the user by the embedded ID
- **AND** the request SHALL be authorized for that user

#### Scenario: Session token expires
- **GIVEN** a session token older than 7 days
- **WHEN** it is presented to the API
- **THEN** the system SHALL reject it with 401 Unauthorized
- **AND** the client SHALL prompt the user to re-enter their user ID

### Requirement: User Registration
The system SHALL automatically create user accounts the first time an ID is claimed, without storing email addresses.

**Rationale**: Supports instant onboarding with only a user ID.

#### Scenario: New user logs in
- **GIVEN** the user ID `sunny-day` has never been seen before
- **WHEN** the login request succeeds
- **THEN** a new User record SHALL be created with `userId = "sunny-day"`
- **AND** no email field SHALL be required or stored
- **AND** a session SHALL begin immediately

#### Scenario: Existing user logs in
- **GIVEN** a User record already exists with `userId = "bujiro"`
- **WHEN** someone logs in using `bujiro`
- **THEN** the existing record SHALL be reused
- **AND** no duplicate user SHALL be created

### Requirement: Development Mode Auth
The system SHALL expose a development-only helper that accepts a `userId` query parameter.

**Rationale**: Keeps developer tooling aligned with the new login semantics.

#### Scenario: Developer uses dev auth
- **GIVEN** the environment is development
- **WHEN** a developer visits `/auth/dev-login?userId=test-user`
- **THEN** the system SHALL create or load the `test-user` record
- **AND** the session SHALL be established without email

## REMOVED Requirements

### Requirement: Rate Limiting
**Reason**: Email-based abuse vectors no longer exist once login happens entirely on the client.
**Migration**: Delete rate-limiting logic tied to magic link requests; keep infrastructure ready for future reintroduction.

### Requirement: Email Delivery
**Reason**: MVP login does not send any emails.
**Migration**: Remove SMTP configuration and related environment variables from the authentication module.

### Requirement: Token Storage
**Reason**: Magic link tokens are no longer generated or tracked.
**Migration**: Drop the database table or entity that stored one-time tokens.
