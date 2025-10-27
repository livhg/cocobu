# CocoBu 叩叩簿

A "same source, different views" expense tracking system for individuals and groups.

## 🎯 Project Overview

CocoBu (叩叩 = money in Taiwanese, 簿 = ledger) is a web-based expense tracking system that lets you:

- **Personal + Group**: Manage personal expense books AND group split books with automatic mirroring
- **Smart splitting**: Ratio/percentage/share-based splits with reusable default patterns
- **Privacy-first**: No ads, no tracking, GDPR-friendly, data minimization
- **Super simple**: Keyboard-first, offline-capable PWA

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
