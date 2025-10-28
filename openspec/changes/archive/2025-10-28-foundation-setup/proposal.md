# Proposal: Foundation Setup

## Change ID
`foundation-setup`

## Summary
Initialize the CocoBu project with a full-stack foundation: Next.js frontend, NestJS backend API, PostgreSQL database with Prisma ORM, basic authentication scaffold, and CI/CD pipeline. This establishes the technical baseline for all future feature development.

## Motivation

### Problem
CocoBu is currently an empty repository with only OpenSpec framework and project documentation. To begin implementing features, we need:

1. **Project structure** - Monorepo setup with clear separation between frontend and backend
2. **Database foundation** - Complete schema for all core entities (users, books, memberships, entries, splits, allocations, settlements, categories)
3. **Authentication** - Basic user auth to enable multi-user features and privacy controls
4. **Development workflow** - CI/CD to ensure code quality and streamline deployments
5. **Type safety** - End-to-end TypeScript with Prisma for type-safe database access

### Why Now
This is the essential first step. Without this foundation:
- No features can be built or tested
- No user flows can be validated
- No data model can be proven
- No deployments can happen

All future OpenSpec changes (personal books, split books, settlements) depend on this infrastructure.

## Proposed Solution

### High-Level Approach
Create a **monorepo** structure with three main packages:

```
cocobu/
├── apps/
│   ├── web/          # Next.js frontend (Vercel deployment)
│   └── api/          # NestJS backend (Fly.io/Railway deployment)
├── packages/
│   ├── database/     # Prisma schema + migrations
│   └── types/        # Shared TypeScript types
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docker-compose.yml # Local dev environment
```

### Key Components

#### 1. Frontend (Next.js)
- **App Router** with TypeScript
- **Tailwind CSS + Radix UI** component library
- **TanStack Query** for server state
- **Zustand** for client state
- **PWA** configuration (for M2, but scaffold now)

#### 2. Backend (NestJS)
- **REST API** with OpenAPI/Swagger documentation
- **Prisma** ORM with MySQL
- **JWT-based auth** with magic link flow
- **Validation** with class-validator

#### 3. Database Schema
Complete Prisma schema including:
- Core entities: User, Book, Membership, Entry, Split, Allocation, Settlement, Category
- Proper relationships and indexes
- Audit fields: created_at, updated_at, version
- Encrypted field support (email, real_name)
- MySQL-compatible field types (DECIMAL for money, TEXT for JSON)

#### 4. Authentication
- Magic link email-based auth (passwordless)
- JWT token generation and validation
- Auth guards for protected routes
- User session management

#### 5. CI/CD
- **Linting**: ESLint, Prettier
- **Type checking**: TypeScript strict mode
- **Testing**: Vitest (unit), Playwright (e2e placeholder)
- **Database**: Migration validation
- **Build**: Verify both apps build successfully

### What This Does NOT Include
- Feature implementations (personal books, split books, etc.)
- UI designs or actual pages beyond auth/landing
- Production deployment configs (environment-specific)
- Full test coverage (only scaffolding)

## Impact Analysis

### User Impact
- **Users**: No direct impact yet (no users exist)
- **Future development**: Enables all feature work

### System Impact
- **New dependencies**: Next.js, NestJS, Prisma, MySQL, numerous npm packages
- **Infrastructure**: Requires MySQL in dev and prod
- **Complexity**: Introduces monorepo tooling (turborepo or nx)

### Migration Required
- None (greenfield)

### Breaking Changes
- None

### Performance Considerations
- Database indexes planned for common queries (book_id, user_id, occurred_on)
- Connection pooling configured in Prisma
- Stateless JWTs for sessions, removing the need for server-side caching

### Security Considerations
- All passwords/secrets in environment variables
- Database encryption for PII fields (email, name)
- CORS configuration for API
- Rate limiting on auth endpoints
- SQL injection protection (Prisma parameterized queries)

## Alternatives Considered

### Alternative 1: Separate Repos for Frontend/Backend
**Pros**: Simpler deployment, clearer boundaries
**Cons**: Harder to share types, more tooling overhead, slower development
**Decision**: Rejected - Monorepo provides better DX and type safety

### Alternative 2: Use tRPC Instead of REST API
**Pros**: End-to-end type safety, less boilerplate
**Cons**: Less standard, harder to document, requires tight coupling
**Decision**: Rejected - REST + OpenAPI provides better interoperability and documentation

### Alternative 3: Start with Minimal Schema, Add Later
**Pros**: Faster initial setup
**Cons**: Forces multiple migration cycles, harder to validate data model early
**Decision**: Rejected - Full schema now validates the domain model and prevents rework

### Alternative 4: Use Supabase or Firebase
**Pros**: Faster setup, built-in auth, real-time features
**Cons**: Vendor lock-in, less control, harder to implement complex business logic (mirror entries, settlement algorithm)
**Decision**: Rejected - Custom backend needed for core domain logic

## Open Questions

### Resolved
None yet.

### Unresolved
1. **Monorepo tool**: Turborepo vs. Nx vs. npm workspaces only?
   - Turborepo is simpler, Nx has more features
   - Recommendation: **Turborepo** for simplicity

2. **Auth provider**: Self-hosted magic link vs. Clerk vs. Auth0?
   - Self-hosted: More control, privacy-first
   - Clerk/Auth0: Faster setup, more features
   - Recommendation: **Self-hosted with nodemailer** for MVP (aligns with privacy-first principle)

3. **Email service**: Resend vs. SendGrid vs. SES?
   - Resend: Modern, developer-friendly
   - SendGrid/SES: Established, reliable
   - Recommendation: **Resend** for development, can switch later

4. **Hosting**: Fly.io vs. Railway vs. Render?
   - All support PostgreSQL + Redis
   - Recommendation: **Railway** for simplicity in MVP, Fly.io for production scale

## Success Criteria

### Acceptance Criteria
1. ✅ Monorepo structure with functional build system
2. ✅ Next.js app with basic landing page and login flow
3. ✅ NestJS API with health check and auth endpoints
4. ✅ Complete Prisma schema with initial migration
5. ✅ MySQL running in docker-compose
6. ✅ Magic link authentication working end-to-end
7. ✅ CI pipeline passing (lint, type-check, build)
8. ✅ OpenAPI documentation accessible at `/api/docs`
9. ✅ README with setup instructions

### Testing & Validation
- Developer can clone repo, run `npm install`, `docker-compose up`, and access app
- User can receive magic link email and authenticate
- API returns proper OpenAPI schema
- All TypeScript builds without errors
- CI pipeline runs in <5 minutes

### Rollback Plan
- Delete the change branch
- Repository remains in initial state with only OpenSpec framework

## Timeline Estimate
**Effort**: 2-3 days for experienced developer
- Day 1: Monorepo setup, Next.js + NestJS scaffolding, Prisma schema
- Day 2: Auth implementation, docker-compose, CI/CD
- Day 3: Testing, documentation, validation

## Related Changes
None (this is the first change)

## References
- `openspec/project.md` - Complete tech stack and architecture decisions
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
