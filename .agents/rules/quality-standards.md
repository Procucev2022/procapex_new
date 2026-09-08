# Antigravity Rule: Quality Check Pipeline, Strict Order & Gitignore Standards

## Rules for AI Agent Execution

### 1. Gitignore Maintenance & Auto-Update
- Agents must proactively inspect and auto-update `.gitignore` whenever introducing new files, dependencies, build directories, certificates, or local secrets.
- Exclude all dependencies (`node_modules/`), build outputs (`.next/`, `out/`, `dist/`), test coverage (`coverage/`), secrets/credentials (`.env*` except `.env.example`, `*.pem`, `*.key`), database files (`*.sqlite*`, `prisma/*.db`), and temporary logs.
- Never commit secrets or un-ignored build artifacts to git.

### 2. Structured Detailed Logging Across Application
- Agents MUST integrate structured logging using `import { logger } from '@/lib/logger'` across all API routes, state management, services, and components.
- Do NOT use raw `console.*` statements in application source code.
- Always include `module`, `message`, structured metadata (`data`), and `correlationId`.
- Use appropriate log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`).
- Server logs are persisted to `logs/app.log` and `logs/error.log` with automatic 5MB rotation and 7-day purging.
- Query and purge operations are exposed via `/api/logs`.

### 3. Separate Constants Architecture & Standards
- Keep all constant values, configuration dictionaries, lookup tables, and mock dataset definitions in dedicated files under `src/constants/` (`tenants.ts`, `procurement.ts`, `vendors.ts`, `boq.ts`, `masters.ts`, `navigation.ts`, `ai.ts`, `logging.ts`, `database.ts`, `graphql.ts`, `crypto.ts`, `diagnostics.ts`, `validation.ts`).
- Never define inline mock datasets, configuration dictionaries, or constant lists in components, hooks, or context files.
- Always import constants via the central `@/constants` alias.

### 4. Separate Data Types & Interfaces Architecture & Standards
- Declare all TypeScript types, interfaces, enums, and type aliases in dedicated files under `src/types/` (`procurement.ts`, `context.ts`, `components.ts`, `ai.ts`, `logger.ts`, `database.ts`, `graphql.ts`, `crypto.ts`, `diagnostics.ts`, `validation.ts`).
- Never define inline `interface` or `type` declarations inside components or runtime files.
- Always import types via the central `@/types` alias.

### 5. Database Optimization & Compute Minimization Standards
- Audit database queries using `dbAuditor` (`src/lib/db-auditor.ts`) and Prisma query middleware.
- Flag queries $\ge 100\text{ms}$ as slow queries and log with `logger.warn`.
- Utilize read-through query caching (`dbCache` in `src/lib/db-cache.ts`) with tag-based invalidation to minimize database compute hours and eliminate redundant queries.
- Prohibit unbounded queries; enforce selective projections and batching to eliminate N+1 roundtrips.

### 6. GraphQL Integration & Streamlined Data Fetching
- Maintain the unified GraphQL endpoint at `/api/graphql` with schema in `src/graphql/schema.ts` and resolvers in `src/graphql/resolvers.ts`.
- Streamline client queries by fetching exact selection sets without over/under-fetching.
- Apply complexity and payload bounds (`GRAPHQL_COMPLEXITY_LIMITS`).
- Connect resolvers to `dbCache` for reads and invalidate tags on mutations.

### 7. AES Encryption & Data Protection Standards
- Standardize on **AES-256-GCM** (`DEFAULT_AES_ALGORITHM`) authenticated encryption with 128-bit authentication tags to prevent data tampering.
- Cryptographic keys must be derived via **PBKDF2** with HMAC-SHA256, 100,000 iterations, and unique 16-byte random salts.
- Require fresh nonces/IVs (12 bytes for GCM) on every operation; never reuse nonces.
- Enforce field-level encryption (`encryptFields()`) on sensitive financial and procurement data, and deterministic blind indexing (`generateBlindIndex()`) for searchable encrypted fields.
- Strictly prohibit plaintext secret logging; audit events with metadata via `logger.debug`.

### 8. Auto-Resolve Bugs & Errors in Logs Standards
- Continuously monitor runtime logs (`logs/error.log`, `logs/app.log`) for unhandled exceptions, query failures, and client errors.
- Parse stack traces, error codes, and correlation IDs via `src/lib/log-analyzer.ts` or `npm run logs:analyze` to pinpoint culprit files and line numbers.
- Implement verified bug fixes targeting root causes, execute automated remediations (`npm run logs:auto-resolve`), and prevent recurring failures with regression tests.
- Validate every bug fix through the mandatory quality check pipeline (`npm run check:all`) to ensure zero regressions.

### 9. Input Schema Validation Standards
- Strictly enforce input schema validation across the entire application whenever any code change touches user or system inputs.
- Validate all frontend forms, API route bodies, query parameters, controller arguments, and HTTP headers before processing.
- All validation schemas must be defined in dedicated constants modules under `src/constants/validation.ts` (0 inline schemas).
- All validation types must be declared in `src/types/validation.ts` (0 inline types).
- Use `src/lib/validator.ts`: `validateSchema()`, `validateQueryParams()`, `validateHeaders()`.
- Return structured 400 errors for API validation failures and prevent invalid state transitions.

### 10. Internationalization (i18n) & UI Strings Architecture Standards (See: `.agents/rules/i18n-standards.md`)
- Strictly enforce i18n readiness across the application: zero hardcoded user-facing strings, labels, or literals embedded directly in JSX/TSX or application code.
- All user-facing text, titles, subtitles, descriptions, button labels, input placeholders, table headers, empty state notices, ARIA labels, and dialog copy must be declared in dedicated constants modules under `src/constants/strings.ts` and referenced via the centralized `UI_STRINGS` dictionary.
- Dynamic runtime values must use template placeholders (e.g. `'{round}'`, `'{name}'`, `'{count}'`, `'{tenantName}'`) formatted via the centralized `formatString(template, values)` helper (no string concatenation or ad-hoc template literals).
- All UI string types and dictionary interfaces must be declared in `src/types/strings.ts` and exported via `@/types`.
- Modernize all unit and integration tests to assert against `UI_STRINGS` constants (and `formatString` templates) instead of hardcoded strings to prevent brittle matches during UI copy updates.
- All i18n modules and helper utilities must achieve $\ge 90\%$ code coverage per file across all 4 parameters.

### 11. Strictest Linter Configuration & Code Quality Standards (See: `.agents/rules/linter-standards.md`)
- **Category A (Strong Typing & Error Prevention)**: Enforce `@typescript-eslint/no-explicit-any` (disallow any), `@typescript-eslint/explicit-function-return-type` (require return types), `@typescript-eslint/no-non-null-assertion` (disallow !), `@typescript-eslint/consistent-type-imports` (enforce `import type`), `@typescript-eslint/prefer-optional-chain`, `@typescript-eslint/no-unused-vars`, and `@typescript-eslint/naming-convention` (PascalCase for types/interfaces, camelCase for variables/functions).
- **Category B (React/Next.js & Accessibility)**: Enforce component hooks rules (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`), prohibit unsafe rendering (`react/no-danger`), consistent boolean properties (`react/jsx-boolean-value`), and strict web accessibility (`jsx-a11y/alt-text`, `jsx-a11y/no-redundant-roles`, `jsx-a11y/anchor-is-valid`).
- **Category C (General Quality & Formatting)**: Limit complexity (max 10), max-lines (300 per file), and max-len (120 chars). Prohibit hardcoded strings to ensure `UI_STRINGS` usage. Enforce single quotes, semicolons, multiline trailing commas, `prefer-const`, `no-var`, and `object-shorthand`.
- **Integrated Build & CI/CD**: Primary build runs `"next lint && next build"`. CI/CD blocks pull requests on any lint warnings or errors.

### 12. Mandatory Quality Check Execution
- AI coding agents must run quality checks after every change:
  - **Fast check for rapid development**:
    ```bash
    npm run check:fast
    ```
    Validates TypeScript types, runs tests on changed files only (`jest --onlyChanged`), lints modified files, and checks Prisma schema.
  - **Full quality check before concluding tasks**:
    ```bash
    npm run check:all
    ```
  - **Multi-project workspace check**:
    ```bash
    npm run check:workspace
    ```
    Recursively validates all projects in the workspace.

### 13. Strict Check Order: Build & Coverage Checked First
Full quality checks must follow this mandatory sequence:
1. **Build Verification**: `npm run build` (integrated `next lint && next build`)
2. **Unit Test Code Coverage**: `npm run test:coverage` (90% per-file benchmark across lines, statements, branches, and functions, `--detectOpenHandles`)
3. **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
4. **Lint**: `npm run lint` (`next lint`)
5. **Database Schema & Migrations**: `npm run db:validate` / apply pending migrations

### 14. Zero Tolerance for Coverage Regressions
- No files may be skipped.
- Per-file thresholds must strictly remain $\ge 90\%$ on all 4 metrics.

### 15. CI/CD Pull Request Pipeline & Quality Reporting
- Pull requests trigger `.github/workflows/pull-request.yml` with a strict job timeout (`timeout-minutes: 20`).
- Pipeline enforces Build $\rightarrow$ Unit Test Coverage ($\ge 90\%$ per file across all 4 metrics) $\rightarrow$ Typecheck $\rightarrow$ Lint $\rightarrow$ Database validation.
- Generates and publishes an automated PR summary comment detailing test pass/fail counts and overall & per-file coverage statistics (`npm run ci:summary`).


