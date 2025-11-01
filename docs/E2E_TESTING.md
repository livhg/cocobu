# End-to-End Testing Guide

This document provides a comprehensive guide for testing the CocoBu application from a fresh setup.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- Git

## Test Scenario: Fresh Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/livhg/cocobu.git
cd cocobu

# Verify directory structure
ls -la
# Expected: apps/, packages/, openspec/, docker-compose.yml, package.json
```

**Expected Result**: ✅ Repository cloned successfully, all directories present

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# Expected duration: 1-2 minutes
```

**Expected Result**: ✅ All dependencies installed without errors

**Validation**:
```bash
# Check that node_modules exists
test -d node_modules && echo "✅ Dependencies installed"

# Verify workspaces
npm list --depth=0
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - JWT_SECRET
# - FRONTEND_URL
# - NEXT_PUBLIC_API_URL (include /api prefix)
```

**Expected Result**: ✅ `.env` file created with valid configuration

### Step 4: Start Database

```bash
# Start MySQL with Docker Compose
docker-compose up -d

# Verify MySQL is running
docker-compose ps
# Expected: mysql service status "Up"

# Check logs
docker-compose logs mysql | tail -20
```

**Expected Result**: ✅ MySQL container running on port 3306

**Validation**:
```bash
# Test connection
docker-compose exec mysql mysql -u root -ppassword -e "SELECT 1;"
# Expected: Returns 1
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate:deploy

# Expected: All migrations applied successfully
```

**Expected Result**: ✅ Database schema created with all tables

**Validation**:
```bash
# Verify tables exist
docker-compose exec mysql mysql -u root -ppassword cocobu -e "SHOW TABLES;"
# Expected: users, books, memberships, entries, splits, allocations, settlements, categories
```

### Step 6: Seed Test Data (Optional)

```bash
# Populate database with sample data
npm run db:seed

# Expected output:
# ✅ Created 3 users
# ✅ Created 3 books
# ✅ Created 3 categories
# ✅ Created 7 entries
```

**Expected Result**: ✅ Test data created successfully

**Validation**:
```bash
# Check test users
docker-compose exec mysql mysql -u root -ppassword cocobu -e "SELECT user_id, name FROM users;"
# Expected: demo user IDs present
```

### Step 7: Start Development Servers

```bash
# Start all services
npm run dev

# This starts:
# - API server on http://localhost:4000
# - Web server on http://localhost:3000
```

**Expected Result**: ✅ Both servers start without errors

**Validation**:
```bash
# Test API health (in new terminal)
curl http://localhost:4000/api/docs
# Expected: Swagger UI HTML

# Test frontend
curl http://localhost:3000
# Expected: HTML response
```

### Step 8: Test Login Flow (End-to-End)

#### 8.1 Access Landing Page

1. Open browser to `http://localhost:3000`
2. Verify landing page loads with:
   - Project title "CocoBu 叩叩簿"
   - Description
   - "Get Started" or "Login" button

**Expected Result**: ✅ Landing page displays correctly

#### 8.2 Claim User ID

1. Click "Login" button
2. Enter test user ID: `alice`
3. Submit form

**Expected Result**: ✅ Redirected directly to the dashboard

**Development Shortcut**:
```bash
# Use dev-login endpoint
curl -v "http://localhost:4000/api/auth/dev-login?userId=alice" \
  -c cookies.txt
# Expected: Set-Cookie header with session token
```

**Expected Result**: ✅ Dashboard accessible with shared `alice` session

#### 8.4 Access Protected Dashboard

1. Browser should redirect to `/dashboard`
2. Verify dashboard displays:
   - Welcome message with user name
   - User's books list
   - "Create Book" button
   - Logout button

**Expected Result**: ✅ Dashboard accessible with authenticated session

**Validation**:
```bash
# Test /users/me endpoint
curl -b cookies.txt http://localhost:4000/api/users/me
# Expected: User profile JSON
```

### Step 9: Test Creating a Book

1. In dashboard, click "Create Book" button
2. Fill in form:
   - Name: "Test Book"
   - Type: Personal or Split
   - Currency: TWD
3. Submit form

**Expected Result**: ✅ Book created and appears in list

**Validation**:
```bash
# Check database
docker-compose exec mysql mysql -u root -ppassword cocobu -e "SELECT name, type FROM books;"
# Expected: "Test Book" appears in results
```

### Step 10: Test Logout

1. Click "Logout" button in navigation
2. Verify redirect to login page
3. Try accessing `/dashboard` directly

**Expected Result**:
- ✅ Logged out successfully
- ✅ Accessing `/dashboard` redirects to login

## Performance Testing

### Startup Time

```bash
# Measure API startup
time npm run dev --workspace=apps/api

# Expected: < 10 seconds
```

### Build Time

```bash
# Measure build time
time npm run build

# Expected: < 2 minutes (with caching)
```

### Bundle Size

```bash
# Check Next.js bundle
npm run build --workspace=apps/web

# Review output for bundle sizes
# Expected: First Load JS < 200 KB for main pages
```

## CI Pipeline Testing

```bash
# Trigger CI locally (requires GitHub Actions runner)
git push origin [branch-name]

# Monitor CI at: https://github.com/livhg/cocobu/actions
```

**Expected Results**:
- ✅ Lint job passes (< 1 min)
- ✅ Type check passes (< 1 min)
- ✅ Build job passes (< 3 min)
- ✅ Test job passes (< 2 min)
- ✅ Total CI time: < 5 minutes

## Known Issues & Limitations

### Database Connection
- **Issue**: Prisma client generation may fail with network restrictions
- **Workaround**: Use `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` environment variable

### Development Email
- **Issue**: Emails not sent in development mode
- **Workaround**: Magic links logged to console, use `/auth/dev-login` endpoint

### Rate Limiting
- **Issue**: Rate limiting is enabled globally (3 requests/hour)
- **Testing**: May need to clear rate_limits table between tests
- **Workaround**: Use dev-login endpoint which bypasses rate limiting

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 4000
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Database Connection Refused
```bash
# Restart Docker container
docker-compose restart mysql

# Check MySQL logs
docker-compose logs mysql --tail=50
```

### Prisma Client Not Generated
```bash
# Force regenerate
rm -rf node_modules/.prisma
npm run db:generate
```

### Build Failures
```bash
# Clean and rebuild
npm run clean  # if available
rm -rf node_modules
npm install
npm run build
```

## Success Criteria

All tests pass if:
- ✅ Fresh clone to working app in < 10 minutes
- ✅ All dependencies install without errors
- ✅ Database migrations apply cleanly
- ✅ Both servers start successfully
- ✅ Complete login flow works end-to-end
- ✅ Book creation works
- ✅ CI pipeline passes in < 5 minutes

## Notes

This guide was tested on:
- **OS**: Ubuntu 22.04, macOS 14
- **Node**: v18.17.0
- **npm**: v9.6.7
- **Docker**: v24.0.5

Last Updated: 2025-10-29
