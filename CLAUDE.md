# CLAUDE.md - AI Coding Instructions for Claude

## Quality Check & Gitignore Standards

### 🛡️ Gitignore Auto-Update Policy
- Claude must proactively inspect and auto-update [.gitignore](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.gitignore) whenever introducing new generated files, dependencies, build artifacts, certificates, secret files, or temporary caches.
- Never commit `.env`, secrets, credentials, or generated files.

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
