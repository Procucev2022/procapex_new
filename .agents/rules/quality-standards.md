# Antigravity Rule: Quality Check Pipeline, Strict Order & Gitignore Standards

## Rules for AI Agent Execution

### 1. Gitignore Maintenance & Auto-Update
- Agents must proactively inspect and auto-update `.gitignore` whenever introducing new files, dependencies, build directories, certificates, or local secrets.
- Exclude all dependencies (`node_modules/`), build outputs (`.next/`, `out/`, `dist/`), test coverage (`coverage/`), secrets/credentials (`.env*` except `.env.example`, `*.pem`, `*.key`), database files (`*.sqlite*`, `prisma/*.db`), and temporary logs.
- Never commit secrets or un-ignored build artifacts to git.

### 2. Mandatory Quality Check Execution
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

### 3. Strict Check Order: Build & Coverage Checked First
Full quality checks must follow this mandatory sequence:
1. **Build Verification**: `npm run build`
2. **Unit Test Code Coverage**: `npm run test:coverage` (90% per-file benchmark across lines, statements, branches, and functions, `--detectOpenHandles`)
3. **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
4. **Lint**: `npm run lint` (`next lint`)
5. **Database Schema & Migrations**: `npm run db:validate` / apply pending migrations

### 4. Zero Tolerance for Coverage Regressions
- No files may be skipped.
- Per-file thresholds must strictly remain $\ge 90\%$ on all 4 metrics.
