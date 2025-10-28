# Specification: Deployment

## Overview
Defines the deployment architecture, platform selection, and configuration for frontend, backend, database, and storage services across development, staging, and production environments.

## ADDED Requirements

### Requirement: Frontend Deployment
The system SHALL deploy the Next.js frontend application to Vercel with automatic previews and production deployments.

**Rationale**: Vercel provides zero-configuration Next.js hosting with edge network, automatic SSL, and preview deployments for every pull request.

#### Scenario: Production deployment
- **GIVEN** code is merged to main branch
- **WHEN** GitHub push occurs
- **THEN** Vercel SHALL automatically build and deploy to production
- **AND** deployment SHALL be accessible at `cocobu.com`
- **AND** deployment SHALL complete within 3 minutes
- **AND** previous deployment SHALL remain active until new deployment is verified

#### Scenario: Pull request preview
- **GIVEN** a pull request is opened
- **WHEN** code is pushed to the PR branch
- **THEN** Vercel SHALL create a preview deployment
- **AND** preview URL SHALL be commented on the pull request
- **AND** preview SHALL include all environment variables from preview configuration

#### Scenario: Rollback deployment
- **GIVEN** a production deployment has issues
- **WHEN** administrator triggers rollback in Vercel dashboard
- **THEN** previous working deployment SHALL be restored
- **AND** rollback SHALL complete within 1 minute

### Requirement: Backend Deployment
The system SHALL deploy the NestJS backend application to Railway with MySQL database co-location.

**Rationale**: Railway provides simple deployment with built-in MySQL, automatic HTTPS, and good developer experience suitable for MVP stage.

#### Scenario: Production deployment
- **GIVEN** backend code is merged to main branch
- **WHEN** Railway webhook receives push notification
- **THEN** Railway SHALL build Docker image from Dockerfile
- **AND** Railway SHALL deploy to production environment
- **AND** deployment SHALL be accessible at `api.cocobu.com`
- **AND** health check endpoint SHALL return 200 status before routing traffic

#### Scenario: Zero-downtime deployment
- **GIVEN** backend is currently serving traffic
- **WHEN** new deployment is triggered
- **THEN** Railway SHALL start new instance with updated code
- **AND** Railway SHALL wait for health check to pass
- **AND** Railway SHALL route traffic to new instance
- **AND** Railway SHALL terminate old instance after connection drain

#### Scenario: Deployment failure
- **GIVEN** new deployment has failing health checks
- **WHEN** Railway detects 3 consecutive health check failures
- **THEN** Railway SHALL stop deploying new version
- **AND** Railway SHALL keep previous version active
- **AND** deployment logs SHALL indicate the failure reason

### Requirement: Database Hosting
The system SHALL host MySQL 8.0 database on Railway with automatic backups and connection pooling.

**Rationale**: Co-locating database with API on Railway reduces latency and simplifies operations for MVP.

#### Scenario: Database provisioning
- **GIVEN** Railway project is created
- **WHEN** MySQL plugin is added
- **THEN** Railway SHALL provision MySQL 8.0 instance
- **AND** connection string SHALL be available as environment variable
- **AND** database SHALL be accessible from backend service with low latency (<10ms)

#### Scenario: Connection pooling
- **GIVEN** backend is running
- **WHEN** multiple requests require database access
- **THEN** Prisma SHALL maintain connection pool
- **AND** pool size SHALL be limited to 5 connections (Railway free tier)
- **AND** connections SHALL be reused across requests

#### Scenario: Database backup
- **GIVEN** database is running on Railway
- **WHEN** daily backup time arrives (03:00 UTC)
- **THEN** Railway SHALL create automatic backup
- **AND** backup SHALL be retained for 7 days
- **AND** backup SHALL be restorable via Railway dashboard

### Requirement: Storage Service
The system SHALL use Cloudflare R2 for receipt and attachment storage with S3-compatible API.

**Rationale**: R2 provides zero egress fees, automatic CDN integration, and S3-compatible API for easy migration if needed.

#### Scenario: File upload
- **GIVEN** user uploads a receipt image
- **WHEN** backend receives multipart/form-data request
- **THEN** backend SHALL upload file to R2 bucket
- **AND** file SHALL be stored with unique key (UUID + extension)
- **AND** file URL SHALL be returned to client
- **AND** upload SHALL complete within 5 seconds for files <5MB

#### Scenario: File retrieval
- **GIVEN** user requests to view a receipt
- **WHEN** client requests file URL
- **THEN** R2 SHALL serve file via Cloudflare CDN
- **AND** file SHALL be cached at edge for 24 hours
- **AND** response SHALL include appropriate content-type header

#### Scenario: File versioning
- **GIVEN** R2 bucket has versioning enabled
- **WHEN** file is overwritten or deleted
- **THEN** R2 SHALL retain previous version
- **AND** previous versions SHALL be accessible for 30 days
- **AND** old versions SHALL be automatically deleted after retention period

### Requirement: Environment Separation
The system SHALL maintain two isolated environments: development and production.

**Rationale**: For MVP simplicity, we use only development (local) and production environments. This minimizes infrastructure complexity and costs while Vercel's PR preview deployments provide pre-production testing capability. Staging environment will be added post-MVP when justified by traffic and team size.

#### Scenario: Development environment
- **GIVEN** developer is working locally
- **WHEN** application starts with `NODE_ENV=development`
- **THEN** application SHALL connect to local MySQL in Docker
- **AND** application SHALL use development environment variables from `.env`
- **AND** authentication SHALL allow dev-mode login bypass
- **AND** hot-reload SHALL be enabled for rapid iteration

#### Scenario: Production environment
- **GIVEN** code is merged to `main` branch
- **WHEN** deployment triggers
- **THEN** application SHALL deploy to `cocobu.com` and `api.cocobu.com`
- **AND** application SHALL use production environment variables
- **AND** application SHALL connect to production database
- **AND** dev-mode features SHALL be disabled
- **AND** application SHALL run in optimized production mode

#### Scenario: Preview deployment for testing
- **GIVEN** pull request is opened
- **WHEN** code is pushed to PR branch
- **THEN** Vercel SHALL create preview deployment with unique URL
- **AND** preview SHALL use production-like configuration
- **AND** preview SHALL connect to production API for testing (or mock data)
- **AND** preview SHALL be destroyed when PR is closed

### Requirement: Health Checks
The system SHALL provide health check endpoints for monitoring deployment status and service availability.

**Rationale**: Health checks enable platforms to detect failed deployments and route traffic only to healthy instances.

#### Scenario: Backend health check
- **GIVEN** backend is running
- **WHEN** GET request is made to `/health`
- **THEN** endpoint SHALL return 200 status code
- **AND** response SHALL include JSON: `{"status": "ok", "timestamp": "ISO-8601", "version": "semver"}`
- **AND** response time SHALL be <100ms

#### Scenario: Backend health check with database
- **GIVEN** backend is running
- **WHEN** GET request is made to `/health/db`
- **THEN** endpoint SHALL query database with simple SELECT 1
- **AND** endpoint SHALL return 200 if database is reachable
- **AND** endpoint SHALL return 503 if database is unreachable
- **AND** response SHALL include database latency in milliseconds

#### Scenario: Frontend health check
- **GIVEN** frontend is deployed
- **WHEN** GET request is made to `/api/health`
- **THEN** Next.js API route SHALL return 200 status
- **AND** response SHALL include deployment ID and timestamp

### Requirement: Secrets Management
The system SHALL store sensitive configuration values in platform-specific secret stores, never in code or git history.

**Rationale**: Secrets in code or version control create security vulnerabilities and compliance issues.

#### Scenario: Backend secrets configuration
- **GIVEN** backend requires database connection string and JWT secret
- **WHEN** backend starts on Railway
- **THEN** secrets SHALL be read from Railway environment variables
- **AND** secrets SHALL NOT be present in git repository
- **AND** secrets SHALL NOT be logged or exposed in error messages

#### Scenario: Frontend secrets configuration
- **GIVEN** frontend requires API URL
- **WHEN** frontend builds on Vercel
- **THEN** public variables SHALL be prefixed with `NEXT_PUBLIC_`
- **AND** private build-time variables SHALL be accessible only during build
- **AND** secrets SHALL be configured in Vercel project settings

#### Scenario: CI/CD secrets
- **GIVEN** GitHub Actions workflow requires Railway token
- **WHEN** workflow runs
- **THEN** secrets SHALL be stored in GitHub repository secrets
- **AND** secrets SHALL be masked in workflow logs
- **AND** secrets SHALL NOT be accessible in pull request workflows from forks

### Requirement: Container Configuration
The system SHALL use Docker containers for backend deployment with optimized build and runtime configuration.

**Rationale**: Containers provide consistent deployment environment and enable platform-agnostic hosting.

#### Scenario: Production Docker build
- **GIVEN** backend Dockerfile exists
- **WHEN** Railway builds container
- **THEN** Dockerfile SHALL use multi-stage build (build + production)
- **AND** production image SHALL use Node.js slim base image
- **AND** production image SHALL NOT include dev dependencies
- **AND** build time SHALL be <5 minutes

#### Scenario: Container resource limits
- **GIVEN** backend container is running
- **WHEN** Railway monitors resource usage
- **THEN** container SHALL be limited to 512MB memory (Railway Starter)
- **AND** container SHALL be limited to 0.5 vCPU
- **AND** container SHALL restart if memory limit is exceeded

#### Scenario: Container startup
- **GIVEN** backend container starts
- **WHEN** Railway executes start command
- **THEN** container SHALL run Prisma migrations if needed
- **AND** container SHALL start NestJS application
- **AND** container SHALL bind to PORT environment variable
- **AND** container SHALL be ready to serve traffic within 30 seconds
