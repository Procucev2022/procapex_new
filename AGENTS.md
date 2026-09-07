# AI Coding Agents Instructions & Standards

This document establishes mandatory rules and execution guidelines for all AI coding agents (**Antigravity**, **Cursor**, **Claude**, **Codex**, **Kiro**, **GitHub Copilot**, etc.) working on this repository.

---

## 🛡️ Gitignore & Repository Cleanliness Policy

### Auto-Updating `.gitignore`
All AI coding agents MUST inspect and auto-update [.gitignore](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.gitignore) whenever introducing new tools, dependencies, build outputs, or sensitive files.

1. **Auto-Update Mandate**:
   - If any change produces new generated files, build artifacts, temporary cache files, or local configuration files, the AI agent **MUST proactively update `.gitignore`** to ensure they are excluded from source control.
   - Run `git status` to verify no untracked build artifacts, caches, or secrets remain exposed.

2. **Strict Exclusions**:
   - **Dependencies**: `node_modules/`, `.pnp*`, `.yarn/*`, `.pnpm-store/`
   - **Build & Compilation**: `.next/`, `out/`, `build/`, `dist/`, `.swc/`, `.turbo/`, `*.tsbuildinfo`, `tsconfig.tsbuildinfo`, `next-env.d.ts`
   - **Testing & Coverage**: `coverage/`, `*.lcov`, `.nyc_output/`
   - **Secrets & Credentials (CRITICAL)**: `.env`, `.env*.local`, `*.pem`, `*.key`, `*.cert`, `*.crt`, `*.pfx`, `credentials.json`, `service-account*.json` (Only `.env.example` may be committed).
   - **Database & Local Storage**: `*.sqlite*`, `*.db`, `*.db-journal`, `prisma/*.db`
   - **Logs**: `*.log`, `logs/`, `npm-debug.log*`, `yarn-error.log*`, etc.
   - **OS & IDE files**: `.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/*`
   - **Scratch & Agent Caches**: `tmp/`, `temp/`, `.agents/**/cache/`, `.agents/**/scratch/`

# ==============================================================================
# 📝 Structured Detailed Logging Standards
# ==============================================================================

### Mandatory Logging Across Application
All AI coding agents MUST incorporate detailed, structured logging across all new or modified features, API routes, services, state transitions, and components using the centralized logger:
```typescript
import { logger } from '@/lib/logger';
```

1. **No Ad-Hoc `console.*` Calls**:
   - Application code must never use raw `console.log`, `console.warn`, or `console.error`.
   - Always route logs through `logger.info`, `logger.debug`, `logger.warn`, or `logger.error`.

2. **Required Log Attributes**:
   - **Module**: Clear path identifier (e.g. `'api/cost-analysis'`, `'lib/gemini'`, `'context/procurement'`).
   - **Message**: Concise description of the event or milestone.
   - **Data / Metadata**: Structured payload (e.g. request parameters, calculation results, timing `durationMs`, error objects).
   - **Correlation ID**: Unique trace identifier for correlating API requests and downstream operations (`req-...`).

3. **Log Severity Levels**:
   - **`DEBUG`**: Granular internal state, prompt payloads, intermediate computations.
   - **`INFO`**: Key business milestones, API requests, state changes, approvals, PO creations.
   - **`WARN`**: Fallbacks, heuristic downgrades, non-critical validation rejections.
   - **`ERROR`**: Caught exceptions and failures, always including error message and stack trace.

4. **Local Persistence, Searchability & Automatic Purging**:
   - When running locally or on server runtime, logs are persisted to `logs/app.log` and `logs/error.log`.
   - Log files rotate automatically at 5MB.
   - Automatic purging cleans up logs older than retention policy (default 7 days) to manage storage and compliance.
   - Search, filter, and purge logs via `GET /api/logs` or `POST /api/logs`.

---

## 📦 Separate Constants Architecture & Standards

All AI coding agents MUST strictly maintain all constant values, configuration dictionaries, lookup tables, and mock dataset definitions in dedicated constant files under `src/constants/`.

1. **Mandatory Centralization**:
   - Application components, contexts, API routes, and hooks MUST NOT define inline mock datasets, lookup tables, or magic constant values.
   - All constants must be placed in modular files within `src/constants/`:
     - `src/constants/tenants.ts`: Multi-tenant enterprise configurations and tenant rosters (`TENANTS`).
     - `src/constants/procurement.ts`: Requisition, quotation, negotiation, PPO, PO, and audit trail constants.
     - `src/constants/vendors.ts`: Vendor database, ratings, and quote items.
     - `src/constants/boq.ts`: BOQ catalogues, drawing scopes, and commercial counter items.
     - `src/constants/masters.ts`: Standard master rate cards and catalog benchmarks.
     - `src/constants/navigation.ts`: Application navigation items and role routing definitions.
     - `src/constants/ai.ts`: AI model defaults, MLEO ratios, inflators, and negotiation scripts.
     - `src/constants/logging.ts`: Logging thresholds, severity mappings, retention limits.
     - `src/constants/index.ts`: Central barrel exporting all constants.

2. **Clean Imports**:
   - Always import constants using the `@/constants` path alias:
     ```typescript
     import { TENANTS, COMMERCIAL_COUNTER_ITEMS, NAV_ITEMS } from '@/constants';
     ```

---

## 🏷️ Separate Data Types & Interfaces Architecture & Standards

All AI coding agents MUST strictly declare all TypeScript types, interfaces, enums, and type aliases in dedicated type definition files under `src/types/`.

1. **Zero Inline Types/Interfaces**:
   - No `interface` or `type` declarations may be defined inline inside components, hooks, contexts, or API routes.
   - All data contracts must be declared in modular files within `src/types/`:
     - `src/types/procurement.ts`: Domain models (`PurchaseRequest`, `BOQItem`, `PPOItem`, `PurchaseOrder`, `AuditLog`, `TenantConfig`, etc.).
     - `src/types/context.ts`: State management context contracts (`ProcurementContextType`).
     - `src/types/components.ts`: Component props and UI-specific data structures (`HeaderProps`, `DashboardProps`, `PRModuleProps`, etc.).
     - `src/types/ai.ts`: AI service and cost breakdown interfaces (`MLEOCostBreakdown`, `NegotiationParams`, etc.).
     - `src/types/logger.ts`: Logger domain types (`LogLevel`, `LogEntry`, `LoggerConfig`, etc.).
     - `src/types/index.ts`: Central barrel re-exporting all types.

2. **Clean Type Imports**:
   - Always import types using the `@/types` path alias:
     ```typescript
     import { PurchaseRequest, HeaderProps, UserRole, TenantKey } from '@/types';
     ```

---

## ⚡ Database Optimization & Compute Minimization Standards

All AI coding agents MUST audit database queries for efficiency and implement optimizations to minimize database compute hours, reduce resource usage, and maximize infrastructure efficiency.

1. **Mandatory Query Auditing**:
   - Every database interaction must be tracked through `dbAuditor` (`src/lib/db-auditor.ts`) and the Prisma query middleware.
   - Queries executing $\ge 100\text{ms}$ (`slowQueryThresholdMs`) MUST be flagged as slow queries and logged with `logger.warn`.
   - Regularly inspect database efficiency metrics via `dbAuditor.getMetrics()` or the `databaseAuditMetrics` GraphQL query.

2. **Compute Hour Minimization via Intelligent Caching**:
   - AI agents MUST use the centralized read-through query cache (`dbCache` in `src/lib/db-cache.ts`) for all read-heavy, low-churn datasets (e.g. `tenants`, `mastersRateCards`, `vendors`, active `purchaseRequests`).
   - Read queries must declare appropriate cache tags (`CACHE_TAGS` from `@/constants`).
   - Write and mutation operations MUST immediately invalidate the corresponding cache tags (`dbCache.invalidateByTag(tag)`) to guarantee read-after-write consistency while preventing redundant database compute hours.

3. **Selective Field Projections & Zero N+1 Queries**:
   - Prohibit unbounded queries and `SELECT *` patterns. Always specify explicit `select` fields in Prisma or explicit selection sets in GraphQL.
   - Batch entity resolutions to prevent N+1 query waterfalls.

4. **Connection Pooling & Resource Limits**:
   - Enforce connection pool constraints and query timeouts.
   - Never leave unclosed Prisma connections in tests or long-running tasks.

---

## 🌐 GraphQL Integration & Streamlined Data Fetching Standards

All AI coding agents MUST utilize and maintain the centralized GraphQL layer at `/api/graphql` to streamline data fetching across the application.

1. **Schema-First Data Fetching**:
   - All GraphQL types, queries, and mutations must be declared in `src/graphql/schema.ts` and resolved in `src/graphql/resolvers.ts`.
   - Prevent over-fetching and under-fetching by defining granular, reusable GraphQL types and selective field resolution.

2. **Query Complexity & Security Bounds**:
   - All incoming GraphQL operations must adhere to `GRAPHQL_COMPLEXITY_LIMITS` (maximum payload length, pagination limits).
   - Reject malformed or excessively deep queries with structured error responses (`GRAPHQL_ERROR_CODES`).

3. **Structured Operation Logging & Correlation**:
   - Route handlers in `/api/graphql` MUST generate a unique `correlationId` (`gql-...`) and log operation execution time, error counts, and compute hours saved.

4. **Cache-Aware Resolvers**:
   - GraphQL query resolvers MUST leverage `dbCache.wrap()` to serve repeated reads from memory.
   - GraphQL mutations MUST invoke `dbCache.invalidateByTag()` upon successful database writes.

---

## 🔐 AES Encryption & Data Protection Standards

All AI coding agents MUST incorporate AES encryption algorithms to guarantee the protection, integrity, and secure processing of sensitive enterprise data.

1. **Standard Cryptographic Algorithms**:
   - **Default Algorithm**: **AES-256-GCM** (`DEFAULT_AES_ALGORITHM` from `@/constants`), providing Authenticated Encryption with Associated Data (AEAD) to prevent tampering, bit-flipping, and padding oracle attacks.
   - **Supported Fallbacks**: **AES-256-CBC** (`'aes-256-cbc'`) for legacy interop.
   - **Zero Custom Ciphers**: Always use Node.js native `crypto` module via the centralized utility `src/lib/crypto.ts`.

2. **Nonce/IV, Salt & Key Derivation Requirements**:
   - **Key Derivation**: Cryptographic keys MUST be derived using **PBKDF2** with HMAC-SHA256, 100,000 iterations (`PBKDF2_ITERATIONS`), and a unique 16-byte random salt (`AES_SALT_LENGTH_BYTES`).
   - **Unique Initialization Vectors**: Every encryption operation MUST generate a fresh, cryptographically random IV (12 bytes for GCM, 16 bytes for CBC). Nonces must NEVER be reused across encryptions.
   - **128-bit Authentication Tag**: In AES-GCM mode, the 16-byte authentication tag MUST be verified during decryption. If tag verification fails, decryption must immediately abort.

3. **Field-Level Encryption & Blind Indexing**:
   - Sensitive business data (payment terms, vendor quotes, financial details, audit trails) must be encrypted using `encryptFields()` or `encrypt()`.
   - Searchable encrypted fields MUST utilize deterministic blind indexing (`generateBlindIndex()`) with HMAC-SHA256 to allow lookups without decrypting.

4. **Zero Plaintext & Secret Leakage in Logs**:
   - Never log raw plaintext, sensitive secrets, or encryption keys in application logs.
   - Route cryptographic event tracking through `logger.debug` with metadata (algorithm, durationMs, bytesProcessed).

---

## 🐛 Auto-Resolve Bugs & Errors in Logs Standards

All AI coding agents MUST continuously monitor, analyze, and resolve application bugs and runtime errors captured in log files (`logs/error.log`, `logs/app.log`).

1. **Automated Log Monitoring & Stack Trace Parsing**:
   - Whenever test failures, API errors, or unhandled rejections occur, agents MUST inspect log files and parse runtime log outputs, stack traces, and error codes.
   - Utilize the centralized diagnostics engine (`src/lib/log-analyzer.ts`) or run `npm run logs:analyze` to extract:
     - Error category (`TYPE_ERROR`, `DATABASE_ERROR`, `GRAPHQL_ERROR`, `CRYPTO_ERROR`, etc.).
     - Culprit file path and line number from parsed stack frames.
     - Correlation ID (`req-...`, `gql-...`) to trace associated state and input payloads.

2. **Root Cause Diagnosis & Verified Bug Resolution**:
   - Trace underlying issues beyond surface symptoms (e.g. missing null guards, broken type contracts, stale cache entries, schema drift).
   - Implement verified code fixes targeting the root cause to prevent recurring failures.
   - Add dedicated regression test cases in `tests/` covering the failure condition.

3. **Mandatory Quality Check Verification for All Bug Fixes**:
   - Every bug fix MUST be validated through the full quality check pipeline:
     - Production Build: `npm run build` with 0 errors.
     - Unit Test Code Coverage: $\ge 90\%$ per file across all 4 parameters (`npm run test:coverage`).
     - TypeScript: `npm run typecheck` (`tsc --noEmit`).
     - Linting: `npm run lint` (`next lint`).
     - Database: `npm run db:validate`.
   - Never consider a bug resolved until all verification stages pass with 0 regressions.

---

## ⚡ Quality Check & Verification Requirements

### Mandatory Quality Check Execution
After **every change**, AI coding agents MUST run the appropriate quality check commands to verify that no build issues, typecheck issues, lint issues, or unit test coverage degradations exist, and that database schemas and migrations are valid.

### 🥇 Strict Check Order: Build & Unit Test Coverage FIRST
Quality checks must execute in this exact sequence:
1. **Build Verification**: Run `npm run build` to ensure Next.js / framework compilation succeeds with 0 errors.
2. **Unit Test Code Coverage**: Run `npm run test:coverage` to verify the strict **$\ge 90\%$ benchmark per file** across all four metrics (lines, statements, branches, functions) with `--detectOpenHandles`.
3. **TypeScript Typecheck**: Run `npm run typecheck` (`tsc --noEmit`) to verify 0 type errors.
4. **Linting**: Run `npm run lint` (`next lint`) to verify 0 ESLint errors or warnings.
5. **Database Schema & Migrations**: Run `npm run db:validate` (`prisma validate`) and apply any pending migrations (`npm run db:migrate` / `prisma db push`) if database changes were made.

---

## 🎯 Mandatory Unit Test Code Coverage Benchmark: 90% Per File

1. **Strict 90% Per-File Threshold**:
   - Every source code file (`src/**/*.{ts,tsx}`) MUST achieve at least **90% coverage** across **all four parameters**:
     - **Lines**: $\ge 90\%$
     - **Statements**: $\ge 90\%$
     - **Branches**: $\ge 90\%$
     - **Functions**: $\ge 90\%$
   - If per-file coverage on any single file dips below 90% on any metric, Jest will fail and the task is considered incomplete.

2. **No Skipping Allowed**:
   - DO NOT skip any file or exclude application logic from coverage.
   - All newly added components, API routes, hooks, utility functions, or state context modules must have dedicated test suites in `tests/`.

3. **Global Timeout & Open Handles**:
   - All unit tests must be configured with a global timeout (`testTimeout: 30000`) in `jest.config.js`.
   - The `--detectOpenHandles` flag is mandatory during test execution to catch hanging asynchronous calls, timer leaks, or unclosed database/network connections.

---

## 🚀 Quality Check Commands Reference

| Command | Purpose | When to Use |
| :--- | :--- | :--- |
| `npm run check:fast` | **Fast Change Check**: Incremental typecheck + Jest `--onlyChanged` + fast lint + schema validation | **During rapid iterative development** on modified files |
| `npm run check:all` (or `npm run check`) | **Full Quality Check**: Strict order (Build $\rightarrow$ Coverage $\ge 90\%$ $\rightarrow$ Typecheck $\rightarrow$ Lint $\rightarrow$ Database) | **Mandatory before completing any task** |
| `npm run check:workspace` | **Global Workspace Check**: Recursively inspects and executes quality checks across all projects in the workspace | **In multi-project workspaces / monorepos** |
| `npm run build` | Next.js production build | Build verification |
| `npm run test:coverage` | Full test suite with per-file coverage enforcement | Full coverage audit |
| `npm run typecheck` | TypeScript compiler typecheck (`tsc --noEmit`) | Type verification |
| `npm run lint` | ESLint Next.js core web vitals check | Code style and lint validation |
| `npm run db:validate` | Validates Prisma schema models and syntax | Schema integrity check |
| `npm run db:migrate` | Applies pending Prisma migrations in development | Database schema migration |
| `npm run db:view` | Opens Prisma Studio GUI | Database record inspection |

---

## 🌐 Multi-Project Workspace Guidelines
In case of multiple projects in the workspace:
1. AI agents must execute global workspace check commands (`npm run check:workspace` or `node scripts/quality-check.js --workspace`).
2. The global runner automatically discovers all project roots containing a `package.json` (excluding dependencies and build folders) and runs the quality check pipeline across all projects.
3. Every individual project in the workspace must pass build, test coverage, typecheck, lint, and database checks with 0 errors.

---

## 📋 Best Practices for Writing Unit Tests
- Use **React Testing Library** for UI components (`render`, `screen`, `fireEvent`, `waitFor`).
- Mock external network APIs (`fetch`, Google Gemini API) and database calls (`PrismaClient`).
- Test both sunny-day (success paths) and rainy-day (errors, edge cases, missing parameters) scenarios to maximize branch and statement coverage.
- Always cleanly unmount components and clear mock calls between tests (`jest.clearAllMocks()`).

---

## 🔄 CI/CD Pull Request Workflow & PR Quality Comments

### GitHub Actions Pull Request Pipeline
Every pull request to `main`, `master`, or `develop` triggers the automated CI/CD workflow ([`.github/workflows/pull-request.yml`](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.github/workflows/pull-request.yml)).

1. **Pipeline Timeout Enforced**:
   - Every CI/CD job MUST configure a hard execution timeout (`timeout-minutes: 20`) to prevent hanging jobs and resource exhaustion.

2. **Quality Requirements Enforced**:
   - **Production Build (`npm run build`)**: Must compile with 0 errors.
   - **Unit Test Coverage Benchmark (`npm run test:coverage`)**: Strict $\ge 90\%$ benchmark per file across lines, statements, branches, and functions with `--detectOpenHandles`.
   - **TypeScript Typecheck (`npm run typecheck`)**: 0 type errors.
   - **ESLint Code Quality (`npm run lint`)**: 0 warnings or errors.
   - **Database Schema Validation (`npm run db:validate`)**: Valid Prisma models.

3. **Automated PR Test & Coverage Summary Comments**:
   - The workflow executes `scripts/generate-pr-summary.js` (or `npm run ci:summary`) on every run (using `if: always()`).
   - Posts or updates an idempotent Markdown comment on the pull request (tagged `<!-- procpx-ci-report -->`).
   - Summary includes:
     - Overall Pipeline Status badge (✅ PASSED / ❌ FAILED).
     - Test execution metrics (passed, failed, skipped test suites and individual tests, runtime duration).
     - Clean open handles verification.
     - Code coverage metrics (Statements %, Branches %, Functions %, Lines %).
     - Per-file benchmark compliance table highlighting any files below 90%.

