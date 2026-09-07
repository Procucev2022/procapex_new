# Antigravity Rule: Strict 90% Unit Test Code Coverage Standard

## Rules for AI Agent Execution

1. **Mandatory 90% Per-File Threshold**:
   - Every file within `src/**/*.{ts,tsx}` must maintain at least 90% coverage across lines, statements, branches, and functions individually.
   - Any test run failing the threshold will immediately fail the task.

2. **Always Run Quality & Unit Tests**:
   - For fast feedback on changed files during iteration:
     ```bash
     npm run check:fast
     ```
   - Before completing any task or user request that modifies or adds application code, the agent MUST run:
     ```bash
     npm run check:all
     ```
     (or `npm run test:coverage` directly).
   - Build and unit test coverage must be verified first.
   - Verify that all tests pass, no open handles are detected, and per-file thresholds are met.

3. **Global Timeout**:
   - Unit tests are subject to a global timeout of 30,000ms.
   - Ensure all asynchronous calls are resolved or mocked to avoid timeout errors.
