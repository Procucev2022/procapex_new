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
- Keep all constant values, configuration dictionaries, lookup tables, and mock dataset definitions in dedicated files under `src/constants/` (`tenants.ts`, `procurement.ts`, `vendors.ts`, `boq.ts`, `masters.ts`, `navigation.ts`, `ai.ts`, `logging.ts`).
- Never define inline mock datasets, configuration dictionaries, or constant lists in components, hooks, or context files.
- Always import constants via the central `@/constants` alias.

### 4. Separate Data Types & Interfaces Architecture & Standards
- Declare all TypeScript types, interfaces, enums, and type aliases in dedicated files under `src/types/` (`procurement.ts`, `context.ts`, `components.ts`, `ai.ts`, `logger.ts`).
- Never define inline `interface` or `type` declarations inside components or runtime files.
- Always import types via the central `@/types` alias.

### 5. Mandatory Quality Check Execution
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

### 6. Strict Check Order: Build & Coverage Checked First
Full quality checks must follow this mandatory sequence:
1. **Build Verification**: `npm run build`
2. **Unit Test Code Coverage**: `npm run test:coverage` (90% per-file benchmark across lines, statements, branches, and functions, `--detectOpenHandles`)
3. **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
4. **Lint**: `npm run lint` (`next lint`)
5. **Database Schema & Migrations**: `npm run db:validate` / apply pending migrations

### 7. Zero Tolerance for Coverage Regressions
- No files may be skipped.
- Per-file thresholds must strictly remain $\ge 90\%$ on all 4 metrics.

### 8. CI/CD Pull Request Pipeline & Quality Reporting
- Pull requests trigger `.github/workflows/pull-request.yml` with a strict job timeout (`timeout-minutes: 20`).
- Pipeline enforces Build $\rightarrow$ Unit Test Coverage ($\ge 90\%$ per file across all 4 metrics) $\rightarrow$ Typecheck $\rightarrow$ Lint $\rightarrow$ Database validation.
- Generates and publishes an automated PR summary comment detailing test pass/fail counts and overall & per-file coverage statistics (`npm run ci:summary`).

