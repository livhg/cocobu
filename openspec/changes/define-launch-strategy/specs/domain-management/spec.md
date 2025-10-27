# Specification: Domain Management

## Overview
Defines domain acquisition strategy, DNS configuration, subdomain structure, and SSL/TLS certificate management for CocoBu application.

## ADDED Requirements

### Requirement: Domain Acquisition
The system SHALL use a registered domain name for production deployment with clear ownership and renewal strategy.

**Rationale**: Custom domain provides professional appearance, enables brand recognition, and is required for authentication flows (magic link callbacks, CORS configuration).

#### Scenario: Domain registration
- **GIVEN** project is ready for deployment
- **WHEN** domain is registered
- **THEN** domain SHALL be registered via Cloudflare Registrar or Namecheap
- **AND** domain SHALL be either `cocobu.com` (preferred) or `cocobu.app`
- **AND** registration SHALL be for minimum 1 year with auto-renewal enabled
- **AND** domain registrant SHALL be project owner with valid contact information

#### Scenario: Domain ownership verification
- **GIVEN** domain is registered
- **WHEN** verification is required for services (email, SSL)
- **THEN** DNS TXT records SHALL be added for domain verification
- **AND** verification SHALL complete within 24 hours
- **AND** verification records SHALL be documented in DNS configuration

#### Scenario: Domain renewal
- **GIVEN** domain expiration is approaching
- **WHEN** 30 days before expiration
- **THEN** registrar SHALL send renewal reminder
- **AND** auto-renewal SHALL charge registered payment method
- **AND** domain SHALL NOT be allowed to expire without explicit decision

### Requirement: DNS Management
The system SHALL use Cloudflare DNS for all domain name resolution with nameserver delegation.

**Rationale**: Cloudflare provides free DNS with built-in DDoS protection, analytics, and integrated SSL/TLS management.

#### Scenario: Nameserver configuration
- **GIVEN** domain is registered
- **WHEN** DNS is configured
- **THEN** domain nameservers SHALL point to Cloudflare nameservers
- **AND** nameserver update SHALL propagate within 24-48 hours
- **AND** Cloudflare SHALL become authoritative DNS provider

#### Scenario: DNS record creation
- **GIVEN** Cloudflare DNS is active
- **WHEN** new service requires DNS record
- **THEN** record SHALL be added via Cloudflare dashboard or API
- **AND** record changes SHALL propagate within 5 minutes (Cloudflare's TTL)
- **AND** record SHALL be documented in infrastructure-as-code (optional) or runbook

#### Scenario: DNS query performance
- **GIVEN** user accesses application
- **WHEN** DNS query is performed
- **THEN** Cloudflare SHALL respond from nearest edge location
- **AND** DNS query latency SHALL be <30ms for 95th percentile
- **AND** DNS availability SHALL be >99.9%

### Requirement: Subdomain Structure
The system SHALL organize services using subdomain hierarchy for clear separation and independent deployment.

**Rationale**: Subdomains enable independent SSL certificates, CORS configuration, and service isolation while maintaining unified brand.

#### Scenario: Production domain structure
- **GIVEN** production environment is configured
- **WHEN** DNS records are created
- **THEN** apex domain SHALL serve frontend: `cocobu.com` → Vercel
- **AND** API subdomain SHALL serve backend: `api.cocobu.com` → Railway
- **AND** all HTTP requests SHALL redirect to HTTPS
- **AND** www subdomain SHALL redirect to apex: `www.cocobu.com` → `cocobu.com`

#### Scenario: Staging domain structure
- **GIVEN** staging environment exists
- **WHEN** staging deployment is configured
- **THEN** staging subdomain SHALL serve frontend: `staging.cocobu.com` → Vercel
- **AND** staging API subdomain SHALL serve backend: `api-staging.cocobu.com` → Railway
- **AND** staging SHALL be independently deployable from production

#### Scenario: Development domain structure
- **GIVEN** development environment exists
- **WHEN** development deployment is needed (optional)
- **THEN** dev subdomain MAY serve frontend: `dev.cocobu.com` → Vercel
- **AND** dev API subdomain MAY serve backend: `api-dev.cocobu.com` → Railway
- **AND** dev environment SHALL use separate database and services

### Requirement: SSL/TLS Certificates
The system SHALL encrypt all traffic with valid SSL/TLS certificates automatically provisioned and renewed.

**Rationale**: HTTPS is required for security, modern browser features (PWA, webcrypto), and user trust. Automatic management prevents expiration incidents.

#### Scenario: Frontend SSL certificate
- **GIVEN** frontend is deployed to Vercel
- **WHEN** custom domain is configured
- **THEN** Vercel SHALL automatically provision Let's Encrypt certificate
- **AND** certificate SHALL cover apex and www subdomains
- **AND** certificate SHALL auto-renew before expiration
- **AND** HTTP SHALL redirect to HTTPS automatically

#### Scenario: Backend SSL certificate
- **GIVEN** backend is deployed to Railway
- **WHEN** custom domain is configured
- **THEN** Railway SHALL automatically provision SSL certificate
- **AND** certificate SHALL cover API subdomain
- **AND** certificate SHALL auto-renew before expiration
- **AND** HTTP SHALL redirect to HTTPS automatically

#### Scenario: Certificate expiration prevention
- **GIVEN** SSL certificate is approaching expiration
- **WHEN** 30 days before expiration
- **THEN** platform SHALL automatically request renewal from Let's Encrypt
- **AND** renewal SHALL complete without downtime
- **AND** no manual intervention SHALL be required

#### Scenario: Certificate verification
- **GIVEN** SSL certificate is active
- **WHEN** user accesses application via HTTPS
- **THEN** certificate SHALL be valid and trusted by browsers
- **AND** certificate SHALL show organization as Let's Encrypt
- **AND** certificate SHALL use TLS 1.2 or higher
- **AND** browser SHALL show secure padlock icon

### Requirement: CORS Configuration
The system SHALL configure Cross-Origin Resource Sharing (CORS) to allow frontend-backend communication while preventing unauthorized access.

**Rationale**: Browser security requires explicit CORS configuration for API requests from different origins. Proper configuration prevents CSRF attacks while enabling legitimate requests.

#### Scenario: Production CORS policy
- **GIVEN** backend API is running
- **WHEN** request originates from `cocobu.com`
- **THEN** API SHALL include header: `Access-Control-Allow-Origin: https://cocobu.com`
- **AND** API SHALL include header: `Access-Control-Allow-Credentials: true`
- **AND** API SHALL allow methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **AND** API SHALL allow headers: Content-Type, Authorization, Cookie

#### Scenario: Staging CORS policy
- **GIVEN** staging backend is running
- **WHEN** request originates from `staging.cocobu.com`
- **THEN** API SHALL include header: `Access-Control-Allow-Origin: https://staging.cocobu.com`
- **AND** staging SHALL NOT accept requests from production domain
- **AND** production SHALL NOT accept requests from staging domain

#### Scenario: Development CORS policy
- **GIVEN** development backend is running locally
- **WHEN** request originates from `http://localhost:3000`
- **THEN** API SHALL include header: `Access-Control-Allow-Origin: http://localhost:3000`
- **AND** development SHALL accept requests from any localhost port (for flexibility)

#### Scenario: Unauthorized CORS request
- **GIVEN** backend API is running
- **WHEN** request originates from unknown domain
- **THEN** API SHALL NOT include CORS headers in response
- **AND** browser SHALL block the response
- **AND** backend SHALL log the unauthorized origin attempt

### Requirement: DNS Security
The system SHALL implement DNSSEC and CAA records to prevent DNS hijacking and unauthorized certificate issuance.

**Rationale**: DNSSEC prevents DNS spoofing attacks. CAA records restrict which Certificate Authorities can issue certificates for the domain.

#### Scenario: DNSSEC configuration
- **GIVEN** domain is using Cloudflare DNS
- **WHEN** DNSSEC is enabled in Cloudflare
- **THEN** DNSSEC SHALL sign DNS records cryptographically
- **AND** DS records SHALL be added to domain registrar
- **AND** DNS resolvers SHALL validate signatures
- **AND** invalid signatures SHALL cause DNS resolution to fail (preventing attacks)

#### Scenario: CAA record configuration
- **GIVEN** domain requires SSL certificates
- **WHEN** CAA record is created
- **THEN** CAA record SHALL authorize Let's Encrypt: `0 issue "letsencrypt.org"`
- **AND** CAA record SHALL include reporting: `0 iodef "mailto:security@cocobu.com"`
- **AND** unauthorized CAs SHALL be prevented from issuing certificates
- **AND** CAA violations SHALL be reported to specified email

#### Scenario: Certificate authority verification
- **GIVEN** CAA records are configured
- **WHEN** Let's Encrypt requests certificate issuance
- **THEN** Let's Encrypt SHALL check CAA records
- **AND** issuance SHALL proceed if Let's Encrypt is authorized
- **AND** issuance SHALL fail if Let's Encrypt is not authorized

### Requirement: Email Domain Configuration
The system SHALL configure DNS records for email delivery to support magic link authentication and notifications.

**Rationale**: Email authentication (SPF, DKIM, DMARC) prevents emails from being marked as spam and protects domain reputation.

#### Scenario: SPF record configuration
- **GIVEN** email service (Resend) sends emails from domain
- **WHEN** SPF record is configured
- **THEN** TXT record SHALL be added: `v=spf1 include:_spf.resend.com ~all`
- **AND** receiving mail servers SHALL check SPF during delivery
- **AND** emails from unauthorized servers SHALL fail SPF check

#### Scenario: DKIM record configuration
- **GIVEN** email service requires DKIM signing
- **WHEN** DKIM is configured
- **THEN** CNAME records SHALL be added as specified by Resend
- **AND** email service SHALL sign outgoing emails with private key
- **AND** receiving servers SHALL verify signature with public key from DNS

#### Scenario: DMARC policy configuration
- **GIVEN** SPF and DKIM are configured
- **WHEN** DMARC record is created
- **THEN** TXT record SHALL be added: `v=DMARC1; p=quarantine; rua=mailto:dmarc@cocobu.com`
- **AND** policy SHALL be set to `quarantine` (not `reject` initially)
- **AND** aggregate reports SHALL be sent to specified email
- **AND** policy SHALL be monitored and adjusted to `reject` after validation

#### Scenario: Email deliverability test
- **GIVEN** email DNS records are configured
- **WHEN** magic link email is sent
- **THEN** email SHALL pass SPF check
- **AND** email SHALL pass DKIM check
- **AND** email SHALL pass DMARC check
- **AND** email SHALL be delivered to inbox (not spam)
- **AND** email delivery SHALL complete within 5 seconds

### Requirement: CDN Configuration
The system SHALL use Cloudflare CDN for frontend assets and R2 file delivery to reduce latency and bandwidth costs.

**Rationale**: CDN edge caching reduces origin load, improves global performance, and provides additional DDoS protection.

#### Scenario: Frontend asset caching
- **GIVEN** frontend is deployed with static assets
- **WHEN** user requests JavaScript, CSS, or image files
- **THEN** Cloudflare SHALL cache assets at edge locations
- **AND** cache headers SHALL be set appropriately (immutable for hashed files)
- **AND** subsequent requests SHALL be served from edge without origin hit

#### Scenario: API request routing
- **GIVEN** API subdomain points to Railway
- **WHEN** user makes API request
- **THEN** Cloudflare SHALL proxy request to origin
- **AND** API responses SHALL NOT be cached (dynamic content)
- **AND** Cloudflare SHALL provide SSL termination and DDoS protection

#### Scenario: R2 file delivery via CDN
- **GIVEN** receipt images are stored in R2
- **WHEN** user requests file URL
- **THEN** R2 SHALL serve file through Cloudflare CDN
- **AND** file SHALL be cached at edge for 24 hours
- **AND** cache SHALL be purged if file is updated
- **AND** delivery SHALL use optimal edge location for user
