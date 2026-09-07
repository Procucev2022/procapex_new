# CLAUDE.md - AI Coding Instructions for Claude

## Testing & Code Quality Standards

### 90% Unit Test Code Coverage (Mandatory)
- Every single file under `src/**/*.{ts,tsx}` must satisfy $\ge 90\%$ code coverage individually on:
  - Lines ($\ge 90\%$)
  - Statements ($\ge 90\%$)
  - Branches ($\ge 90\%$)
  - Functions ($\ge 90\%$)
- If any file falls below 90% on any metric, Jest will fail.
- Do not skip any file.

### Commands to Run
- `npm run test`: Run unit tests with `--detectOpenHandles --runInBand`.
- `npm run test:coverage`: Run unit tests with coverage verification and `--detectOpenHandles`.
- Always run `npm run test:coverage` after modifying or adding code to ensure 90% threshold compliance across all files.

### Global Test Timeout
- All tests run with a 30,000ms global timeout defined in `jest.config.js`.
- Always mock external APIs (Prisma, Gemini, fetch) to keep tests deterministic and fast.
