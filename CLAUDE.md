# CLAUDE.md - AI Coding Instructions for Claude

## Quality Check & Gitignore Standards

### 🛡️ Gitignore Auto-Update Policy
- Claude must proactively inspect and auto-update [.gitignore](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.gitignore) whenever introducing new generated files, dependencies, build artifacts, certificates, secret files, or temporary caches.
- Never commit `.env`, secrets, credentials, or generated files.

### 📝 Structured Detailed Logging Standards
- Claude must incorporate structured detailed logging using `import { logger } from '@/lib/logger'` across all API routes, state actions, services, and components.
- Do not use raw `console.*` calls in application code.
- Always include `module`, `message`, structured metadata (`data`), and `correlationId` where applicable.
- Use appropriate log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`).
- Server logs are persisted to `logs/app.log` and `logs/error.log` with automatic 5MB rotation and automatic 7-day purging.
- Logs can be searched or purged via `/api/logs`.

### 📦 Separate Constants Architecture & Standards
- Claude must maintain all constants, lookup tables, and mock datasets in separate files under `src/constants/` (`tenants.ts`, `procurement.ts`, `vendors.ts`, `boq.ts`, `masters.ts`, `navigation.ts`, `ai.ts`, `logging.ts`, `database.ts`, `graphql.ts`, `crypto.ts`, `diagnostics.ts`, `validation.ts`).
- Never define inline mock datasets, configuration dictionaries, or constant lists in components, hooks, or context files.
- Always import constants via the central `@/constants` alias.

### 🏷️ Separate Data Types & Interfaces Architecture & Standards
- Claude must declare all TypeScript types, interfaces, enums, and type aliases in separate files under `src/types/` (`procurement.ts`, `context.ts`, `components.ts`, `ai.ts`, `logger.ts`, `database.ts`, `graphql.ts`, `crypto.ts`, `diagnostics.ts`, `validation.ts`).
- Never define inline `interface` or `type` declarations inside components or runtime files.
- Always import types via the central `@/types` alias.

### ⚡ Database Optimization & Compute Minimization Standards
- Audit database queries using `dbAuditor` (`src/lib/db-auditor.ts`).
- Queries $\ge 100\text{ms}$ must be flagged as slow queries and logged via `logger.warn`.
- Use read-through caching (`dbCache` in `src/lib/db-cache.ts`) with tag-based invalidation to minimize database compute hours and avoid redundant roundtrips.
- Enforce selective projections (avoid `SELECT *`) and eliminate N+1 queries through batching.

### 🌐 GraphQL Integration & Streamlined Data Fetching
- Maintain the unified GraphQL endpoint at `/api/graphql` with schema in `src/graphql/schema.ts` and resolvers in `src/graphql/resolvers.ts`.
- Streamline client data fetching by requesting exact selection sets without over-fetching or under-fetching.
- Enforce complexity limits (`GRAPHQL_COMPLEXITY_LIMITS`) and structured logging with correlation IDs on all operations.
- Ensure GraphQL resolvers leverage `dbCache` for reads and invalidate tags on mutations.

### 🔐 AES Encryption & Data Protection Standards
- Use **AES-256-GCM** authenticated encryption (`DEFAULT_AES_ALGORITHM` from `@/constants`) as the default standard for securing sensitive data.
- Derive keys via **PBKDF2** with HMAC-SHA256, 100,000 iterations, and a unique 16-byte random salt per operation.
- Use unique nonces/IVs (12 bytes for GCM) and strictly verify 128-bit authentication tags on decryption.
- Implement field-level encryption (`encryptFields()`) for sensitive financial/payment details and deterministic blind indexing (`generateBlindIndex()`) for searchable encrypted fields.
- Never log plaintext secrets; trace operations via `logger.debug` with cryptographic metadata.

### 🐛 Auto-Resolve Bugs & Errors in Logs
- Continuously monitor and analyze application logs (`logs/error.log`, `logs/app.log`) and runtime error streams.
- Automatically parse stack traces, error codes, and correlation IDs using `src/lib/log-analyzer.ts` or `npm run logs:analyze` to diagnose root causes.
- Implement verified bug fixes targeting underlying defects, apply automated resolutions (`npm run logs:auto-resolve`), and add regression tests.
- Validate all bug fixes through the mandatory quality check pipeline (`npm run check:all`: Build $\rightarrow$ Coverage $\ge 90\%$ $\rightarrow$ Typecheck $\rightarrow$ Lint $\rightarrow$ Database validation).

### 🛡️ Input Schema Validation Standards
- Strictly enforce input schema validation across the entire application whenever any code change touches user or system inputs.
- Every entry point accepting external data (frontend forms, API routes, controller bodies, query parameters, headers) MUST validate against a schema before processing.
- All validation schemas, field rules, and constraints MUST be declared in dedicated constants modules under `src/constants/validation.ts` and exported via `@/constants`. Zero inline schemas allowed.
- All validation types must be declared in `src/types/validation.ts` and exported via `@/types`.
- Use the centralized validation engine (`src/lib/validator.ts`): `validateSchema()`, `validateQueryParams()`, `validateHeaders()`.
- Return HTTP 400 on validation failure in API routes; log warnings and reject invalid mutations in state/services.

### 🌐 Internationalization (i18n) & UI Strings Architecture Standards (See: `.agents/rules/i18n-standards.md`)
- Strictly enforce i18n readiness across the application: zero hardcoded user-facing strings, labels, or literals embedded directly in JSX/TSX or application code.
- All user-facing text, titles, descriptions, button labels, input placeholders, table headers, empty state notices, ARIA labels, and dialog copy must be declared in dedicated constants modules under `src/constants/strings.ts` and referenced via the centralized `UI_STRINGS` dictionary.
- Use template placeholders (e.g. `'{round}'`, `'{name}'`, `'{count}'`, `'{tenantName}'`) with the centralized `formatString(template, values)` helper for dynamic runtime substitution (never use inline concatenation or ad-hoc template literals).
- All UI string types and dictionary interfaces must be declared in `src/types/strings.ts` and exported via `@/types`.
- Modernize all unit and integration tests to assert against `UI_STRINGS` constants (and `formatString` templates) instead of hardcoded strings to prevent brittle matches during UI copy updates.
- Maintain strict $\ge 90\%$ code coverage across all metrics for i18n modules, helpers, and components.

### ⚡ Mandatory Quality Checks After Every Change
After every change, run the appropriate quality checks:
- **Fast iterations on changed files**:
  ```bash
  npm run check:fast
  ```
  Runs incremental typecheck, tests only changed files (`jest --onlyChanged`), lints modified files, and validates Prisma schema.
- **Before completing any task (Full Check)**:
  ```bash
  npm run check:all
  ```
  Runs the full pipeline in mandatory strict order.

### 🥇 Strict Quality Check Order
1. **Build Verification**: `npm run build`
2. **Unit Test Code Coverage**: `npm run test:coverage` (strict 90% benchmark per file across lines, statements, branches, and functions)
3. **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
4. **Lint**: `npm run lint` (`next lint`)
5. **Database Schema & Migrations**: `npm run db:validate` / apply pending migrations

### 🎯 Mandatory 90% Unit Test Code Coverage
- Every file in `src/**/*.{ts,tsx}` must satisfy $\ge 90\%$ code coverage individually on Lines, Statements, Branches, and Functions.
- All tests must run with `--detectOpenHandles` and respect the 30s timeout.

### 🌐 Multi-Project Workspace
- In multi-project workspaces, use:
  ```bash
  npm run check:workspace
  ```
  to check all projects globally across the workspace.

### 🔄 CI/CD Pull Request Workflow & PR Comments
- All PRs trigger `.github/workflows/pull-request.yml` with a hard timeout (`timeout-minutes: 20`).
- Pipeline sequentially validates: Build $\rightarrow$ Unit Test Coverage ($\ge 90\%$ per file across lines, statements, branches, and functions, `--detectOpenHandles`) $\rightarrow$ Typecheck $\rightarrow$ Lint $\rightarrow$ Database validation.
- Automatically generates and posts/updates PR summary comments (`npm run ci:summary`) displaying unit test results (pass/fail/skipped), execution time, and overall & per-file coverage statistics.

