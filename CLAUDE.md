# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning, archive or proposals (words like proposal, spec, change, plan, task)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## OpenSpec Workflow Overview

This repository uses **OpenSpec**, a spec-driven development framework. All significant changes follow a three-stage workflow:

### Stage 1: Creating Proposals (use `/openspec:proposal`)

- Review context: `openspec list`, `openspec list --specs`, and `openspec/project.md`
- Scaffold change under `openspec/changes/<change-id>/`
- Create `proposal.md`, `tasks.md`, and spec deltas
- Validate with `openspec validate <change-id> --strict`
- **Do not implement until proposal is approved**

### Stage 2: Implementing Changes (use `/openspec:apply`)

- Read `proposal.md`, `design.md` (if present), and `tasks.md`
- Implement tasks sequentially
- Mark tasks complete only after verification
- Update `tasks.md` to reflect completed work

### Stage 3: Archiving Changes (use `/openspec:archive`)

- After deployment, run `openspec archive <change-id> --yes`
- Changes move to `changes/archive/YYYY-MM-DD-<change-id>/`
- Specs in `specs/` are updated to reflect new reality
- Validate with `openspec validate --strict`

## Key Commands

### OpenSpec CLI

```bash
# Discovery and context
openspec list                    # List active changes
openspec list --specs            # List current specifications
openspec show <item>             # Display change or spec details

# Validation
openspec validate <change-id> --strict   # Validate a specific change
openspec validate --strict               # Validate all changes

# Management
openspec archive <change-id> --yes       # Archive completed change
openspec update                          # Update OpenSpec instructions
```

### Slash Commands

```bash
/openspec:proposal   # Create a new OpenSpec change proposal
/openspec:apply      # Implement an approved change
/openspec:archive    # Archive a deployed change
```

## Architecture

### Directory Structure

```
openspec/
├── project.md              # Project conventions and context
├── AGENTS.md              # Comprehensive OpenSpec instructions
├── specs/                 # Current state - what IS built
│   └── [capability]/
│       ├── spec.md        # Requirements and scenarios
│       └── design.md      # Technical patterns
├── changes/               # Proposed changes - what SHOULD change
│   ├── [change-id]/
│   │   ├── proposal.md    # Why, what, impact
│   │   ├── tasks.md       # Implementation checklist
│   │   ├── design.md      # Technical decisions (optional)
│   │   └── specs/         # Delta changes
│   │       └── [capability]/
│   │           └── spec.md
│   └── archive/           # Completed changes
└── .claude/commands/openspec/  # Slash command definitions
```

### When to Create Proposals

**Required for:**

- New features or capabilities
- Breaking changes (API, schema, architecture)
- Performance optimizations that change behavior
- Security pattern updates

**Skip for:**

- Bug fixes (restoring intended behavior)
- Typos, formatting, comments
- Non-breaking dependency updates
- Test additions for existing behavior

## Spec Format Conventions

### Requirements

- Use `SHALL`/`MUST` for normative requirements
- Every requirement needs at least one scenario
- Use verb-led capability names: `user-auth`, `payment-capture`

### Scenarios

**Correct format:**

```markdown
#### Scenario: User login success

- **WHEN** valid credentials provided
- **THEN** return JWT token
```

### Delta Operations

```markdown
## ADDED Requirements # New capabilities

## MODIFIED Requirements # Changed behavior (paste full requirement)

## REMOVED Requirements # Deprecated features

## RENAMED Requirements # Name changes only
```

## Best Practices

### Simplicity First

- Default to <100 lines of new code per change
- Single-file implementations until proven insufficient
- Avoid frameworks without clear justification
- Choose boring, proven patterns

### Only Add Complexity When

- Performance data shows current solution is too slow
- Concrete scale requirements exist (>1000 users, >100MB data)
- Multiple proven use cases require abstraction

### Clear References

- Use `file.ts:42` format for code locations
- Reference specs as `specs/auth/spec.md`
- Link related changes and PRs in proposals

### Change ID Naming

- Use kebab-case, verb-led: `add-two-factor-auth`
- Common prefixes: `add-`, `update-`, `remove-`, `refactor-`
- Ensure uniqueness (append `-2`, `-3` if needed)

## Common Validation Errors

**"Change must have at least one delta"**

- Verify `changes/<id>/specs/` contains .md files
- Check files have operation headers (`## ADDED Requirements`)

**"Requirement must have at least one scenario"**

- Use `#### Scenario:` format (4 hashtags, not bullets)
- Debug with: `openspec show <change-id> --json --deltas-only`

**MODIFIED requirements lose details**

- Always paste the complete requirement from `specs/` before editing
- The archiver replaces the entire requirement with your delta content
