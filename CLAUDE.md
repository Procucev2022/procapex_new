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

