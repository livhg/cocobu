# Proposal: Define Launch Strategy

## Change ID
`define-launch-strategy`

## Summary
Define comprehensive launch strategy for CocoBu including deployment architecture, platform selection, domain acquisition and DNS configuration, environment management, monitoring setup, and backup/disaster recovery plans. This establishes the operational foundation for taking the application from development to production.

## Motivation

### Problem
The foundation-setup change establishes the codebase and development environment, but we lack a defined strategy for:

1. **Deployment infrastructure** - Where and how to host frontend, backend, and database in production
2. **Domain and DNS** - Domain purchase, DNS configuration, SSL/TLS certificate management
3. **Environment management** - Configuration across dev/staging/production, secrets handling
4. **Monitoring and observability** - Application health, error tracking, performance monitoring
5. **Backup and disaster recovery** - Data protection, recovery procedures, business continuity

### Why Now
Before implementing features beyond the foundation, we need to establish:
- Clear deployment targets for CI/CD configuration
- Domain strategy for authentication flows (magic link callbacks, CORS configuration)
- Monitoring infrastructure to detect issues early during development
- Backup strategy to prevent data loss during beta testing

This is a **planning change** - it defines specifications but requires minimal implementation (mostly configuration and service setup).

## Proposed Solution

### High-Level Approach

#### 1. Deployment Architecture
Follow the tech stack defined in project.md:
- **Frontend (Next.js)**: Deploy to Vercel
  - Automatic previews for pull requests
  - Edge network for global performance
  - Zero-configuration Next.js optimization
- **Backend (NestJS)**: Deploy to Railway (MVP) or Fly.io (scale)
  - Railway: Simple setup, built-in MySQL
  - Fly.io: Better global distribution, more control
- **Database (MySQL)**: Railway MySQL (MVP) or PlanetScale (scale)
  - Railway: Co-located with API for low latency
  - PlanetScale: Serverless, automatic scaling, branching
- **Storage (Receipts)**: Cloudflare R2
  - S3-compatible, zero egress fees
  - CDN integration for fast delivery

#### 2. Domain Strategy
- **Domain acquisition**: Register `cocobu.com` via Cloudflare Registrar or Namecheap
  - Primary domain: `cocobu.com` (apex for frontend)
  - API subdomain: `api.cocobu.com` (for backend)
  - WWW redirect: `www.cocobu.com` → `cocobu.com`
- **DNS management**: Cloudflare DNS
  - Free SSL/TLS certificates
  - DDoS protection
  - Analytics and firewall rules
- **SSL/TLS**: Automatic via Vercel and Cloudflare

#### 3. Environment Configuration
Two environments for MVP simplicity:
- **Development**: Local Docker (localhost:3000, localhost:4000)
- **Production**: Live system, `cocobu.com` and `api.cocobu.com`

**Rationale for no staging**: As an MVP testing market fit, we minimize infrastructure complexity and costs. Staging environment will be added post-MVP when traffic and team size justify it. Development testing on localhost combined with preview deployments (Vercel PR previews) provide sufficient pre-production validation.

Secrets management:
- Vercel: Environment variables in project settings
- Railway: CLI or dashboard for secrets
- GitHub Actions: Repository secrets for CI/CD
- No secrets in code or git history

#### 4. Monitoring and Observability
- **Error tracking**: Sentry
  - Frontend and backend error capture
  - User context and breadcrumbs
  - Performance monitoring
- **Application monitoring**: Railway metrics (included) or Fly.io monitoring
  - CPU, memory, request rates
  - Response times and error rates
- **Uptime monitoring**: UptimeRobot or Better Uptime
  - HTTP endpoint checks every 5 minutes
  - Email/SMS alerts for downtime
- **Logging**: Built-in platform logs (Railway/Fly.io)
  - Structured JSON logs from NestJS
  - Log retention: 7 days (MVP), longer for production

#### 5. Backup and Disaster Recovery
- **Database backups**:
  - Railway: Automatic daily backups (included)
  - PlanetScale: Automatic backups with point-in-time recovery
- **Application code**: Git (GitHub) as source of truth
- **User-uploaded files**: R2 with versioning enabled
- **Recovery procedures**:
  - Database: Restore from latest backup (<24 hours old)
  - Application: Redeploy from git tag
  - Files: R2 versioning for accidental deletions
- **RTO/RPO targets** (MVP):
  - Recovery Time Objective: <4 hours
  - Recovery Point Objective: <24 hours

### What This Does NOT Include
- Actual implementation of features (covered by other changes)
- Production launch checklist (separate operational doc)
- Scaling plans beyond initial MVP (revisit at M2/M3)
- Cost optimization strategies (premature at this stage)

## Impact Analysis

### User Impact
- **End users**: No direct impact (defines infrastructure only)
- **Developers**: Clear deployment targets, easier testing and debugging
- **Operations**: Defined runbooks for common scenarios

### System Impact
- **New services**: Vercel, Railway, Cloudflare, Resend, Sentry, UptimeRobot
- **Monthly costs** (estimated MVP, production only):
  - Vercel: $0 (Hobby tier sufficient for MVP)
  - Railway: ~$5-10 (MySQL + API on Starter plan)
  - Cloudflare: $10-15 (domain registration, DNS is free)
  - Resend: $0 (free tier: 3000 emails/month)
  - Sentry: $0 (Developer tier: 5K events/month)
  - UptimeRobot: $0 (Free tier: 50 monitors, 5-min checks)
  - **Total**: $15-25/month for MVP (single production environment)
- **Complexity**: Minimal for MVP - single production environment, managed services reduce operational burden

### Migration Required
- None (greenfield)

### Breaking Changes
- None

### Performance Considerations
- Edge deployment (Vercel) reduces latency for frontend
- Regional deployment (Railway/Fly.io) adds latency but acceptable for MVP
- R2 CDN reduces file delivery latency

### Security Considerations
- All traffic over HTTPS/TLS
- Secrets stored in platform-specific vaults (not git)
- Cloudflare DDoS protection and WAF
- Sentry data scrubbing for PII in error logs
- Database backups encrypted at rest

## Alternatives Considered

### Alternative 1: All-in-One PaaS (Vercel for Everything)
**Pros**: Single platform, simpler management
**Cons**: Expensive for backend ($20/month per developer), limited MySQL support
**Decision**: Rejected - Backend needs more control and cheaper compute

### Alternative 2: Self-Hosted VPS (DigitalOcean/Linode)
**Pros**: Full control, predictable pricing
**Cons**: Requires DevOps expertise, manual security updates, no auto-scaling
**Decision**: Rejected - Too much operational burden for MVP

### Alternative 3: AWS/GCP/Azure
**Pros**: Enterprise-grade, comprehensive services
**Cons**: Complex setup, steep learning curve, expensive for low traffic
**Decision**: Rejected - Overkill for MVP, vendor lock-in concerns

### Alternative 4: Serverless Everything (Vercel + Planetscale + Cloudflare Workers)
**Pros**: Infinite scale, pay-per-use
**Cons**: Cold starts, vendor lock-in, harder to debug
**Decision**: Partial adoption - Use PlanetScale if Railway proves insufficient

### Alternative 5: No Monitoring (Save Costs)
**Pros**: $0 cost
**Cons**: Blind to errors, slow debugging, poor user experience
**Decision**: Rejected - Monitoring is essential even for MVP (use free tiers)

## Open Questions

### Resolved
1. ✅ **Domain name**: `cocobu.com`
   - Decision: Use `cocobu.com` for brand recognition and familiarity
   - Budget: ~$10-15/year

2. ✅ **Backend hosting**: Railway for MVP
   - Decision: Railway for simpler setup, includes MySQL, better DX
   - Migration path to Fly.io exists if needed later

3. ✅ **Database hosting**: Railway MySQL for MVP
   - Decision: Railway MySQL for co-location with API, simpler operations
   - Migration path to PlanetScale via Prisma exists if needed

4. ✅ **Email service for magic links**: Resend
   - Decision: Resend for modern API, generous free tier (3000 emails/month), excellent DX

5. ✅ **Error tracking**: Sentry
   - Decision: Sentry for industry-standard tooling and generous free tier

6. ✅ **Staging environment**: Skip for MVP, add post-launch
   - Decision: No staging environment for MVP to minimize complexity and cost
   - Rationale: Testing on localhost + Vercel PR previews sufficient for MVP market validation
   - Post-MVP: Add staging when traffic/team size justifies it

### Unresolved
None - all key decisions finalized for MVP launch.

## Success Criteria

### Acceptance Criteria
1. ✅ Deployment specification document exists
2. ✅ Domain strategy defined with clear subdomain structure
3. ✅ Environment configuration documented for dev/staging/prod
4. ✅ Monitoring and alerting plan specified
5. ✅ Backup and disaster recovery procedures documented
6. ✅ Cost estimates provided for MVP phase
7. ✅ Platform selection justified with rationale
8. ✅ Migration paths identified for future scaling needs

### Testing & Validation
- Specifications pass `openspec validate --strict`
- Requirements have concrete scenarios
- Platform selections align with project.md constraints
- Cost estimates are reasonable for bootstrapped project

### Rollback Plan
- This is a planning change with no code impact
- If strategy proves incorrect, create new change proposal with updated plan

## Timeline Estimate
**Effort**: 1-2 hours for documentation (this proposal)
**Implementation**: 2-4 hours for actual service setup and configuration (separate task, not part of this change)

## Related Changes
- Depends on: `foundation-setup` (provides the codebase to deploy)
- Blocks: Future feature changes (need deployment targets defined)

## References
- `openspec/project.md` - Tech stack and architecture decisions
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Fly.io Documentation](https://fly.io/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2)
- [Sentry Documentation](https://docs.sentry.io)
