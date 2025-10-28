# Design: Foundation Setup

## Architecture Overview

### System Topology

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / PWA                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (Vercel)                   │
│  - App Router + React Server Components                 │
│  - TanStack Query (API calls)                           │
│  - Zustand (client state)                               │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────────────┐
│             NestJS Backend (Fly.io/Railway)             │
│  - REST Controllers + OpenAPI                           │
│  - Auth Guards (JWT)                                    │
│  - Business Logic Services                             │
│  - Prisma Client                                        │
└─────┴──────────────────────────────────────────────────┘
      │
      ▼
┌──────────────┐
│    MySQL     │
│  (Primary    │
│   Data)      │
└──────────────┘
```

## Component Design

### 1. Monorepo Structure

**Tool Choice: Turborepo**

Rationale:
- Simpler than Nx for our use case
- Built-in caching and parallel execution
- Easy to understand and maintain
- Good npm workspaces integration

```
cocobu/
├── apps/
│   ├── web/                    # Next.js app
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # Client utilities
│   │   │   └── styles/         # Global styles
│   │   ├── public/             # Static assets
│   │   └── package.json
│   └── api/                    # NestJS app
│       ├── src/
│       │   ├── auth/           # Auth module
│       │   ├── users/          # Users module
│       │   ├── books/          # Books module (stub)
│       │   ├── common/         # Shared utilities
│       │   └── main.ts         # Entry point
│       ├── test/               # E2E tests
│       └── package.json
├── packages/
│   ├── database/               # Prisma package
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts        # Prisma client export
│   │   └── package.json
│   └── types/                  # Shared types
│       ├── src/
│       │   └── index.ts        # Common DTOs
│       └── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, test, build
│       └── deploy.yml          # Deploy (placeholder)
├── docker-compose.yml          # Local PostgreSQL + Redis
├── turbo.json                  # Turborepo config
├── package.json                # Root package
└── README.md
```

### 2. Database Schema Design

**Full Entity-Relationship Model**

```
User (users)
├─ id: UUID (PK)
├─ email: String (encrypted, unique)
├─ name: String (encrypted)
├─ created_at: DateTime
├─ updated_at: DateTime
└─ Relationships:
   ├─ books: Book[] (via owner_id)
   ├─ memberships: Membership[]
   ├─ created_entries: Entry[] (via creator_id)
   └─ allocations: Allocation[]

Book (books)
├─ id: UUID (PK)
├─ type: Enum (personal, split)
├─ name: String
├─ currency: String (default: TWD)
├─ owner_id: UUID (FK → users)
├─ created_at: DateTime
├─ updated_at: DateTime
└─ Relationships:
   ├─ owner: User
   ├─ memberships: Membership[]
   ├─ entries: Entry[]
   ├─ settlements: Settlement[]
   └─ categories: Category[]

Membership (memberships)
├─ id: UUID (PK)
├─ book_id: UUID (FK → books)
├─ user_id: UUID (FK → users)
├─ role: Enum (owner, admin, writer, reader)
├─ joined_at: DateTime
└─ Relationships:
   ├─ book: Book
   └─ user: User
└─ Unique: (book_id, user_id)

Entry (entries)
├─ id: UUID (PK)
├─ book_id: UUID (FK → books)
├─ creator_id: UUID (FK → users)
├─ amount: Decimal (precision: 19, scale: 4)
├─ currency: String
├─ occurred_on: Date
├─ category_id: UUID? (FK → categories)
├─ note: String?
├─ source_entry_id: UUID? (FK → entries, for mirrors)
├─ version: Int (optimistic locking)
├─ created_at: DateTime
├─ updated_at: DateTime
└─ Relationships:
   ├─ book: Book
   ├─ creator: User
   ├─ category: Category?
   ├─ split: Split?
   ├─ source_entry: Entry? (self-reference)
   └─ mirror_entries: Entry[] (reverse)

Split (splits)
├─ id: UUID (PK)
├─ entry_id: UUID (FK → entries, unique)
├─ mode: Enum (ratio, shares, exact)
├─ created_at: DateTime
└─ Relationships:
   ├─ entry: Entry (1:1)
   └─ allocations: Allocation[]

Allocation (allocations)
├─ id: UUID (PK)
├─ split_id: UUID (FK → splits)
├─ user_id: UUID (FK → users)
├─ ratio: Decimal? (0-100, for ratio mode)
├─ shares: Int? (for shares mode)
├─ exact_amount: Decimal? (for exact mode)
├─ calculated_amount: Decimal (computed)
└─ Relationships:
   ├─ split: Split
   └─ user: User

Settlement (settlements)
├─ id: UUID (PK)
├─ book_id: UUID (FK → books)
├─ period_start: Date
├─ period_end: Date
├─ payload: JSON (net balances, transfer paths)
├─ created_at: DateTime
└─ Relationships:
   └─ book: Book

Category (categories)
├─ id: UUID (PK)
├─ book_id: UUID? (FK → books, null = global)
├─ name: String
├─ color: String?
├─ icon: String?
└─ Relationships:
   ├─ book: Book?
   └─ entries: Entry[]
```

**Key Design Decisions**

1. **UUID Primary Keys**: Better for distributed systems, harder to enumerate (stored as CHAR(36) in MySQL)
2. **Decimal for Money**: Avoid floating-point errors (precision 19, scale 4 supports up to 999,999,999,999,999.9999)
3. **Separate Currency Fields**: Store original currency + converted amount for transparency
4. **Soft Deletes**: Not in MVP (can add later with `deleted_at` field)
5. **Optimistic Locking**: `version` field on entries to handle concurrent edits
6. **Self-Referential Mirror**: `source_entry_id` links mirror entries to original split entries
7. **JSON Storage**: Use MySQL 8.0 native JSON type for Settlement payload

### 3. Authentication Flow

**Magic Link Implementation**

```
┌──────┐                 ┌──────────┐              ┌───────┐
│Client│                 │   API    │              │ Email │
└──┬───┘                 └────┬─────┘              └───┬───┘
   │                          │                        │
   │ POST /auth/login         │                        │
   │ { email }                │                        │
   ├─────────────────────────>│                        │
   │                          │ Generate token         │
   │                          │ (JWT, 15min expiry)    │
   │                          │                        │
   │                          │ Send magic link        │
   │                          ├───────────────────────>│
   │                          │                        │
   │ 200 OK                   │                        │
   │<─────────────────────────┤                        │
   │                          │                        │
   │                          │   User clicks link     │
   │                          │<───────────────────────┤
   │                          │                        │
   │ GET /auth/verify?token=  │                        │
   ├─────────────────────────>│                        │
   │                          │ Validate token         │
   │                          │ Create session         │
   │                          │ (JWT, 7d expiry)       │
   │                          │                        │
   │ 302 Redirect + Set-Cookie│                        │
   │<─────────────────────────┤                        │
   │                          │                        │
```

**JWT Payload Structure**

```typescript
interface MagicLinkToken {
  type: 'magic-link';
  email: string;
  exp: number; // 15 minutes
}

interface SessionToken {
  type: 'session';
  sub: string; // user.id
  email: string;
  exp: number; // 7 days
}
```

**Security Considerations**
- Magic link tokens expire in 15 minutes
- Session tokens expire in 7 days
- Tokens are single-use (tracked in database)
- Rate limiting: 3 requests per email per hour (tracked in database)
- HTTPS only for cookies (secure flag)
- HttpOnly cookies to prevent XSS

### 4. API Design Patterns

**Module Structure (NestJS)**

Each domain module follows this pattern:

```
src/books/
├── books.controller.ts      # REST endpoints
├── books.service.ts         # Business logic
├── books.module.ts          # Module definition
├── dto/
│   ├── create-book.dto.ts   # Input validation
│   └── book-response.dto.ts # Output serialization
└── entities/
    └── book.entity.ts       # Domain model (if needed)
```

**REST Conventions**

```
GET    /api/books              # List user's books
POST   /api/books              # Create book
GET    /api/books/:id          # Get book details
PATCH  /api/books/:id          # Update book
DELETE /api/books/:id          # Delete book

POST   /api/books/:id/invite   # Invite member
GET    /api/books/:id/members  # List members

GET    /api/entries            # List entries (with filters)
POST   /api/entries            # Create entry
GET    /api/entries/:id        # Get entry
PATCH  /api/entries/:id        # Update entry
DELETE /api/entries/:id        # Delete entry

POST   /api/entries/:id/split  # Add split to entry
```

**Response Format**

Success:
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-27T18:00:00Z"
  }
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  },
  "meta": {
    "timestamp": "2025-10-27T18:00:00Z"
  }
}
```

### 5. Frontend Architecture

**Data Fetching Strategy**

```typescript
// TanStack Query for server state
const { data: books } = useQuery({
  queryKey: ['books'],
  queryFn: () => api.books.list()
});

// Zustand for client state
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));
```

**Component Structure**

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── verify/
│   ├── (dashboard)/
│   │   ├── books/
│   │   └── layout.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                # Radix UI primitives
│   ├── forms/             # Form components
│   └── layouts/           # Layout components
└── lib/
    ├── api/               # API client
    ├── hooks/             # Custom hooks
    └── utils/             # Utilities
```

### 6. CI/CD Pipeline

**GitHub Actions Workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

## Technology Justifications

### Why Next.js App Router?
- Server Components reduce client bundle size
- Built-in routing and layouts
- Easy deployment to Vercel
- Progressive enhancement support

### Why NestJS?
- Enterprise-ready architecture
- Built-in dependency injection
- OpenAPI/Swagger integration
- Modular structure scales well

### Why Prisma?
- Type-safe database access
- Migration management
- Excellent TypeScript support
- Good performance with proper indexes
- MySQL 8.0+ support with full feature compatibility

### Why Turborepo?
- Simple configuration
- Fast incremental builds
- Shared caching across team
- Works well with npm workspaces

## Performance Considerations

### Database Indexes

```sql
-- Critical indexes for MVP
CREATE INDEX idx_entries_book_occurred ON entries(book_id, occurred_on DESC);
CREATE INDEX idx_entries_creator ON entries(creator_id);
CREATE INDEX idx_entries_source ON entries(source_entry_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_book ON memberships(book_id);
CREATE INDEX idx_allocations_split ON allocations(split_id);
CREATE INDEX idx_allocations_user ON allocations(user_id);
```

### Connection Pooling

```typescript
// Prisma connection pool for MySQL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20'
    }
  }
});
```

### Caching Strategy

- **Database-backed**: Rate limit counters stored in database table with TTL cleanup
- **TanStack Query**: Client-side cache with 5min stale time
- **Next.js**: Static generation for landing pages
- **Stateless JWT**: No server-side session storage needed

## Security Measures

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=mysql://user:password@localhost:3306/cocobu
JWT_SECRET=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Rate Limiting

```typescript
// Auth endpoints: 3 requests per email per hour
@UseGuards(RateLimitGuard)
@RateLimit({ points: 3, duration: 3600, keyPrefix: 'auth' })
@Post('login')
async login(@Body() dto: LoginDto) {
  // ...
}
```

### Input Validation

```typescript
// Example DTO with class-validator
export class CreateBookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEnum(BookType)
  type: BookType;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;
}
```

## Testing Strategy

### Unit Tests
- **Backend**: Service layer logic (Vitest + mocks)
- **Frontend**: Component behavior (Vitest + Testing Library)
- **Database**: Prisma model validations

### Integration Tests
- **Backend**: API endpoints with test database (Vitest + Supertest)
- **Frontend**: User flows (Playwright - placeholder for now)

### Test Database
```bash
# Use separate test database
DATABASE_URL=mysql://root:test@localhost:3306/cocobu_test
```

## Open Technical Questions

1. **File upload handling**: Where to store receipt images?
   - **Decision**: Cloudflare R2 (defer to later change)

2. **Email template system**: Plain text or HTML?
   - **Recommendation**: Start with plain text, add HTML in M2

3. **Logging**: Winston vs. Pino?
   - **Recommendation**: NestJS built-in logger for MVP

4. **Error tracking**: Sentry?
   - **Recommendation**: Add in M2

## Success Metrics

- ✅ `npm run dev` starts both apps in <10 seconds
- ✅ All TypeScript compiles without errors
- ✅ API documentation accessible at `/api/docs`
- ✅ Database migrations apply cleanly
- ✅ CI pipeline runs in <5 minutes
- ✅ Zero security vulnerabilities in `npm audit`
