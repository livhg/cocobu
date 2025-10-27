# Specification: Backup and Disaster Recovery

## Overview
Defines backup strategies, disaster recovery procedures, data retention policies, and business continuity measures to prevent data loss and ensure rapid recovery from failures.

## ADDED Requirements

### Requirement: Database Backup
The system SHALL automatically backup MySQL database daily with retention policy and point-in-time recovery capability.

**Rationale**: Database contains critical user data (books, entries, splits). Regular backups prevent data loss from hardware failure, software bugs, or human error.

#### Scenario: Automatic daily backup
- **GIVEN** database is running on Railway
- **WHEN** daily backup time arrives (03:00 UTC)
- **THEN** Railway SHALL create full database backup
- **AND** backup SHALL include all tables and data
- **AND** backup SHALL be stored in Railway's backup storage
- **AND** backup creation SHALL NOT impact application performance
- **AND** backup completion SHALL be logged

#### Scenario: Backup retention
- **GIVEN** daily backups are created
- **WHEN** backups accumulate over time
- **THEN** last 7 daily backups SHALL be retained (Railway default)
- **AND** older backups SHALL be automatically deleted
- **AND** backup storage SHALL NOT exceed plan limits

#### Scenario: Manual backup creation
- **GIVEN** administrator needs backup before risky operation
- **WHEN** administrator triggers manual backup via Railway CLI or dashboard
- **THEN** Railway SHALL create immediate backup snapshot
- **AND** backup SHALL be tagged with reason/description
- **AND** manual backup SHALL NOT count toward daily backup limit

#### Scenario: Backup verification
- **GIVEN** backups are created regularly
- **WHEN** administrator verifies backup integrity
- **THEN** backup metadata SHALL show size, timestamp, status
- **AND** backup SHALL be downloadable for external storage (optional)
- **AND** backup restoration SHALL be testable in non-production environment

### Requirement: Database Restoration
The system SHALL support database restoration from backups with minimal downtime and data loss.

**Rationale**: Ability to restore from backups is critical for disaster recovery and must be tested regularly to ensure it works when needed.

#### Scenario: Restore from latest backup
- **GIVEN** database corruption or data loss occurs
- **WHEN** administrator initiates restore from latest backup
- **THEN** Railway SHALL stop current database instance
- **AND** Railway SHALL restore data from backup snapshot
- **AND** Railway SHALL start database with restored data
- **AND** restoration SHALL complete within 15 minutes
- **AND** application SHALL reconnect automatically

#### Scenario: Point-in-time recovery
- **GIVEN** administrator needs to recover to specific time
- **WHEN** restore operation specifies timestamp
- **THEN** system SHALL restore backup taken before that timestamp
- **AND** transaction logs SHALL be replayed to reach exact point in time (if available)
- **AND** data after that point SHALL be lost (understood and accepted)

#### Scenario: Partial data recovery
- **GIVEN** only specific data needs recovery (e.g., accidentally deleted book)
- **WHEN** administrator identifies affected records
- **THEN** backup SHALL be restored to separate staging database
- **AND** specific records SHALL be extracted via SQL queries
- **AND** records SHALL be re-imported to production database
- **AND** data integrity SHALL be verified after import

#### Scenario: Restoration testing
- **GIVEN** backups are created regularly
- **WHEN** quarterly restoration test is scheduled
- **THEN** latest backup SHALL be restored to staging environment
- **AND** application SHALL connect to restored database
- **AND** smoke tests SHALL verify data integrity
- **AND** test results SHALL be documented in runbook

### Requirement: File Backup and Versioning
The system SHALL store user-uploaded files in Cloudflare R2 with versioning enabled to prevent accidental deletion.

**Rationale**: User-uploaded receipts and attachments are irreplaceable. Versioning provides protection against accidental overwrites or deletions.

#### Scenario: File versioning enabled
- **GIVEN** R2 bucket is configured
- **WHEN** versioning is enabled in bucket settings
- **THEN** every file upload SHALL create new version
- **AND** previous versions SHALL be preserved
- **AND** latest version SHALL be served by default
- **AND** old versions SHALL be accessible via version ID

#### Scenario: File deletion with versioning
- **GIVEN** user or system deletes file
- **WHEN** delete operation occurs
- **THEN** R2 SHALL create delete marker (not permanent deletion)
- **AND** previous versions SHALL remain accessible
- **AND** file SHALL appear deleted to normal requests
- **AND** administrator SHALL be able to recover deleted file

#### Scenario: File recovery from version
- **GIVEN** file was accidentally deleted or overwritten
- **WHEN** administrator identifies version to recover
- **THEN** administrator SHALL restore specific version via R2 API
- **AND** restored version SHALL become current version
- **AND** recovery operation SHALL be logged

#### Scenario: Old version expiration
- **GIVEN** file versions accumulate over time
- **WHEN** version is older than retention period (30 days)
- **THEN** R2 SHALL automatically delete old versions
- **AND** current version SHALL NOT be affected
- **AND** storage costs SHALL be controlled

### Requirement: Application Code Recovery
The system SHALL use Git as source of truth with tagged releases for rollback capability.

**Rationale**: Git provides complete version history, enables rapid rollback, and serves as disaster recovery for source code.

#### Scenario: Release tagging
- **GIVEN** code is ready for production deployment
- **WHEN** deployment is triggered from main branch
- **THEN** commit SHALL be tagged with semantic version (v1.0.0)
- **AND** tag SHALL be pushed to GitHub
- **AND** tag SHALL be immutable (cannot be moved)
- **AND** deployment SHALL reference specific commit SHA

#### Scenario: Rollback to previous release
- **GIVEN** production deployment has critical bug
- **WHEN** administrator decides to rollback
- **THEN** previous git tag SHALL be identified (e.g., v0.9.5)
- **AND** Vercel/Railway SHALL redeploy from that tag
- **AND** rollback SHALL complete within 5 minutes
- **AND** database migrations SHALL be considered (may require manual rollback)

#### Scenario: Code repository backup
- **GIVEN** code is hosted on GitHub
- **WHEN** regular operations occur
- **THEN** GitHub SHALL maintain redundant copies
- **AND** repository SHALL be forkable for external backup
- **AND** critical repos MAY be mirrored to secondary git hosting (future)

### Requirement: Configuration Backup
The system SHALL document all infrastructure configuration as code or in runbooks for reproducibility.

**Rationale**: Infrastructure configuration is as critical as code. Documentation enables rapid rebuild in disaster scenarios.

#### Scenario: Infrastructure documentation
- **GIVEN** services are configured on Vercel, Railway, Cloudflare
- **WHEN** configuration changes are made
- **THEN** changes SHALL be documented in project README or runbook
- **AND** critical settings SHALL be exported when possible
- **AND** environment variables SHALL be listed (without sensitive values)
- **AND** DNS records SHALL be exported as zone file

#### Scenario: Environment variable backup
- **GIVEN** environment variables contain configuration
- **WHEN** administrator reviews environment setup
- **THEN** variable names and descriptions SHALL be documented
- **AND** non-sensitive values SHALL be stored in `.env.example`
- **AND** sensitive values SHALL be stored in password manager
- **AND** procedure SHALL exist to restore all variables

#### Scenario: Disaster recovery runbook
- **GIVEN** complete infrastructure failure occurs
- **WHEN** administrator needs to rebuild from scratch
- **THEN** runbook SHALL list all required services and accounts
- **AND** runbook SHALL include step-by-step setup instructions
- **AND** runbook SHALL reference configuration backups
- **AND** runbook SHALL be tested annually

### Requirement: Recovery Objectives
The system SHALL define and meet Recovery Time Objective (RTO) and Recovery Point Objective (RPO) targets appropriate for MVP stage.

**Rationale**: Explicit recovery objectives guide investment in backup infrastructure and set user expectations during incidents.

#### Scenario: Recovery Time Objective (RTO)
- **GIVEN** complete service outage occurs
- **WHEN** recovery procedures are initiated
- **THEN** service SHALL be restored within 4 hours (RTO target)
- **AND** basic functionality SHALL be available first
- **AND** full functionality SHALL follow
- **AND** if RTO is exceeded, escalation SHALL occur

#### Scenario: Recovery Point Objective (RPO)
- **GIVEN** data loss event occurs
- **WHEN** recovery is completed
- **THEN** data loss SHALL be limited to last 24 hours (RPO target)
- **AND** last successful backup SHALL be used
- **AND** users SHALL be informed of potential data loss window
- **AND** affected users SHALL be identified if possible

#### Scenario: Partial service degradation
- **GIVEN** specific feature fails (e.g., file uploads)
- **WHEN** core features remain operational
- **THEN** service SHALL continue with degraded functionality
- **AND** users SHALL see informative error messages
- **AND** status page SHALL communicate known issues
- **AND** full recovery SHALL be prioritized

### Requirement: Data Export for Users
The system SHALL provide data export functionality allowing users to download their complete data for portability and personal backup.

**Rationale**: GDPR requires data portability. User exports also provide additional protection against data loss and enable migrations.

#### Scenario: User data export request
- **GIVEN** authenticated user accesses account settings
- **WHEN** user requests data export
- **THEN** system SHALL generate export file with all user data
- **AND** export SHALL include books, entries, splits, categories, memberships
- **AND** export SHALL be in JSON format
- **AND** export SHALL be downloadable via secure link

#### Scenario: Export file contents
- **GIVEN** export is generated
- **WHEN** user opens export file
- **THEN** file SHALL contain complete, machine-readable data
- **AND** file SHALL include schema version for future compatibility
- **AND** file SHALL include creation timestamp
- **AND** file SHALL be importable to restore user data (future feature)

#### Scenario: Export privacy
- **GIVEN** user has shared books with other users
- **WHEN** export is generated
- **THEN** export SHALL include only user's own data and shared data they have access to
- **AND** export SHALL NOT include other users' personal information
- **AND** export SHALL include user's allocations in shared books

### Requirement: Incident Communication
The system SHALL maintain public status page and communication channels for transparency during incidents.

**Rationale**: Transparent communication reduces user frustration, builds trust, and reduces support burden during outages.

#### Scenario: Status page availability
- **GIVEN** application is deployed
- **WHEN** users visit status page (e.g., status.cocobu.com)
- **THEN** page SHALL show current operational status (operational, degraded, outage)
- **AND** page SHALL show status of each component (web, API, database)
- **AND** page SHALL show historical uptime statistics
- **AND** page SHALL be hosted separately from main application

#### Scenario: Incident reporting on status page
- **GIVEN** service outage is detected
- **WHEN** incident is confirmed
- **THEN** status page SHALL be updated to reflect outage
- **AND** incident description SHALL explain user impact
- **AND** estimated recovery time SHALL be provided if known
- **AND** updates SHALL be posted as recovery progresses

#### Scenario: Post-incident summary
- **GIVEN** incident is resolved
- **WHEN** service is restored
- **THEN** status page SHALL show "incident resolved" update
- **AND** incident timeline SHALL be summarized
- **AND** root cause SHALL be explained (if determined)
- **AND** preventive measures SHALL be mentioned

### Requirement: Business Continuity Planning
The system SHALL document business continuity procedures for various disaster scenarios including platform outages, team unavailability, and security breaches.

**Rationale**: Preparation for worst-case scenarios reduces impact and enables faster recovery when disasters occur.

#### Scenario: Platform provider outage
- **GIVEN** Railway or Vercel experiences extended outage
- **WHEN** services become unavailable
- **THEN** team SHALL assess impact and estimated recovery time
- **AND** team SHALL communicate via status page
- **AND** team SHALL consider migration to backup platform if outage exceeds 24 hours
- **AND** DNS changes SHALL enable quick platform switching

#### Scenario: Security breach response
- **GIVEN** security breach is detected or reported
- **WHEN** breach is confirmed
- **THEN** affected systems SHALL be isolated immediately
- **AND** all credentials and tokens SHALL be rotated
- **AND** users SHALL be notified within 72 hours (GDPR requirement)
- **AND** forensic analysis SHALL be conducted
- **AND** incident report SHALL be filed with authorities if required

#### Scenario: Key personnel unavailability
- **GIVEN** project owner or primary developer is unavailable
- **WHEN** critical incident occurs
- **THEN** backup contacts SHALL have access to admin credentials (via password manager)
- **AND** backup contacts SHALL have access to runbooks and documentation
- **AND** backup contacts SHALL be trained on recovery procedures
- **AND** all critical accesses SHALL have at least 2 people with access

#### Scenario: Data center failure
- **GIVEN** Railway's primary data center fails
- **WHEN** failover is needed
- **THEN** Railway's regional redundancy SHALL route to backup data center
- **AND** application SHALL continue serving traffic with possible increased latency
- **AND** monitoring SHALL verify failover success
- **AND** team SHALL be notified of regional failover

### Requirement: Regular Testing
The system SHALL conduct regular disaster recovery drills to validate procedures and identify gaps.

**Rationale**: Untested disaster recovery plans fail when needed most. Regular drills ensure procedures work and team is prepared.

#### Scenario: Quarterly restore drill
- **GIVEN** quarter ends
- **WHEN** restore drill is scheduled
- **THEN** team SHALL restore latest backup to staging environment
- **AND** team SHALL time the restoration process
- **AND** team SHALL verify application functionality with restored data
- **AND** team SHALL document any issues encountered
- **AND** runbooks SHALL be updated based on findings

#### Scenario: Annual disaster scenario exercise
- **GIVEN** year ends
- **WHEN** full disaster recovery exercise is conducted
- **THEN** team SHALL simulate complete infrastructure loss
- **AND** team SHALL follow runbooks to rebuild from scratch
- **AND** team SHALL measure time to recovery
- **AND** team SHALL identify gaps in documentation or access
- **AND** improvements SHALL be implemented before next exercise

#### Scenario: Failover testing
- **GIVEN** application runs on primary infrastructure
- **WHEN** failover test is conducted
- **THEN** team SHALL intentionally trigger failover to backup systems
- **AND** team SHALL verify automatic failover mechanisms work
- **AND** team SHALL measure user-visible downtime
- **AND** team SHALL document failover and fallback procedures
