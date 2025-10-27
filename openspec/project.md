# Project Context

## Purpose

**CocoBu 叩叩簿** (CocoBu - "Coco" = money in Taiwanese, "Bu" = "簿" meaning ledger)

A "same source, different views" expense tracking system for individuals and groups. Write split expenses once, and personal ledgers sync automatically. Core goals:

- **Super simple**: Web-based, no installation, keyboard-first, offline-capable
- **Personal + Group**: Personal expense books AND group split books with automatic mirroring
- **Smart splitting**: Ratio/percentage/share-based splits with reusable default patterns
- **Privacy-first**: No ads, no tracking, GDPR-friendly, data minimization

**Key differentiation**: Solving pain points in existing apps (Splitwise, YNAB, Mint):
- Reusable split patterns (not re-entering 60/40 every time)
- Flexible categories and periods (not rigid monthly calendars)
- No forced bank integration (avoiding vendor lock-in and shutdown risk)
- No ads, no daily entry limits

## Tech Stack

### Frontend
- **Next.js** + React + TypeScript
- **State Management**: TanStack Query (server state), Zustand (client state)
- **UI**: Tailwind CSS + Radix UI
- **PWA**: Offline drafts, installable to desktop
- **Deployment**: Vercel

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: MySQL with Prisma ORM
- **API**: OpenAPI/Swagger documentation
- **Deployment**: Fly.io or Railway

### Infrastructure
- **Storage**: Cloudflare R2 (receipts/attachments)
- **Auth**: OIDC / Magic link
- **Security**: TLS everywhere, encrypted MySQL fields (email, real name)

## Project Conventions

### Code Style
- **TypeScript strict mode**: All code must be strongly typed
- **Naming**:
  - Use "簿" (book) terminology consistently (旅遊簿, 家用簿, 室友簿)
  - Database: snake_case
  - Code: camelCase (TS/JS), PascalCase (components)
- **Linting**: ESLint + Prettier
- **Accessibility**: Keyboard navigation, ARIA labels, color-blind safe palettes

### Architecture Patterns

#### Event-Driven Mirror System
- **Split books** contain source entries
- When a split entry is created, **mirror entries** are automatically generated in each participant's personal book
- Mirror entries are read-only (use adjustment entries for corrections)
- Editing source entry triggers event-sourced recalculation of all mirrors

#### Core Entities
- `User`: Users with email/name
- `Book`: type ∈ {personal, split}, has currency, owner
- `Membership`: Links users to books with roles (owner/admin/writer/reader)
- `Entry`: Amount, currency, category, note, occurred_on, optional source_entry_id
- `Split`: Attached to entry, mode ∈ {ratio, shares, exact}
- `Allocation`: Per-user split details (ratio%, shares, or exact amount)
- `Settlement`: Period snapshot with net balances and minimum transfer paths

#### Data Consistency
- **Optimistic locking**: Entry versioning for concurrent edits
- **Rounding strategy**: Banker's rounding or floor-to-cent with differential compensation (absorbed by payer or "nearest person")
- **Event store**: Full audit trail with event replay capability
- **Validation**: Sum of allocations must equal 100% (ratio) or total amount (exact)

#### Settlement Algorithm
- Build debt graph: who owes whom
- Calculate net positions per user
- Apply greedy matching (debtors ↔ creditors) or min-cost flow for near-optimal minimum transfers

### Testing Strategy
- **Edge cases to validate**:
  - Ratio/shares/exact split modes with rounding
  - Multi-currency conversion and display
  - Negative amounts (refunds/income splits)
  - Mid-period member additions
  - Tax and service fee distribution
- **Test data**: Sample books for travel (花蓮旅遊), roommates (室友簿)
- **Integration tests**: Entry → Split → Mirror flow
- **Settlement tests**: Multi-party, multi-entry scenarios

### Git Workflow
- **Branching**: Feature branches from main
- **Commits**: Conventional commits (feat:, fix:, refactor:, etc.)
- **All significant changes**: Use OpenSpec proposals before implementation

## Domain Context

### Book Types
- **Personal Book**: User's own income/expense ledger
- **Split Book**: Group expense book with multiple members

### Roles & Permissions
| Role | Can Delete Book | Manage Members | Manage Categories | Create Entries | View |
|------|----------------|----------------|-------------------|----------------|------|
| owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| admin | ✗ | ✓ | ✓ | ✓ | ✓ |
| writer | ✗ | ✗ | ✗ | ✓ | ✓ |
| reader | ✗ | ✗ | ✗ | ✗ | ✓ |

### Split Modes
1. **Ratio**: Percentage-based (60% / 40%)
2. **Shares**: Count-based (2 shares / 1 share → 66.67% / 33.33%)
3. **Exact**: Fixed amounts per person (must sum to total)

### Default Split Patterns
- **Book-level defaults**: e.g., always split 60/40 for this roommate book
- **Period-based patterns**: e.g., equal split during May 1-15 when all 4 people traveled together
- Solves repeated data entry pain point

### Currency Handling
- Each book has a base currency
- Entries can specify original currency + exchange rate
- Store both original amount and converted amount

### Visibility Rules
- Personal books: Only owner can see
- Split books: Members see group totals and their own allocations, NOT other members' personal data

## Important Constraints

### MVP Scope
- **No automatic bank sync**: Manual entry only (avoid vendor risk like Mint shutdown)
- **Optional bank import later**: As opt-in feature, not core dependency
- **No ads**: Privacy-first, no tracking scripts
- **No daily entry limits**: Unlike freemium apps

### Privacy & Security
- **GDPR compliance**: User consent, data export/deletion
- **Encrypted fields**: email, real_name in PostgreSQL
- **No third-party tracking**: No analytics scripts, no ad networks
- **TLS mandatory**: All communication encrypted
- **Audit trail**: Full event log for compliance

### Performance Targets
- **<100 lines per change**: Default to simple, single-file implementations
- **Proven patterns**: Avoid frameworks without justification
- **Scale considerations**: Design for <1000 users, <100MB data initially (add complexity only when proven needed)

### Internationalization
- **Languages**: Chinese (Traditional) + English
- **Terminology**: Use "簿" consistently in Chinese UI

## External Dependencies

### Required Services
- **MySQL 8.0+**: Primary data store
- **Cloudflare R2**: Receipt/attachment storage (S3-compatible)
- **OIDC Provider**: Auth0 / Clerk / similar for authentication

### Optional Services
- **Email delivery**: For magic links and notifications
- **Webhook targets**: Optional export to spreadsheets
- **PDF generation**: Server-side rendering for monthly reports

### No Dependencies On
- **Bank APIs**: Explicitly avoided in MVP
- **Ad networks**: Privacy-first approach
- **Proprietary sync services**: Self-hosted or standard cloud infrastructure only

## Database Schema Overview

```sql
-- Core entities (simplified)
users(id, email, name)
books(id, type, name, currency, owner_id)
memberships(id, book_id, user_id, role)
entries(id, book_id, creator_id, amount, currency, occurred_on, category_id, note, source_entry_id)
splits(id, entry_id, mode)
allocations(id, split_id, user_id, ratio, shares, exact_amount)
settlements(id, book_id, period_start, period_end, payload_jsonb)
categories(id, book_id, name)
```

## Key User Flows

### 1. Personal Expense Entry
User opens personal book → quick entry form → save → appears in ledger

### 2. Group Split Entry (Core Flow)
1. User opens split book (e.g., "花蓮旅遊")
2. Creates entry: "午餐 100 TWD"
3. Applies split: "Me 20%, Alice 30%, Bob 50%"
4. System validates: 20+30+50=100% ✓
5. System creates 3 mirror entries:
   - My personal book: [花蓮旅遊] 午餐 -20 TWD
   - Alice's personal book: [花蓮旅遊] 午餐 -30 TWD
   - Bob's personal book: [花蓮旅遊] 午餐 -50 TWD

### 3. Settlement
1. User requests settlement for period (e.g., May 1-31)
2. System calculates net positions per member
3. System generates minimum transfer paths
4. Display: "Alice owes Bob 150 TWD, Charlie owes Bob 200 TWD"
5. Export transfer instructions or mark as settled

## API Design Principles

- RESTful resources: `/books`, `/entries`, `/settlements`
- Nested routes for relationships: `/books/:id/entries`
- Idempotent operations where possible
- Optimistic concurrency: Use ETags or version fields
- Pagination: Cursor-based for entries (time-series data)

Example endpoints:
- `POST /books` - Create book
- `POST /books/:id/invite` - Invite member
- `POST /entries` - Create entry
- `POST /entries/:id/split` - Add split allocation
- `GET /books/:id/settlement?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /books/:id/settlement/generate` - Create settlement snapshot
- `GET /me/mirrors?from=YYYY-MM-DD&to=YYYY-MM-DD` - My mirror entries
- `GET /export/csv?book_id=X&from=YYYY-MM-DD&to=YYYY-MM-DD`

## Milestones

### M0: Design Validation (2 weeks)
- Interactive prototype: Personal ↔ Split book flow
- Validate ratio/shares/exact split logic
- Test rounding strategies

### M1: MVP (4-6 weeks)
- Books, memberships, entries, splits, mirrors
- Default split patterns & period-based patterns
- Settlement with minimum transfer calculation
- CSV export

### M2: Stabilization (4 weeks)
- PWA offline support
- Batch paste & templates
- PDF monthly reports

### M3: Enhancement (optional)
- Webhooks to external spreadsheets
- Optional bill import (not auto-sync)

## North Star Metrics

- **Primary**: Effective entries per MAU × Active split book ratio
- **Key ratios**:
  - Split entry → mirror generation success rate
  - Settlement completion rate (one-shot)
  - Default split pattern usage rate
- **Retention experiments**:
  - Suggest default patterns
  - One-click "create next book" after settlement
