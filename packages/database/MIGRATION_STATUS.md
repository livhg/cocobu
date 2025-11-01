# Database Migration Status

## ✅ Completed

1. **Migration SQL Created**: `prisma/migrations/20251028000000_init/migration.sql`
   - All 8 tables defined: users, books, memberships, entries, splits, allocations, settlements, categories
   - All indexes and foreign keys included
   - MySQL-specific syntax with utf8mb4 collation

2. **Migration Lock File**: `prisma/migrations/migration_lock.toml`
   - Provider set to MySQL

## ✅ Prisma Client Generation

`npm run db:generate` completes successfully in the current environment (Prisma Client v6.18.0).

## 🔄 Next Steps

### Option 1: Apply via Railway (Recommended)

If your Railway MySQL is already connected:

```bash
# Set your DATABASE_URL (get from Railway dashboard)
export DATABASE_URL="mysql://user:pass@host:port/database"

# Apply migration
cd packages/database
npm run migrate:deploy

# Generate Prisma client (if network allows)
npm run generate
```

### Option 2: Apply via Railway CLI

```bash
# Link to your Railway project
railway link

# Run migration in Railway environment
railway run npm run db:migrate:deploy -w @cocobu/database

# Generate client
railway run npm run db:generate -w @cocobu/database
```

### Option 3: Manual Application

If you have direct MySQL access:

```bash
# Option A: Prompt for password (recommended - avoids shell history)
mysql -h <host> -u <user> -p <database> < prisma/migrations/20251028000000_init/migration.sql

# Option B: Use environment variable
export MYSQL_PWD='your_password'
mysql -h <host> -u <user> <database> < prisma/migrations/20251028000000_init/migration.sql
unset MYSQL_PWD  # Clear password from environment after use
```

## Verification

After applying migration, verify with:

```sql
SHOW TABLES;
-- Should show: users, books, memberships, entries, splits, allocations,
--              settlements, categories, _prisma_migrations

SELECT * FROM _prisma_migrations;
-- Should show one row for migration: 20251028000000_init
```

## Build Requirement

Before building the `@cocobu/database` package or `@cocobu/api` app:
1. Migration must be applied to database
2. Prisma client must be generated
3. Both must succeed before TypeScript compilation

## Current Schema Version

- Migration: `20251028000000_init`
- Schema: `packages/database/prisma/schema.prisma`
- Engine Type: `library` (WASM-based for environments with limited network)

## Future Optimizations

### UUID Storage Optimization

**Current Implementation**: UUIDs stored as `CHAR(36)` (e.g., "550e8400-e29b-41d4-a716-446655440000")

**Potential Optimization**: Use `BINARY(16)` with MySQL 8.0+ UUID functions
```sql
-- Example for future migration:
-- Instead of: `id` CHAR(36)
-- Use: `id` BINARY(16)
--
-- With functions: UUID_TO_BIN(uuid, 1) and BIN_TO_UUID(binary, 1)
```

**Benefits**:
- 55% storage reduction (16 bytes vs 36 bytes)
- Better index performance due to smaller key size
- Reduced memory footprint for index pages

**Trade-offs**:
- Requires MySQL 8.0+
- Less human-readable in raw queries
- Needs application-level conversion functions
- Prisma doesn't natively support BINARY UUIDs (requires custom types)

**Decision**: Keep `CHAR(36)` for MVP. Consider optimization if:
- Performance profiling shows UUID index bottlenecks
- Database size exceeds 100GB
- Query performance degrades on UUID lookups

**Note**: This would require a schema migration and is not backward compatible.
