# AI Coding Agents Instructions & Standards

This document establishes mandatory rules and execution guidelines for all AI coding agents (Antigravity, Cursor, Claude, Codex, Kiro, etc.) working on this repository.

---

## 🎯 Mandatory Unit Test Code Coverage Benchmark: 90% Per File

1. **Strict 90% Per-File Threshold**:
   - Every source code file (`src/**/*.{ts,tsx}`) MUST achieve at least **90% coverage** across **all four parameters**:
     - **Lines**: $\ge 90\%$
     - **Statements**: $\ge 90\%$
     - **Branches**: $\ge 90\%$
     - **Functions**: $\ge 90\%$
   - If per-file coverage on any single file dips below 90% on any metric, Jest will throw an error and fail the build.

2. **No Skipping Allowed**:
   - DO NOT skip any file or exclude application logic from coverage.
   - All newly added components, API routes, hooks, utility functions, or state context modules must have dedicated test suites in `tests/`.

3. **Coverage Verification on Every Change**:
   - Whenever any file is created or modified, the AI agent **MUST run**:
     ```bash
     npm run test:coverage
     ```
   - Agents must verify that Jest passes with 0 errors and all thresholds are satisfied before marking a task as complete.

4. **Global Timeout & Open Handles**:
   - All unit tests must be configured with a global timeout (`testTimeout: 30000`) in `jest.config.js`.
   - The `--detectOpenHandles` flag is mandatory during test execution to catch hanging asynchronous calls, timer leaks, or unclosed database/network connections.

---

## 🛠️ Testing Commands Reference

| Command | Action | Flags Included |
| :--- | :--- | :--- |
| `npm run test` | Run all unit tests | `--detectOpenHandles --runInBand` |
| `npm run test:coverage` | Run all tests with coverage verification | `--coverage --detectOpenHandles --runInBand` |
| `npm run test:watch` | Run tests in watch mode | `--watch --detectOpenHandles` |

---

## 📋 Best Practices for Writing Unit Tests
- Use **React Testing Library** for UI components (`render`, `screen`, `fireEvent`, `waitFor`).
- Mock external network APIs (`fetch`, Google Gemini API) and database calls (`PrismaClient`).
- Test both sunny-day (success paths) and rainy-day (errors, edge cases, missing parameters) scenarios to maximize branch and statement coverage.
- Always cleanly unmount components and clear mock calls between tests (`jest.clearAllMocks()`).
