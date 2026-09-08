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
     - `src/constants/validation.ts`: Reusable input validation schemas for frontend forms, API routes, query parameters, and headers.
     - `src/constants/strings.ts`: Centralized UI strings dictionary (`UI_STRINGS`), namespaces, and `formatString` template substitution helper.
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
     - `src/types/validation.ts`: Validation schema interfaces, field rules, validation errors, and result contracts (`ValidationResult`, `ObjectSchema`, etc.).
     - `src/types/strings.ts`: UI string dictionary interfaces, translation schemas, template placeholder parameters (`StringTemplateValues`, `UIStringsDictionary`).
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

## 🛡️ Input Schema Validation Standards

All AI coding agents MUST strictly enforce input schema validation across the entire application whenever any code change touches user or system inputs.

1. **Mandatory Validation for All Inputs**:
   - Every entry point accepting user or system data MUST validate the incoming payload against a schema before processing. This includes:
     - **Frontend Forms**: Purchase request submission, BOQ item creation, vendor quotations, negotiation rounds, PPO creation, and payment term modifications.
     - **API Routes**: All route handlers (`/api/**`) MUST validate request bodies, query parameters, and headers.
     - **Controller & Service Methods**: Method arguments receiving external data must be validated.
     - **Query Parameters**: Coerced and validated for expected types, bounds, and allowable values.
     - **Headers**: Enforce presence and format of required headers (e.g., `content-type`, `authorization`, `x-correlation-id`).

2. **Dedicated Constants Modules for All Schemas (Zero Inline Schemas)**:
   - All validation schemas, rules, field constraints, range limits, and regex patterns MUST be defined in dedicated constants files (`src/constants/validation.ts`) and exported via `@/constants`.
   - Application components, contexts, API routes, and hooks MUST NOT declare inline schemas or ad-hoc validation rules.
   - All validation types and result contracts MUST be defined in `src/types/validation.ts` and exported via `@/types`.

3. **Centralized Validator Engine**:
   - Use the centralized validation engine (`src/lib/validator.ts`):
     - `validateSchema(data, schema)`: Validates structured payloads and returns typed results `{ isValid, data, errors }`.
     - `validateQueryParams(searchParams, schema)`: Coerces and validates URL query parameters.
     - `validateHeaders(headers, schema)`: Validates case-insensitive HTTP request headers.
   - On validation failure in API routes, immediately return HTTP 400 with structured validation error payloads (`{ error, details }`).
   - On validation failure in state context or services, reject invalid mutations and log structured warnings via `logger.warn`.

4. **Zero Regressions & Quality Assurance**:
   - All validation schemas and engine utilities must maintain $\ge 90\%$ unit test coverage per file across all 4 metrics.
   - Every input validation change must pass the full quality check pipeline (`npm run check:all`).

---

## 🌐 Internationalization (i18n) & UI Strings Architecture Standards

All AI coding agents MUST strictly enforce internationalization (i18n) readiness across the entire application whenever introducing, modifying, or refactoring user interfaces, components, forms, dialogs, or user-facing messaging (see dedicated rule: [`.agents/rules/i18n-standards.md`](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.agents/rules/i18n-standards.md)).

1. **Zero Hardcoded User-Facing Strings & Literals (Mandatory Enforcement)**:
   - Application components, views, modals, forms, tables, badges, tooltips, dialogs, and navigation elements MUST NOT embed raw user-facing literal strings in JSX/TSX or application code.
   - All user-facing text, titles, descriptions, button labels, form placeholders, table headers, empty state notices, ARIA labels, and error messages MUST be defined in dedicated constants modules (`src/constants/strings.ts`) and referenced via the centralized `UI_STRINGS` dictionary.
   - Never write hardcoded copy such as `<h1>Multi-Tenancy Architecture</h1>` or `<button>Submit</button>`. Always write `<h1>{UI_STRINGS.tenantOverview.title}</h1>` or `<button>{UI_STRINGS.common.submit}</button>`.

2. **Template Placeholders for Dynamic Runtime Substitution**:
   - For strings containing dynamic or computed values (e.g. counts, names, amounts, round numbers, IDs), agents MUST NOT use inline string concatenation or ad-hoc template literals (e.g. prohibited: `"Round " + round` or `` `Showing ${count} results` ``).
   - Dynamic strings MUST be declared as template strings using `{placeholder}` tokens (e.g. `'Negotiation Round {round}'`, `'{tenantName} – Sourcing Command'`, `'{count} Items'`).
   - Components MUST interpolate these tokens at runtime using the centralized interpolation helper:
     ```typescript
     import { UI_STRINGS, formatString } from '@/constants';

     const heading = formatString(UI_STRINGS.dashboard.sourcingCommandTemplate, {
       tenantName: activeTenant.name,
     });

     const itemsLabel = formatString(UI_STRINGS.prModule.itemsCountTemplate, {
       count: pr.items.length,
     });
     ```

3. **Dedicated Types & Contracts Architecture (Zero Inline Types)**:
   - All string dictionary structures, template value contracts, and locale definitions MUST be declared in `src/types/strings.ts` and re-exported via `@/types`.
   - Each component or domain namespace (`common`, `header`, `dashboard`, `tenantOverview`, `prModule`, etc.) has a dedicated interface enforcing type safety.

4. **Test Modernization & Non-Brittle Assertions**:
   - Unit and integration tests (`tests/`) MUST NOT assert against hardcoded string literals or brittle regular expressions.
   - All tests MUST query and assert against `UI_STRINGS` constants (and `formatString` templates when testing dynamic content):
     ```typescript
     import { UI_STRINGS, formatString } from '@/constants';

     expect(screen.getByText(UI_STRINGS.tenantOverview.title)).toBeInTheDocument();
     expect(screen.getByRole('button', { name: UI_STRINGS.common.submit })).toBeInTheDocument();
     expect(
       screen.getByText(
         formatString(UI_STRINGS.dashboard.sourcingCommandTemplate, { tenantName: 'L&T Construction' })
       )
     ).toBeInTheDocument();
     ```
   - This ensures tests remain resilient, maintainable, and aligned with UI copy and translation changes.

5. **Quality Check Pipeline & Coverage Benchmark**:
   - All internationalization constants, helper functions, and consumer components MUST satisfy the strict $\ge 90\%$ code coverage benchmark across lines, statements, branches, and functions (`npm run test:coverage`).

---

## 📏 Strictest Linter Configuration & Code Quality Standards

All AI coding agents MUST strictly adhere to the project's comprehensive linter configuration and code quality standards (see dedicated rule: [`.agents/rules/linter-standards.md`](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.agents/rules/linter-standards.md)).

1. **Integrated Primary Build & CI/CD Enforcement**:
   - The primary build script (`npm run build`) executes `"next lint && next build"`. Code with any lint warnings or errors cannot be bundled.
   - Pull requests trigger `.github/workflows/pull-request.yml` which validates `npm run lint` and rejects any merge with lint failures.

2. **Category A: Strong Typing and Error Prevention**:
   - **Disallow `any` (`@typescript-eslint/no-explicit-any`)**: Prohibit `any` across all components, API routes, services, and state models. Use specific domain contracts, union types, or `unknown` with narrowing.
   - **Explicit Return Types (`@typescript-eslint/explicit-function-return-type`)**: Declare explicit return types on all functions, methods, and exported helpers.
   - **Disallow Non-Null Assertions (`@typescript-eslint/no-non-null-assertion`)**: Non-null assertions (`!`) are forbidden; use optional chaining (`?.`), nullish coalescing (`??`), or type guards.
   - **Enforce Type-Only Imports (`@typescript-eslint/consistent-type-imports`)**: Enforce `import type` for all type imports (`import type { Foo } from '@/types'`).
   - **Prefer Optional Chaining (`@typescript-eslint/prefer-optional-chain`)**: Replace verbose nested boolean checks with optional chaining.
   - **Zero Unused Variables (`@typescript-eslint/no-unused-vars`)**: Prohibit unused variables, parameters, and imports (prefix ignored variables with `_`).
   - **Strict Naming Conventions (`@typescript-eslint/naming-convention`)**: `PascalCase` for types, interfaces, enums, classes, components; `camelCase` for variables, functions, methods; `UPPER_CASE` or `PascalCase` for configuration dictionaries and constants.

3. **Category B: React & Next.js Standards**:
   - **Component Hooks & Security**: Enforce `react-hooks/rules-of-hooks` and complete dependency arrays in `react-hooks/exhaustive-deps`. Prohibit unsafe rendering methods (`react/no-danger`).
   - **Consistent Boolean Attributes (`react/jsx-boolean-value`)**: Use concise boolean shorthand (`<Component isVisible />`).
   - **Web Accessibility (`jsx-a11y`)**: Enforce `jsx-a11y/alt-text` on images, `jsx-a11y/no-redundant-roles` on semantic tags, and `jsx-a11y/anchor-is-valid` for hyperlinks.

4. **Category C: Maintainability & Formatting**:
   - **Maintainability Limits**: Cyclomatic complexity $\le 10$ (`complexity`), maximum 300 lines per file (`max-lines`), and maximum 120 characters per line (`max-len`).
   - **Copy Integrity**: Prohibit hardcoded user-facing strings; all UI text must be referenced via `UI_STRINGS` from `@/constants`.
   - **ES6+ Formatting**: Single quotes (`quotes: 'single'`), mandatory semicolons (`semi: 'always'`), multiline trailing commas (`comma-dangle: 'always-multiline'`), `prefer-const`, `no-var`, and `object-shorthand`.

---

## 🚫 Prohibition of Direct DOM Manipulation & Declarative UI State Standards

All AI coding agents MUST strictly adhere to the project's prohibition of direct DOM manipulation and follow declarative state management standards (see dedicated rule: [`.agents/rules/dom-manipulation-standards.md`](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.agents/rules/dom-manipulation-standards.md)).

1. **Absolute Prohibition of Direct DOM Access**:
   - Application components and hooks MUST NOT use low-level DOM selectors: `document.getElementById()`, `document.querySelector()`, `document.querySelectorAll()`, `document.getElementsByClassName()`.
   - Imperative DOM tree mutations (`document.createElement()`, `element.appendChild()`, `element.removeChild()`, `element.innerHTML`, `element.classList`, `element.style.*`) are forbidden.
   - Low-level DOM manipulation libraries (e.g. jQuery) are strictly prohibited.
   - The React virtual DOM and declarative state engine MUST remain the single source of truth for all view updates.

2. **Declarative State Management & Controlled Forms**:
   - Never inspect the DOM to retrieve input, select, or textarea values. Always bind form elements to controlled React state (`value` and `onChange`).
   - Dynamic list or table row selections MUST be stored in state maps (`Record<number, string>`) rather than queried from dynamically generated element IDs.

3. **Imperative Native Element Interactions via `useRef`**:
   - For native elements requiring programmatic execution (e.g. hidden `<input type="file" />`), use React's typed `useRef` hook (`fileInputRef.current?.click()`), NEVER `document.getElementById().click()`.

4. **Declarative File Downloads & Overlay Backdrops**:
   - File download triggers MUST be declared as native JSX `<a>` hyperlinks with `href` and `download` attributes, styled as buttons, instead of imperatively injecting temporary `document.createElement('a')` anchors into `document.body`.
   - Modals and dropdowns MUST handle dismissals using declarative React backdrop overlays instead of global `document.addEventListener('mousedown', ...)`.

5. **Static Linter Enforcement**:
   - Direct DOM selectors (`getElementById`, `querySelector`, `querySelectorAll`, `createElement`) are blocked via ESLint's `no-restricted-properties` rule in `.eslintrc.json`.

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

