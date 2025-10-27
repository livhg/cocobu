# Specification: Project Infrastructure

## Overview
Defines the monorepo structure, build system, and development environment for CocoBu.

## ADDED Requirements

### Requirement: Monorepo Structure
The system SHALL organize code as a monorepo with separate packages for frontend, backend, database, and shared types.

**Rationale**: Enables type sharing, unified tooling, and simplified dependency management across frontend and backend.

#### Scenario: Developer clones repository
- **GIVEN** a developer has cloned the CocoBu repository
- **WHEN** they run `npm install` in the project root
- **THEN** all workspace dependencies SHALL be installed
- **AND** the following workspace packages SHALL be available:
  - `apps/web` (Next.js frontend)
  - `apps/api` (NestJS backend)
  - `packages/database` (Prisma client)
  - `packages/types` (shared TypeScript types)

#### Scenario: Developer starts local development
- **GIVEN** a developer has installed dependencies
- **WHEN** they run `npm run dev`
- **THEN** the frontend SHALL start on port 3000
- **AND** the backend SHALL start on port 4000
- **AND** both processes SHALL watch for file changes and hot-reload

### Requirement: Build System
The system SHALL use Turborepo to orchestrate builds, tests, and linting across all packages.

**Rationale**: Turborepo provides caching and parallel execution to speed up development and CI workflows.

#### Scenario: Developer builds all packages
- **GIVEN** all source code is present
- **WHEN** the developer runs `npm run build`
- **THEN** Turborepo SHALL build packages in dependency order
- **AND** build artifacts SHALL be cached for incremental builds
- **AND** both `apps/web` and `apps/api` SHALL produce deployable outputs

#### Scenario: Developer runs type checking
- **GIVEN** TypeScript code exists in multiple packages
- **WHEN** the developer runs `npm run typecheck`
- **THEN** TypeScript SHALL check all packages
- **AND** the command SHALL fail if any type errors exist

### Requirement: Local Development Environment
The system SHALL provide a Docker Compose configuration to run PostgreSQL and Redis locally.

**Rationale**: Ensures consistent development environment across team members without manual database setup.

#### Scenario: Developer starts local services
- **GIVEN** Docker is installed on the developer's machine
- **WHEN** they run `docker-compose up -d`
- **THEN** PostgreSQL 15 SHALL start on port 5432
- **AND** Redis 7 SHALL start on port 6379
- **AND** databases SHALL persist data in named volumes

#### Scenario: Developer resets local database
- **GIVEN** Docker services are running
- **WHEN** the developer runs `npm run db:reset`
- **THEN** all database tables SHALL be dropped
- **AND** migrations SHALL be re-applied
- **AND** the database SHALL be in a clean state

### Requirement: Package Management
The system SHALL use npm workspaces for monorepo package management.

**Rationale**: npm workspaces is built-in, lightweight, and sufficient for our needs.

#### Scenario: Developer adds a shared dependency
- **GIVEN** multiple packages need the same library
- **WHEN** the developer runs `npm install <package> -w <workspace>`
- **THEN** the dependency SHALL be installed in the specified workspace
- **AND** the root `node_modules` SHALL deduplicate common dependencies

### Requirement: Environment Configuration
The system SHALL use environment variables for configuration with `.env` files for local development.

**Rationale**: Follows 12-factor app principles and enables different configs per environment.

#### Scenario: Developer configures backend
- **GIVEN** the backend requires database and Redis URLs
- **WHEN** the developer creates `apps/api/.env` with required variables
- **THEN** the backend SHALL read configuration from environment variables
- **AND** the application SHALL fail to start if required variables are missing

#### Scenario: Developer configures frontend
- **GIVEN** the frontend needs the API URL
- **WHEN** the developer creates `apps/web/.env.local` with `NEXT_PUBLIC_API_URL`
- **THEN** the frontend SHALL connect to the specified API
- **AND** public environment variables SHALL be available in browser code

### Requirement: Code Quality Tools
The system SHALL enforce code quality with ESLint and Prettier configured at the root level.

**Rationale**: Maintains consistent code style and catches common errors across the entire codebase.

#### Scenario: Developer runs linting
- **GIVEN** code exists in multiple packages
- **WHEN** the developer runs `npm run lint`
- **THEN** ESLint SHALL check all TypeScript and JavaScript files
- **AND** the command SHALL report any violations

#### Scenario: Developer formats code
- **GIVEN** code has inconsistent formatting
- **WHEN** the developer runs `npm run format`
- **THEN** Prettier SHALL reformat all files according to the configured style
- **AND** changes SHALL be written to disk

### Requirement: Documentation
The system SHALL include a README with setup instructions and architecture overview.

**Rationale**: Enables new developers to onboard quickly and understand the project structure.

#### Scenario: New developer reads setup instructions
- **GIVEN** a developer has cloned the repository
- **WHEN** they open `README.md`
- **THEN** they SHALL find clear step-by-step setup instructions
- **AND** the README SHALL include links to detailed documentation
- **AND** common troubleshooting tips SHALL be provided
