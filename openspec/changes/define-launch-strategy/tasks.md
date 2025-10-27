# Implementation Tasks: Define Launch Strategy

## Overview
This change is primarily a **planning and documentation** change. Implementation tasks focus on service setup, configuration, and documentation rather than code changes. Most tasks can be completed by following platform documentation and require minimal custom code.

## Phase 1: Domain and DNS Setup

### Task 1.1: Register domain name
- [ ] Check availability of `cocobu.com` and `cocobu.app`
- [ ] Register preferred domain via Cloudflare Registrar or Namecheap
- [ ] Enable auto-renewal to prevent expiration
- [ ] Document domain registration details in team password manager

**Validation**: Domain is registered and shows in registrar dashboard

**Estimated time**: 30 minutes

### Task 1.2: Configure Cloudflare DNS
- [ ] Add domain to Cloudflare account
- [ ] Update nameservers at registrar to point to Cloudflare
- [ ] Wait for DNS propagation (up to 24-48 hours)
- [ ] Verify nameservers are updated using `dig NS cocobu.com`

**Validation**: `dig cocobu.com` resolves using Cloudflare nameservers

**Estimated time**: 15 minutes (plus propagation wait time)

### Task 1.3: Create DNS records for services
- [ ] Create A/CNAME record: `cocobu.com` → Vercel (will be configured in Task 2.2)
- [ ] Create A/CNAME record: `api.cocobu.com` → Railway (will be configured in Task 3.2)
- [ ] Create CNAME record: `www.cocobu.com` → `cocobu.com`
- [ ] Create CNAME record: `staging.cocobu.com` → Vercel (staging)
- [ ] Create CNAME record: `api-staging.cocobu.com` → Railway (staging)
- [ ] Enable Cloudflare proxy (orange cloud) for DDoS protection

**Validation**: All DNS records resolve correctly using `dig` command

**Estimated time**: 30 minutes

### Task 1.4: Configure DNSSEC and CAA records
- [ ] Enable DNSSEC in Cloudflare dashboard
- [ ] Copy DS records from Cloudflare
- [ ] Add DS records to domain registrar
- [ ] Create CAA record: `0 issue "letsencrypt.org"`
- [ ] Create CAA record: `0 iodef "mailto:security@cocobu.com"`
- [ ] Verify DNSSEC with `dig +dnssec cocobu.com`

**Validation**: DNSSEC is active, CAA records are configured

**Estimated time**: 30 minutes

### Task 1.5: Configure email DNS records
- [ ] Sign up for Resend email service
- [ ] Add domain to Resend
- [ ] Create SPF record as specified by Resend: `v=spf1 include:_spf.resend.com ~all`
- [ ] Create DKIM CNAME records as specified by Resend
- [ ] Create DMARC record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@cocobu.com`
- [ ] Send test email and verify SPF/DKIM/DMARC pass

**Validation**: Test email passes all authentication checks and delivers to inbox

**Estimated time**: 45 minutes

## Phase 2: Frontend Deployment (Vercel)

### Task 2.1: Create Vercel project
- [ ] Sign up for Vercel account (if not exists)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Link repository to Vercel: `vercel link`
- [ ] Configure build settings (Next.js detected automatically)
- [ ] Set root directory to `apps/web`

**Validation**: Vercel project is created and linked to GitHub repo

**Estimated time**: 15 minutes

### Task 2.2: Configure production environment
- [ ] Add custom domain in Vercel dashboard: `cocobu.com`
- [ ] Add custom domain: `www.cocobu.com` (redirect to apex)
- [ ] Verify DNS records are correct
- [ ] Wait for SSL certificate provisioning (automatic)
- [ ] Set environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_API_URL=https://api.cocobu.com`
  - Any other public environment variables
- [ ] Deploy to production

**Validation**: `https://cocobu.com` loads successfully with SSL

**Estimated time**: 30 minutes

### Task 2.3: Configure staging environment
- [ ] Create staging environment in Vercel
- [ ] Add custom domain: `staging.cocobu.com`
- [ ] Set environment variables for staging:
  - `NEXT_PUBLIC_API_URL=https://api-staging.cocobu.com`
- [ ] Configure auto-deploy from `staging` branch
- [ ] Deploy to staging

**Validation**: `https://staging.cocobu.com` loads successfully

**Estimated time**: 20 minutes

### Task 2.4: Configure preview deployments
- [ ] Enable preview deployments for all pull requests
- [ ] Configure preview environment variables (same as production)
- [ ] Test preview deployment by creating sample PR
- [ ] Verify Vercel bot comments on PR with preview URL

**Validation**: Preview deployment is created for PR

**Estimated time**: 15 minutes

## Phase 3: Backend Deployment (Railway)

### Task 3.1: Create Railway project
- [ ] Sign up for Railway account (if not exists)
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Create new project: `railway init`
- [ ] Link GitHub repository
- [ ] Select `apps/api` as root directory

**Validation**: Railway project is created and linked

**Estimated time**: 15 minutes

### Task 3.2: Configure MySQL database
- [ ] Add MySQL plugin in Railway dashboard
- [ ] Wait for database provisioning
- [ ] Copy `DATABASE_URL` from Railway environment
- [ ] Run Prisma migrations: `railway run npm run db:migrate:deploy`
- [ ] Verify database connection

**Validation**: Database is created and migrations are applied

**Estimated time**: 20 minutes

### Task 3.3: Configure backend environment variables
- [ ] Set environment variables in Railway:
  - `DATABASE_URL` (auto-generated by MySQL plugin)
  - `JWT_SECRET` (generate secure random string)
  - `JWT_EXPIRES_IN=7d`
  - `MAGIC_LINK_SECRET` (generate secure random string)
  - `MAGIC_LINK_EXPIRES_IN=15m`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (from Resend)
  - `FRONTEND_URL=https://cocobu.com`
  - `NODE_ENV=production`
- [ ] Verify all required variables are set

**Validation**: All environment variables are configured

**Estimated time**: 20 minutes

### Task 3.4: Configure custom domain
- [ ] Add custom domain in Railway: `api.cocobu.com`
- [ ] Update DNS CNAME record to Railway target
- [ ] Wait for SSL certificate provisioning
- [ ] Verify health check endpoint: `https://api.cocobu.com/health`

**Validation**: API is accessible at custom domain with SSL

**Estimated time**: 15 minutes

### Task 3.5: Configure staging environment
- [ ] Create staging Railway service (duplicate of production)
- [ ] Add staging MySQL plugin
- [ ] Configure staging environment variables (same as production with different URLs)
- [ ] Add custom domain: `api-staging.cocobu.com`
- [ ] Deploy staging from `staging` branch

**Validation**: Staging API is accessible at `https://api-staging.cocobu.com/health`

**Estimated time**: 30 minutes

### Task 3.6: Configure automatic deployments
- [ ] Enable GitHub integration in Railway
- [ ] Configure auto-deploy from `main` branch to production
- [ ] Configure auto-deploy from `staging` branch to staging
- [ ] Enable build notifications (optional)
- [ ] Test deployment by pushing to main branch

**Validation**: Push to main triggers automatic deployment

**Estimated time**: 15 minutes

## Phase 4: Storage Setup (Cloudflare R2)

### Task 4.1: Create R2 bucket
- [ ] Sign up for Cloudflare account (if not already done for DNS)
- [ ] Navigate to R2 storage
- [ ] Create bucket: `cocobu-production-files`
- [ ] Enable versioning in bucket settings
- [ ] Configure lifecycle rule: delete versions older than 30 days

**Validation**: Bucket is created with versioning enabled

**Estimated time**: 15 minutes

### Task 4.2: Create API credentials
- [ ] Generate R2 API token in Cloudflare dashboard
- [ ] Copy Access Key ID and Secret Access Key
- [ ] Add credentials to Railway environment:
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_ENDPOINT` (from bucket settings)
  - `R2_BUCKET_NAME=cocobu-production-files`
  - `R2_PUBLIC_URL` (optional, for CDN)

**Validation**: Credentials are configured and accessible to backend

**Estimated time**: 10 minutes

### Task 4.3: Configure CDN for R2 (optional)
- [ ] Create custom domain for R2 bucket (e.g., `files.cocobu.com`)
- [ ] Add CNAME DNS record pointing to R2 bucket URL
- [ ] Configure cache rules in Cloudflare
- [ ] Test file upload and retrieval via CDN URL

**Validation**: Files are accessible via CDN URL with caching

**Estimated time**: 20 minutes (optional)

### Task 4.4: Create staging R2 bucket
- [ ] Create separate bucket: `cocobu-staging-files`
- [ ] Enable versioning
- [ ] Generate separate API credentials
- [ ] Add credentials to Railway staging environment

**Validation**: Staging bucket is configured

**Estimated time**: 15 minutes

## Phase 5: Monitoring Setup

### Task 5.1: Configure Sentry error tracking
- [ ] Sign up for Sentry account
- [ ] Create project for frontend (Next.js)
- [ ] Create project for backend (NestJS)
- [ ] Install Sentry SDK in frontend: `npm install @sentry/nextjs`
- [ ] Install Sentry SDK in backend: `npm install @sentry/nestjs`
- [ ] Configure Sentry in frontend (`sentry.client.config.ts`)
- [ ] Configure Sentry in backend (Sentry module)
- [ ] Add `SENTRY_DSN` to environment variables (Vercel and Railway)
- [ ] Test error capture by triggering test error

**Validation**: Test errors appear in Sentry dashboard

**Estimated time**: 60 minutes

### Task 5.2: Configure performance monitoring
- [ ] Enable performance monitoring in Sentry projects
- [ ] Configure sample rate: 10% for normal traffic, 100% for slow transactions
- [ ] Set up custom transactions for key operations (API endpoints, database queries)
- [ ] Test performance trace capture
- [ ] Review performance data in Sentry dashboard

**Validation**: Performance traces appear in Sentry

**Estimated time**: 30 minutes

### Task 5.3: Configure alert rules in Sentry
- [ ] Create alert rule: Error rate > 5% for 5 minutes
- [ ] Create alert rule: Specific error types (database connection, authentication failures)
- [ ] Configure notification channel: Email
- [ ] Configure alert frequency: Once per 15 minutes per rule
- [ ] Test alerts by triggering error condition

**Validation**: Alerts are sent to configured email

**Estimated time**: 30 minutes

### Task 5.4: Set up uptime monitoring (UptimeRobot)
- [ ] Sign up for UptimeRobot free account
- [ ] Create monitor for frontend: `https://cocobu.com`
- [ ] Create monitor for backend health: `https://api.cocobu.com/health`
- [ ] Create monitor for staging (optional)
- [ ] Configure check interval: 5 minutes
- [ ] Configure alert contacts: Email
- [ ] Configure alert threshold: 2 consecutive failures

**Validation**: Monitors are active and show current status

**Estimated time**: 20 minutes

### Task 5.5: Create public status page
- [ ] Enable public status page in UptimeRobot
- [ ] Customize status page branding (optional)
- [ ] Configure custom domain: `status.cocobu.com` (optional)
- [ ] Add DNS CNAME record if using custom domain
- [ ] Test status page accessibility
- [ ] Document status page URL in docs

**Validation**: Public status page is accessible

**Estimated time**: 15 minutes

### Task 5.6: Configure platform monitoring
- [ ] Review Railway metrics dashboard (CPU, memory, network)
- [ ] Review Vercel Analytics dashboard (page views, web vitals)
- [ ] Set up alert notifications in Railway (if available)
- [ ] Configure resource limits in Railway (memory, CPU)
- [ ] Document monitoring dashboards in team docs

**Validation**: Metrics dashboards are accessible and showing data

**Estimated time**: 20 minutes

## Phase 6: Backup and Disaster Recovery

### Task 6.1: Verify database backups
- [ ] Confirm daily backups are enabled in Railway
- [ ] Check backup retention policy (7 days)
- [ ] Document backup restoration procedure in runbook
- [ ] Test backup restoration to staging environment
- [ ] Verify restored data integrity

**Validation**: Backup can be restored successfully

**Estimated time**: 45 minutes

### Task 6.2: Document recovery procedures
- [ ] Create disaster recovery runbook document
- [ ] Document database restoration steps
- [ ] Document application deployment from git tags
- [ ] Document DNS failover procedures
- [ ] Document contact list for platform support
- [ ] Store runbook in team wiki or repository

**Validation**: Runbook exists and is accessible to team

**Estimated time**: 60 minutes

### Task 6.3: Set up configuration backup
- [ ] Export Cloudflare DNS zone file
- [ ] Document all Railway environment variables (names and descriptions)
- [ ] Document Vercel environment variables
- [ ] Store sensitive values in team password manager (1Password, LastPass, etc.)
- [ ] Create `.env.example` files with all required variables
- [ ] Document third-party service accounts and credentials

**Validation**: Configuration can be restored from documentation

**Estimated time**: 45 minutes

### Task 6.4: Create release tagging workflow
- [ ] Document git tagging convention (semantic versioning)
- [ ] Create git tag for current release: `git tag -a v0.1.0 -m "Initial release"`
- [ ] Push tag to GitHub: `git push origin v0.1.0`
- [ ] Configure Railway to deploy from tags (optional)
- [ ] Document rollback procedure using tags

**Validation**: Releases are tagged in git

**Estimated time**: 20 minutes

## Phase 7: Security and Compliance

### Task 7.1: Configure CORS policies
- [ ] Update NestJS CORS configuration in `main.ts`
- [ ] Add production domain to allowed origins
- [ ] Add staging domain to staging environment's allowed origins
- [ ] Test CORS policy with frontend requests
- [ ] Verify unauthorized origins are blocked

**Validation**: CORS allows legitimate requests, blocks others

**Estimated time**: 30 minutes

### Task 7.2: Configure rate limiting
- [ ] Implement rate limiting on auth endpoints (already in foundation-setup)
- [ ] Verify rate limit database table exists
- [ ] Test rate limiting by exceeding limits
- [ ] Monitor rate limit violations in logs

**Validation**: Rate limiting prevents abuse

**Estimated time**: 20 minutes (mostly verification)

### Task 7.3: Review security headers
- [ ] Configure security headers in Next.js (`next.config.js`)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` for feature restrictions
- [ ] Configure security headers in NestJS (Helmet middleware)
- [ ] Test headers using security scanner (securityheaders.com)

**Validation**: Security headers are present and configured correctly

**Estimated time**: 30 minutes

### Task 7.4: Configure Sentry data scrubbing
- [ ] Configure PII scrubbing in Sentry projects
- [ ] Add sensitive field names to scrub list: email, password, token, secret
- [ ] Test that PII is not visible in error reports
- [ ] Document data handling policy

**Validation**: PII is scrubbed from error reports

**Estimated time**: 20 minutes

## Phase 8: Documentation and Validation

### Task 8.1: Update project README
- [ ] Add deployment section with platform links
- [ ] Document environment variables required for deployment
- [ ] Add links to monitoring dashboards
- [ ] Add link to status page
- [ ] Document deployment process

**Validation**: README has comprehensive deployment information

**Estimated time**: 30 minutes

### Task 8.2: Create deployment runbook
- [ ] Document step-by-step deployment process
- [ ] Document rollback procedures
- [ ] Document common troubleshooting steps
- [ ] Document platform-specific quirks and gotchas
- [ ] Add runbook to project documentation

**Validation**: New team member can deploy following runbook

**Estimated time**: 45 minutes

### Task 8.3: Create operations guide
- [ ] Document monitoring and alerting setup
- [ ] Document incident response procedures
- [ ] Document backup and restore procedures
- [ ] Document security incident response
- [ ] Add operations guide to project documentation

**Validation**: Operations guide exists and is comprehensive

**Estimated time**: 60 minutes

### Task 8.4: Validate all specifications
- [ ] Run `openspec validate define-launch-strategy --strict`
- [ ] Fix any validation errors
- [ ] Ensure all requirements have scenarios
- [ ] Verify spec deltas are correctly formatted

**Validation**: OpenSpec validation passes without errors

**Estimated time**: 15 minutes

### Task 8.5: Cost estimation and budget
- [ ] Calculate monthly costs for all services:
  - Vercel: $0 (Hobby) or $20 (Pro)
  - Railway: ~$10-20 (Starter)
  - Cloudflare: $0-20 (domain + maybe R2)
  - Resend: $0 (free tier)
  - Sentry: $0 (Developer) or $26 (Team)
  - UptimeRobot: $0 (free tier)
- [ ] Document cost breakdown
- [ ] Set up billing alerts (if available)
- [ ] Review costs monthly

**Validation**: Cost estimates are documented

**Estimated time**: 30 minutes

### Task 8.6: End-to-end deployment test
- [ ] Deploy complete application to staging
- [ ] Test user registration and magic link email
- [ ] Test creating books and entries
- [ ] Test file upload to R2
- [ ] Verify error tracking in Sentry
- [ ] Verify uptime monitoring in UptimeRobot
- [ ] Verify application is accessible via custom domain

**Validation**: Complete user flow works in staging

**Estimated time**: 60 minutes

## Phase 9: Production Launch Preparation

### Task 9.1: Pre-launch checklist
- [ ] All environment variables configured
- [ ] All DNS records propagated
- [ ] SSL certificates active
- [ ] Monitoring and alerting configured
- [ ] Backups verified
- [ ] Documentation complete
- [ ] Security review complete
- [ ] Performance baseline measured

**Validation**: All checklist items are complete

**Estimated time**: 30 minutes (review)

### Task 9.2: Soft launch to production
- [ ] Deploy to production domain
- [ ] Test with small group of users (internal team)
- [ ] Monitor for errors and issues
- [ ] Verify all systems operational
- [ ] Collect feedback

**Validation**: Application is stable in production

**Estimated time**: Variable (ongoing)

### Task 9.3: Update CI/CD pipelines
- [ ] Update GitHub Actions to include deployment steps
- [ ] Configure automatic deployment to staging on merge to staging branch
- [ ] Configure manual approval for production deployment
- [ ] Test CI/CD pipeline end-to-end

**Validation**: CI/CD deploys to staging automatically

**Estimated time**: 45 minutes

---

## Dependencies Between Tasks

**Critical Path**:
1. Domain registration (1.1) → DNS setup (1.2, 1.3) → Service configuration (2.2, 3.4)
2. Service setup (2.1, 3.1, 4.1) → Environment configuration (2.2, 3.3, 4.2) → Deployment (2.4, 3.6)

**Parallel Work Opportunities**:
- Phase 1 (Domain/DNS) and Phase 2-4 (Service setup) can overlap after initial registration
- Phase 5 (Monitoring) can be done in parallel with Phase 6 (Backup)
- Phase 7 (Security) can be done in parallel with Phase 8 (Documentation)

## Estimated Timeline

- **Phase 1 (Domain/DNS)**: 2-3 hours (plus DNS propagation wait time)
- **Phase 2 (Vercel)**: 1-1.5 hours
- **Phase 3 (Railway)**: 1.5-2 hours
- **Phase 4 (R2)**: 1-1.5 hours
- **Phase 5 (Monitoring)**: 2-3 hours
- **Phase 6 (Backup)**: 2-3 hours
- **Phase 7 (Security)**: 1.5-2 hours
- **Phase 8 (Documentation)**: 3-4 hours
- **Phase 9 (Launch)**: 1-2 hours + ongoing

**Total**: ~15-22 hours of active work (can be spread over several days to account for propagation delays)

## Notes

- This is a configuration and setup change, not a code implementation change
- Most tasks involve following platform documentation and configuring services
- DNS propagation delays mean some tasks will have waiting periods
- Some tasks (monitoring, backups) can be refined over time
- Cost estimates are for MVP stage and may change as application scales
