# Specification: Monitoring

## Overview
Defines monitoring, alerting, logging, and observability requirements for detecting issues, debugging problems, and maintaining system health across all environments.

## ADDED Requirements

### Requirement: Error Tracking
The system SHALL use Sentry for centralized error tracking and performance monitoring across frontend and backend.

**Rationale**: Centralized error tracking enables rapid detection and debugging of issues, provides user impact context, and supports proactive resolution before users report problems.

#### Scenario: Frontend error capture
- **GIVEN** JavaScript error occurs in browser
- **WHEN** error is thrown or promise is rejected
- **THEN** Sentry SDK SHALL capture error with stack trace
- **AND** error SHALL include user context (user ID if authenticated)
- **AND** error SHALL include breadcrumbs (user actions before error)
- **AND** error SHALL be sent to Sentry within 5 seconds
- **AND** PII SHALL be scrubbed before sending (email, names)

#### Scenario: Backend error capture
- **GIVEN** unhandled exception occurs in NestJS
- **WHEN** error is thrown in request handler
- **THEN** Sentry SDK SHALL capture error with stack trace
- **AND** error SHALL include request context (method, URL, headers)
- **AND** error SHALL include user context (user ID from JWT)
- **AND** error SHALL be logged to Railway logs
- **AND** sensitive data SHALL be filtered (passwords, tokens, PII)

#### Scenario: Error deduplication
- **GIVEN** same error occurs multiple times
- **WHEN** Sentry receives duplicate errors
- **THEN** Sentry SHALL group errors by stack trace fingerprint
- **AND** Sentry SHALL show occurrence count
- **AND** Sentry SHALL show first seen and last seen timestamps
- **AND** Sentry SHALL calculate error rate trend

#### Scenario: Error alerting
- **GIVEN** critical error occurs
- **WHEN** error matches alert rule (e.g., database connection failure)
- **THEN** Sentry SHALL send alert via email or Slack
- **AND** alert SHALL include error message and affected users count
- **AND** alert SHALL link directly to Sentry issue
- **AND** alert frequency SHALL be rate-limited to prevent spam

### Requirement: Performance Monitoring
The system SHALL track performance metrics for frontend page loads, API response times, and database queries.

**Rationale**: Performance monitoring identifies slow operations, regression detection, and guides optimization efforts.

#### Scenario: Frontend performance tracking
- **GIVEN** user loads application page
- **WHEN** page finishes loading
- **THEN** Sentry SHALL capture Web Vitals metrics (LCP, FID, CLS)
- **AND** metrics SHALL be aggregated by page route
- **AND** metrics SHALL be viewable in Sentry dashboard
- **AND** P50, P75, P95, P99 percentiles SHALL be calculated

#### Scenario: API endpoint performance
- **GIVEN** backend handles API request
- **WHEN** request completes
- **THEN** Sentry SHALL record transaction duration
- **AND** transaction SHALL be tagged with endpoint name
- **AND** transaction SHALL include database query spans
- **AND** slow transactions (>1s) SHALL be sampled at 100%
- **AND** fast transactions SHALL be sampled at 10%

#### Scenario: Database query performance
- **GIVEN** Prisma executes database query
- **WHEN** query completes
- **THEN** Sentry SHALL capture query duration as span
- **AND** slow queries (>500ms) SHALL be logged with parameters
- **AND** query spans SHALL be visible in transaction traces
- **AND** N+1 query patterns SHALL be identifiable

#### Scenario: Performance regression detection
- **GIVEN** deployment introduces performance change
- **WHEN** Sentry compares metrics before and after
- **THEN** Sentry SHALL highlight performance regressions
- **AND** regressions >20% SHALL trigger alerts
- **AND** release SHALL be tagged in metrics for comparison

### Requirement: Uptime Monitoring
The system SHALL use UptimeRobot for HTTP endpoint monitoring with alert notifications for downtime.

**Rationale**: External uptime monitoring detects outages even when internal monitoring fails, provides public status page, and enables rapid incident response.

#### Scenario: Production endpoint monitoring
- **GIVEN** production application is deployed
- **WHEN** UptimeRobot checks are configured
- **THEN** monitors SHALL check `cocobu.com` every 5 minutes
- **AND** monitors SHALL check `api.cocobu.com/health` every 5 minutes
- **AND** monitors SHALL expect 200 status code
- **AND** monitors SHALL timeout after 30 seconds

#### Scenario: Downtime detection
- **GIVEN** endpoint is being monitored
- **WHEN** 2 consecutive checks fail
- **THEN** UptimeRobot SHALL mark endpoint as down
- **AND** UptimeRobot SHALL send email alert to oncall contacts
- **AND** alert SHALL include error details and timestamp
- **AND** public status page SHALL reflect downtime

#### Scenario: Recovery detection
- **GIVEN** endpoint is marked as down
- **WHEN** endpoint returns 200 status
- **THEN** UptimeRobot SHALL mark endpoint as up
- **AND** UptimeRobot SHALL send recovery notification
- **AND** downtime duration SHALL be recorded
- **AND** public status page SHALL reflect recovery

#### Scenario: SSL certificate monitoring
- **GIVEN** domain uses SSL certificate
- **WHEN** UptimeRobot checks SSL status
- **THEN** monitor SHALL verify certificate validity
- **AND** monitor SHALL alert if certificate expires within 14 days
- **AND** monitor SHALL alert if certificate is invalid or revoked

### Requirement: Application Logging
The system SHALL implement structured logging with appropriate log levels and retention for debugging and audit purposes.

**Rationale**: Structured logs enable efficient searching, filtering, and analysis. Proper log levels prevent noise while capturing necessary information.

#### Scenario: Backend structured logging
- **GIVEN** backend application is running
- **WHEN** events occur (requests, errors, etc.)
- **THEN** logs SHALL be output as JSON with fields: timestamp, level, message, context
- **AND** logs SHALL include request ID for request tracing
- **AND** logs SHALL include user ID for authenticated requests
- **AND** logs SHALL use appropriate levels: ERROR, WARN, INFO, DEBUG

#### Scenario: Log level filtering
- **GIVEN** application runs in different environments
- **WHEN** LOG_LEVEL environment variable is set
- **THEN** production SHALL log INFO and above
- **AND** development SHALL log DEBUG and above
- **AND** lower-level logs SHALL be filtered out

#### Scenario: Log retention
- **GIVEN** logs are stored on Railway
- **WHEN** logs accumulate over time
- **THEN** logs SHALL be retained for 7 days (Railway default)
- **AND** critical logs MAY be exported to long-term storage (future)
- **AND** old logs SHALL be automatically deleted

#### Scenario: Log searching
- **GIVEN** developer needs to debug issue
- **WHEN** developer searches Railway logs
- **THEN** logs SHALL be searchable by text content
- **AND** logs SHALL be filterable by time range
- **AND** logs SHALL be filterable by log level
- **AND** logs SHALL be exportable as JSON or text

### Requirement: Metrics Dashboard
The system SHALL provide metrics dashboard for system health, resource usage, and business KPIs.

**Rationale**: Centralized dashboard enables quick health assessment, capacity planning, and data-driven decision making.

#### Scenario: Railway metrics dashboard
- **GIVEN** backend is deployed on Railway
- **WHEN** administrator views Railway dashboard
- **THEN** dashboard SHALL show CPU usage percentage
- **AND** dashboard SHALL show memory usage (MB and percentage)
- **AND** dashboard SHALL show network traffic (ingress/egress)
- **AND** dashboard SHALL show request rate (requests per minute)
- **AND** metrics SHALL be viewable for last 1 hour, 24 hours, 7 days

#### Scenario: Vercel analytics dashboard
- **GIVEN** frontend is deployed on Vercel
- **WHEN** administrator views Vercel Analytics
- **THEN** dashboard SHALL show page view counts
- **AND** dashboard SHALL show Core Web Vitals scores
- **AND** dashboard SHALL show geographic distribution
- **AND** dashboard SHALL show device and browser breakdown

#### Scenario: Database metrics
- **GIVEN** MySQL is running on Railway
- **WHEN** administrator views database metrics
- **THEN** metrics SHALL show connection count
- **AND** metrics SHALL show query rate
- **AND** metrics SHALL show storage usage
- **AND** metrics SHALL show replication lag (if applicable)

### Requirement: Alert Configuration
The system SHALL configure alerts for critical conditions requiring immediate response with appropriate notification channels.

**Rationale**: Timely alerts enable rapid incident response, reduce mean time to resolution, and prevent user impact from escalating.

#### Scenario: Critical error alert
- **GIVEN** Sentry error tracking is configured
- **WHEN** error rate exceeds 10 errors per minute
- **THEN** Sentry SHALL send alert to configured email
- **AND** alert SHALL include error type and count
- **AND** alert SHALL include link to Sentry issue
- **AND** alert SHALL be rate-limited to once per 15 minutes

#### Scenario: High error rate alert
- **GIVEN** application is serving traffic
- **WHEN** error rate exceeds 5% of requests
- **THEN** monitoring SHALL trigger high error rate alert
- **AND** alert SHALL indicate potential service degradation
- **AND** alert SHALL include affected endpoints

#### Scenario: Resource exhaustion alert
- **GIVEN** backend is running on Railway
- **WHEN** memory usage exceeds 90% for 5 minutes
- **THEN** Railway MAY send resource alert (if configured)
- **AND** alert SHALL indicate risk of container restart
- **AND** team SHALL investigate memory leak or scale up

#### Scenario: Database connection pool alert
- **GIVEN** backend connects to MySQL with limited connection pool (5 connections on Railway free tier)
- **WHEN** connection pool utilization exceeds 80% for 5 minutes
- **THEN** monitoring SHALL trigger connection pool warning alert
- **AND** alert SHALL include current pool utilization percentage
- **AND** alert SHALL include waiting requests count
- **AND** team SHALL investigate high load or connection leaks

#### Scenario: Connection pool exhaustion alert
- **GIVEN** backend connects to MySQL
- **WHEN** database connections are completely exhausted (100% utilization)
- **THEN** backend SHALL log critical error with pool metrics
- **AND** Sentry SHALL capture connection pool exhaustion errors
- **AND** alert SHALL be sent immediately for database connectivity issues
- **AND** alert SHALL include recommendation to upgrade Railway plan or optimize queries

### Requirement: User Analytics
The system SHALL track basic usage metrics while respecting privacy-first principles (no third-party tracking scripts).

**Rationale**: Usage data informs product decisions and measures success metrics, but must comply with privacy-first commitment.

#### Scenario: Privacy-respecting analytics
- **GIVEN** user interacts with application
- **WHEN** events occur (page views, actions)
- **THEN** analytics SHALL use first-party data only
- **AND** analytics SHALL NOT use third-party scripts (Google Analytics, etc.)
- **AND** IP addresses SHALL be anonymized
- **AND** analytics SHALL comply with GDPR (no consent required for first-party)

#### Scenario: Page view tracking
- **GIVEN** user navigates application
- **WHEN** page loads
- **THEN** backend SHALL log page view event (server-side)
- **AND** event SHALL include page path and timestamp
- **AND** event SHALL NOT include PII
- **AND** aggregated stats SHALL be viewable in admin dashboard (future)

#### Scenario: Feature usage tracking
- **GIVEN** user performs key actions (create book, add entry)
- **WHEN** action completes successfully
- **THEN** backend SHALL log feature usage event
- **AND** event SHALL include feature name and user ID (anonymized)
- **AND** metrics SHALL be aggregated for product insights

### Requirement: Incident Response
The system SHALL define incident response procedures for common failure scenarios with clear escalation paths.

**Rationale**: Documented procedures reduce resolution time, ensure consistent handling, and prevent panic during outages.

#### Scenario: Service outage response
- **GIVEN** uptime monitor detects downtime
- **WHEN** alert is received
- **THEN** oncall SHALL acknowledge alert within 15 minutes
- **AND** oncall SHALL check Railway/Vercel status pages
- **AND** oncall SHALL check Sentry for related errors
- **AND** oncall SHALL escalate if resolution exceeds 1 hour

#### Scenario: Database failure response
- **GIVEN** database becomes unreachable
- **WHEN** health check failures are detected
- **THEN** backend SHALL fail gracefully with 503 status
- **AND** oncall SHALL check Railway database status
- **AND** oncall SHALL initiate database restart if needed
- **AND** oncall SHALL restore from backup if data corruption suspected

#### Scenario: Critical bug response
- **GIVEN** high-severity bug is discovered in production
- **WHEN** bug affects multiple users
- **THEN** team SHALL assess impact and severity
- **AND** team SHALL decide: hotfix or rollback
- **AND** hotfix SHALL be tested via PR preview deployment before production
- **AND** rollback SHALL use Vercel/Railway rollback features for immediate mitigation

#### Scenario: Incident postmortem
- **GIVEN** incident is resolved
- **WHEN** incident duration exceeded 1 hour or affected >50 users
- **THEN** team SHALL write postmortem document
- **AND** postmortem SHALL include timeline, root cause, impact
- **AND** postmortem SHALL include action items to prevent recurrence
- **AND** action items SHALL be tracked to completion

### Requirement: Security Monitoring
The system SHALL monitor for security threats and suspicious activity with automated detection and alerting.

**Rationale**: Early detection of security incidents enables rapid response, limits damage, and protects user data.

#### Scenario: Failed authentication monitoring
- **GIVEN** user attempts login
- **WHEN** login fails due to invalid credentials
- **THEN** backend SHALL log failed attempt with IP address
- **AND** backend SHALL rate-limit login attempts (3 per email per hour)
- **AND** backend SHALL alert if failed attempts exceed 50 per hour (possible brute force)

#### Scenario: Unusual traffic pattern detection
- **GIVEN** application serves normal traffic
- **WHEN** request rate spikes 10x above baseline
- **THEN** Cloudflare SHALL detect potential DDoS attack
- **AND** Cloudflare SHALL enable "Under Attack" mode if needed
- **AND** team SHALL be alerted to investigate

#### Scenario: SQL injection attempt detection
- **GIVEN** Prisma handles database queries
- **WHEN** malicious input is provided
- **THEN** Prisma SHALL use parameterized queries (prevents injection)
- **AND** validation errors SHALL be logged
- **AND** suspicious patterns SHALL trigger security alert

#### Scenario: Unauthorized access attempt
- **GIVEN** API endpoint requires authentication
- **WHEN** request has invalid or missing JWT token
- **THEN** request SHALL be rejected with 401 status
- **AND** attempt SHALL be logged with IP and endpoint
- **AND** repeated attempts from same IP SHALL be rate-limited
