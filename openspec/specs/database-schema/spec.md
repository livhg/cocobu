# database-schema Specification

## Purpose
TBD - created by archiving change foundation-setup. Update Purpose after archive.
## Requirements
### Requirement: Core Entity Models
The system SHALL define Prisma models for all core entities: User, Book, Membership, Entry, Split, Allocation, Settlement, and Category.

**Rationale**: Establishes the complete data model upfront to validate domain design and prevent future schema changes.

#### Scenario: Prisma schema is complete
- **GIVEN** the Prisma schema file exists at `packages/database/prisma/schema.prisma`
- **WHEN** a developer inspects the schema
- **THEN** models SHALL exist for: User, Book, Membership, Entry, Split, Allocation, Settlement, Category
- **AND** all relationships SHALL be defined with proper foreign keys
- **AND** all fields SHALL have appropriate types and constraints

#### Scenario: Developer generates Prisma client
- **GIVEN** the Prisma schema is defined
- **WHEN** the developer runs `npm run db:generate`
- **THEN** Prisma SHALL generate a type-safe client
- **AND** TypeScript types SHALL be available for all models
- **AND** the client SHALL be importable as `@cocobu/database`

### Requirement: User Model
The system SHALL store user accounts with encrypted email and name fields using MySQL's AES encryption or application-level encryption.

**Rationale**: Protects user PII at rest in compliance with GDPR principles.

#### Scenario: User record is created
- **GIVEN** a user signs up with email and name
- **WHEN** the record is created in the database
- **THEN** the user SHALL have a UUID primary key
- **AND** email SHALL be stored with encryption
- **AND** name SHALL be stored with encryption
- **AND** `created_at` and `updated_at` timestamps SHALL be recorded

#### Scenario: User email is unique
- **GIVEN** a user exists with email "alice@example.com"
- **WHEN** another user tries to register with the same email
- **THEN** the database SHALL reject the duplicate email
- **AND** a unique constraint violation error SHALL be raised

### Requirement: Book Model
The system SHALL support two book types (personal, split) with currency and ownership.

**Rationale**: Books are the primary organizational unit for both personal expenses and group splits.

#### Scenario: Personal book is created
- **GIVEN** a user wants to track personal expenses
- **WHEN** they create a book with type "personal"
- **THEN** the book SHALL have a unique UUID
- **AND** the book type SHALL be "personal"
- **AND** the currency SHALL default to "TWD"
- **AND** the owner_id SHALL reference the creating user

#### Scenario: Split book is created
- **GIVEN** a user wants to create a group expense book
- **WHEN** they create a book with type "split" and name "花蓮旅遊"
- **THEN** the book type SHALL be "split"
- **AND** the book SHALL support multiple memberships
- **AND** the book SHALL allow split entries

### Requirement: Membership Model
The system SHALL link users to books with roles (owner, admin, writer, reader).

**Rationale**: Implements role-based access control for collaborative books.

#### Scenario: User is added to split book
- **GIVEN** a split book exists
- **WHEN** a user is invited to the book
- **THEN** a membership record SHALL be created
- **AND** the membership SHALL have a role (owner, admin, writer, or reader)
- **AND** the `joined_at` timestamp SHALL be recorded

#### Scenario: Membership uniqueness is enforced
- **GIVEN** a user is already a member of a book
- **WHEN** attempting to add the same user again
- **THEN** the database SHALL reject the duplicate membership
- **AND** a unique constraint on (book_id, user_id) SHALL be violated

### Requirement: Entry Model
The system SHALL store expense/income entries with amount, currency, date, and optional category.

**Rationale**: Entries are the core transactional records in both personal and split books.

#### Scenario: Entry is created in personal book
- **GIVEN** a user has a personal book
- **WHEN** they create an entry with amount 100, currency "TWD", and date "2025-10-27"
- **THEN** the entry SHALL be stored with the specified values
- **AND** the creator_id SHALL reference the user
- **AND** the book_id SHALL reference the book
- **AND** version SHALL be set to 1 for optimistic locking

#### Scenario: Entry references source entry (mirror)
- **GIVEN** a split entry exists in a group book
- **WHEN** mirror entries are generated for participants
- **THEN** each mirror entry SHALL have a source_entry_id
- **AND** source_entry_id SHALL reference the original split entry
- **AND** the relationship SHALL allow querying all mirrors of a split

### Requirement: Split Model
The system SHALL support three split modes: ratio (percentage), shares (count-based), and exact (fixed amounts).

**Rationale**: Provides flexibility for different splitting scenarios (equal, unequal, custom).

#### Scenario: Ratio split is created
- **GIVEN** an entry exists with amount 100
- **WHEN** a split is created with mode "ratio"
- **THEN** the split SHALL store mode as "ratio"
- **AND** the split SHALL have a one-to-one relationship with the entry

#### Scenario: Split mode is validated
- **GIVEN** a split is being created
- **WHEN** the mode is set to an invalid value
- **THEN** Prisma SHALL reject the value
- **AND** only "ratio", "shares", or "exact" SHALL be accepted

### Requirement: Allocation Model
The system SHALL store per-user split allocations with ratio, shares, or exact amounts.

**Rationale**: Each participant in a split needs their allocation tracked separately.

#### Scenario: Ratio allocation is created
- **GIVEN** a split with mode "ratio" exists
- **WHEN** an allocation is created for a user with ratio 30
- **THEN** the allocation SHALL store ratio as 30 (representing 30%)
- **AND** shares and exact_amount SHALL be null
- **AND** calculated_amount SHALL store the computed value

#### Scenario: Shares allocation is created
- **GIVEN** a split with mode "shares" exists
- **WHEN** an allocation is created for a user with 2 shares
- **THEN** the allocation SHALL store shares as 2
- **AND** ratio and exact_amount SHALL be null

#### Scenario: Exact allocation is created
- **GIVEN** a split with mode "exact" exists
- **WHEN** an allocation is created for a user with exact_amount 25.50
- **THEN** the allocation SHALL store exact_amount as 25.50
- **AND** ratio and shares SHALL be null

### Requirement: Settlement Model
The system SHALL store settlement snapshots with period and computed balances.

**Rationale**: Settlements provide a point-in-time view of who owes whom, preserving history.

#### Scenario: Settlement is generated
- **GIVEN** a split book has entries over a period
- **WHEN** a settlement is created for the period
- **THEN** the settlement SHALL store period_start and period_end dates
- **AND** the payload (JSON) SHALL contain net balances per user
- **AND** the payload SHALL contain minimum transfer paths
- **AND** the created_at timestamp SHALL be recorded

### Requirement: Category Model
The system SHALL support custom categories per book and global categories.

**Rationale**: Categories help users organize and filter entries by type (food, transport, etc.).

#### Scenario: Book-specific category is created
- **GIVEN** a book exists
- **WHEN** a category is created with book_id
- **THEN** the category SHALL be associated with that book only
- **AND** other books SHALL NOT see this category

#### Scenario: Global category is created
- **GIVEN** the system needs default categories
- **WHEN** a category is created with book_id as null
- **THEN** the category SHALL be available to all books
- **AND** all users SHALL be able to use this category

### Requirement: Database Migrations
The system SHALL use Prisma Migrate to version control schema changes.

**Rationale**: Enables reproducible database setup and tracks schema evolution over time.

#### Scenario: Initial migration is created
- **GIVEN** the Prisma schema is complete
- **WHEN** the developer runs `npm run db:migrate:dev`
- **THEN** Prisma SHALL generate an initial migration
- **AND** the migration SQL file SHALL be created in `packages/database/prisma/migrations/`
- **AND** the migration SHALL create all tables and constraints

#### Scenario: Migration is applied to database
- **GIVEN** an unapplied migration exists
- **WHEN** the developer runs `npm run db:migrate:deploy`
- **THEN** Prisma SHALL apply the migration to the database
- **AND** a `_prisma_migrations` table SHALL track applied migrations
- **AND** the database schema SHALL match the Prisma schema

### Requirement: Database Indexes
The system SHALL create indexes on frequently queried fields to optimize performance.

**Rationale**: Prevents slow queries as data volume grows, especially for time-series queries on entries.

#### Scenario: Entry queries are optimized
- **GIVEN** users frequently query entries by book and date
- **WHEN** the database is created
- **THEN** an index SHALL exist on (book_id, occurred_on DESC)
- **AND** an index SHALL exist on (creator_id)
- **AND** an index SHALL exist on (source_entry_id) for mirror lookups

#### Scenario: Membership queries are optimized
- **GIVEN** users frequently query their books
- **WHEN** the database is created
- **THEN** an index SHALL exist on (user_id)
- **AND** an index SHALL exist on (book_id)

### Requirement: Decimal Precision
The system SHALL use DECIMAL(19,4) for all monetary amounts to avoid floating-point errors.

**Rationale**: Financial applications require exact decimal arithmetic.

#### Scenario: Amount is stored with precision
- **GIVEN** an entry amount is 123.4567
- **WHEN** the entry is saved
- **THEN** the amount SHALL be stored as 123.4567 exactly
- **AND** no rounding errors SHALL occur
- **AND** arithmetic operations SHALL maintain precision

### Requirement: Optimistic Locking
The system SHALL support optimistic locking on entries using a version field.

**Rationale**: Prevents lost updates when multiple users edit the same entry concurrently.

#### Scenario: Concurrent updates are handled
- **GIVEN** two users fetch the same entry with version 1
- **WHEN** both try to update the entry
- **THEN** the first update SHALL succeed and increment version to 2
- **AND** the second update SHALL fail with a version mismatch error
- **AND** the second user SHALL need to refetch and retry

