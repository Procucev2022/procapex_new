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

