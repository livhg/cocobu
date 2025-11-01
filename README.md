# CocoBu 叩叩簿

> **會記住你分帳習慣的記帳工具**
> The expense tracker that learns your split patterns

A "same source, different views" expense tracking system for individuals and groups.

---

## ✨ Why CocoBu?

### The Problem We Solve

**Tired of repeatedly entering "60/40" or "split equally" for every single expense?**

Existing expense tracking apps force you to:
- ❌ Manually enter split ratios every time (Splitwise)
- ❌ Keep personal and group expenses in separate apps
- ❌ Deal with ads and data tracking (free apps)
- ❌ Worry about service shutdowns like Mint (2024)

### Our Solution

**CocoBu lets you set split patterns once and reuse them forever.**

✅ **Reusable Split Patterns** - Set "60/40 for gas, equal for meals" once, apply to all expenses
✅ **Auto-Sync to Personal Book** - Group expenses automatically mirror to your personal ledger
✅ **Privacy-First** - No ads, no tracking, no bank integration, your data stays yours
✅ **One-Click Settlement** - Minimum transfer calculation, no more complicated splits

---

## 🎯 Who Is This For?

### Primary Users

#### 🎒 **Frequent Group Travelers** (頻繁團體旅遊者)
Traveling with friends 2-6 times a year? Stop entering split ratios for every meal and hotel.

**Use case**: "花蓮三天兩夜" trip with college friends
**Pain solved**: Set split pattern once, apply to entire trip
**Benefit**: See total travel spending across all trips in personal book

#### 🏠 **Roommates & Co-living Groups** (室友/合租群體)
Sharing rent, utilities, and groceries? Avoid monthly settlement disputes.

**Use case**: "室友帳本" for 2-4 roommates
**Pain solved**: Recurring expenses (rent, utilities) auto-split with saved patterns
**Benefit**: One-click monthly settlement, transparent allocation, no arguments

#### 🔒 **Privacy-Conscious Users** (隱私意識使用者)
Value data privacy and worried about "free" apps selling your financial data?

**Use case**: Track expenses without ads or tracking
**Pain solved**: No bank integration risk, no service shutdown fear (like Mint)
**Benefit**: GDPR-compliant, export anytime, self-hostable (future)

### Also Great For
- 💑 Couples managing shared expenses with custom ratios
- 👨‍👩‍👧‍👦 Families coordinating household budgets
- 🎭 Event organizers managing group activities
- 💼 Power users frustrated with Splitwise limitations

---

## 💡 Key Features

### 🎯 **Reusable Split Patterns** (Unique to CocoBu!)
Set default split ratios at book or period level—never re-enter "60/40" again.

**Example scenarios:**
- Travel: "Me 60%, Alice 40%" for entire trip
- Roommates: "Equal split" for utilities, "40/30/30" for groceries
- Couples: "70/30" based on income

**Supported modes:**
- **Ratio**: Percentage-based (60% / 40%)
- **Shares**: Count-based (2 shares / 1 share → 66.67% / 33.33%)
- **Exact**: Fixed amounts per person (must sum to total)

### 🔄 **Auto-Sync to Personal Book** (Unique to CocoBu!)
When you create a split entry in "花蓮旅遊簿", CocoBu automatically creates mirror entries in each participant's personal book.

**Benefits:**
- See all your travel spending across multiple trips
- Track roommate expenses separate from personal spending
- No more maintaining two apps (personal + group)

### 🔒 **Privacy-First by Design**
- ✅ **No ads** - We don't sell your attention
- ✅ **No tracking** - We don't sell your data
- ✅ **No bank integration** - Manual entry only, no vendor lock-in
- ✅ **GDPR-compliant** - Data export, deletion, full transparency
- ✅ **Self-hostable** - (Future) Run on your own server

### ⚡ **Smart Settlement**
One-click settlement with **minimum transfer path algorithm**.

Instead of everyone paying everyone, CocoBu calculates the simplest transfers:
```
Instead of:  Alice → Bob $50, Alice → Charlie $30, Bob → Charlie $20
CocoBu says: Alice → Charlie $80, Bob → Charlie $30
```

### 🎨 **Other Features**
- **Keyboard-first UX** - Fast entry for power users
- **Offline-capable PWA** - Save drafts offline, sync when online
- **Flexible categories** - Custom categories, not rigid monthly envelopes
- **Multi-currency** - Track original currency + exchange rate
- **CSV export** - Your data, always accessible

---

## 📊 How We Compare

| Feature | Splitwise | YNAB | CWMoney | **CocoBu** |
|---------|-----------|------|---------|------------|
| **Reusable split patterns** | ❌ Manual every time | N/A | N/A | ✅ **Unique!** |
| **Personal + group auto-sync** | ❌ Separate | ❌ Manual | ❌ No groups | ✅ **Unique!** |
| **No ads** | ⚠️ Paid only | ✅ | ❌ | ✅ |
| **Privacy (no tracking)** | ❌ | ⚠️ | ❌ | ✅ |
| **No bank dependency** | ✅ | ❌ | ⚠️ | ✅ |
| **Offline support** | ❌ | ⚠️ | ❌ | ✅ |
| **Free tier limits** | ⚠️ Yes | ❌ Paid | ⚠️ Yes | ✅ No limits |
| **Flexible split modes** | ⚠️ Basic | N/A | N/A | ✅ Ratio/Shares/Exact |

**Key differentiators:**
1. ✅ **Reusable split patterns** - Only CocoBu has this (solves #1 pain point)
2. ✅ **Auto-mirror to personal book** - Only CocoBu does this automatically
3. ✅ **Privacy-first** - No ads, no tracking, unlike ad-supported apps
4. ✅ **No vendor lock-in** - Manual entry prevents Mint-style shutdowns

---

## 🎯 Project Overview

CocoBu (叩叩 = money in Taiwanese, 簿 = ledger) is a web-based expense tracking system built with:

- **Personal + Group Books**: Manage personal expense books AND group split books with automatic mirroring
- **Smart Splitting**: Ratio/percentage/share-based splits with reusable default patterns
- **Privacy-First**: No ads, no tracking, GDPR-friendly, data minimization
- **Super Simple UX**: Keyboard-first, offline-capable PWA

## 🏗️ Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + Radix UI
- TanStack Query + Zustand
- Deployed on Vercel

### Backend
- NestJS
- MySQL 8.0 with Prisma ORM
- JWT authentication with magic links
- Deployed on Railway/Fly.io

### Infrastructure
- Turborepo monorepo
- Docker Compose for local development
- GitHub Actions for CI/CD

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- OpenSpec CLI (for spec-driven development)
  ```bash
  npm install -g @fission-ai/openspec@latest
  ```

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/livhg/cocobu.git
   cd cocobu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MySQL database**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate:dev
   ```

6. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

7. **Start development servers**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Docs: http://localhost:4000/api/docs

## 📁 Project Structure

```
cocobu/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── database/     # Prisma schema + client
│   └── types/        # Shared TypeScript types
├── .github/
│   └── workflows/    # CI/CD pipelines
├── openspec/         # Specifications and design docs
└── docker-compose.yml
```

## 🛠️ Development Commands

### Root Level

```bash
npm run dev           # Start all apps in development mode
npm run build         # Build all packages
npm run test          # Run all tests
npm run lint          # Lint all packages
npm run format        # Format code with Prettier
npm run typecheck     # Type-check all packages
```

### Database

```bash
npm run db:generate        # Generate Prisma client
npm run db:migrate:dev     # Create and apply migration (dev)
npm run db:migrate:deploy  # Apply migrations (production)
npm run db:reset           # Reset database (dangerous!)
npm run db:seed            # Seed database with sample data
```

### OpenSpec (Spec-Driven Development)

```bash
openspec list                    # List active changes
openspec list --specs            # List existing specifications
openspec show [item]             # Display change or spec details
openspec validate [item] --strict # Validate changes or specs
openspec archive <change-id> --yes # Archive completed change
```

For detailed OpenSpec workflow, see [OpenSpec Documentation](./openspec/AGENTS.md).

## 📖 Documentation

- [OpenSpec Specifications](/openspec/README.md)
- [API Documentation](http://localhost:4000/api/docs) (when running locally)
- [Database Schema](/packages/database/prisma/schema.prisma)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔐 Environment Variables

See [.env.example](./.env.example) for all required environment variables.

**Key variables:**
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `SMTP_*`: Email configuration for magic links
- `FRONTEND_URL`: Frontend application URL
- `API_URL`: Backend API URL

## 📝 License

[To be determined]

## 🤝 Contributing

This is currently a private project. Contribution guidelines will be added when the project goes public.

## 📮 Contact

[To be added]
