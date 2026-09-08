# Antigravity Rule: Strictest Linter Configuration & Code Quality Standards

This document establishes the mandatory linter configuration and execution rules for all AI coding agents working on this repository to enforce strong typing, robust error prevention, React best practices, web accessibility, maintainability, and clean formatting across the application.

---

## 🎯 Mandatory Linter Integration & Execution Policy

1. **Integrated Primary Build Verification**:
   - The primary build script (`npm run build`) is configured as `"next lint && next build"`.
   - Linting checks are executed **before** framework bundling. Any linting error or warning immediately terminates the build process.
   - AI coding agents MUST NEVER bypass or disable linting during local development, compilation, or CI runs.

2. **CI/CD Workflow Enforcement**:
   - GitHub Actions workflows (`.github/workflows/pull-request.yml`) strictly enforce zero ESLint warnings and zero errors (`npm run lint`).
   - Pull requests containing any linting infractions are automatically blocked from merging.

3. **Strict Check Order**:
   - When running quality checks (`npm run check:all` or `scripts/quality-check.js`), linting verification (`npm run lint`) is executed as part of the core verification pipeline:
     1. `npm run build` (integrated `next lint && next build`)
     2. `npm run test:coverage` (strict $\ge 90\%$ benchmark per file across all 4 parameters)
     3. `npm run typecheck` (`tsc --noEmit`)
     4. `npm run lint` (`next lint`)
     5. `npm run db:validate` (`prisma validate`)

---

## 🛡️ Category A: Strong Typing and Error Prevention

### 1. Strict Typing Policies
All TypeScript code MUST adhere to strict type safety without exception:
- **Disallow `any` (`@typescript-eslint/no-explicit-any`)**:
  - The `any` type is strictly prohibited in all source code, API handlers, contexts, and domain models.
  - Use strongly-typed domain interfaces from `@/types`, generic type variables (`<T>`), union types, or `unknown` with runtime type narrowing.
- **Require Explicit Return Types (`@typescript-eslint/explicit-function-return-type`)**:
  - All declared functions, methods, and exported helpers MUST declare explicit return types (`(): Promise<void>`, `(): JSX.Element`, `(): string`).
  - Function expressions and higher-order functions must specify return contracts.
- **Disallow Non-Null Assertions (`@typescript-eslint/no-non-null-assertion`)**:
  - The non-null assertion operator (`!`) is strictly prohibited.
  - Guard nullable references using optional chaining (`?.`), nullish coalescing (`??`), or early-return runtime type guards (`if (!value) return;`).
- **Enforce Type-Only Imports (`@typescript-eslint/consistent-type-imports`)**:
  - Type imports MUST use the `import type` syntax:
    ```typescript
    import type { PurchaseRequest, UserRole } from '@/types';
    import { UI_STRINGS } from '@/constants';
    ```
- **Prefer Optional Chaining (`@typescript-eslint/prefer-optional-chain`)**:
  - Avoid chained logical AND checks (e.g. `a && a.b && a.b.c`). Always use modern optional chaining: `a?.b?.c`.

### 2. Code Quality & Naming Conventions
- **Zero Unused Variables (`@typescript-eslint/no-unused-vars`)**:
  - Unused variables, parameters, and imports are strictly prohibited.
  - Only intentionally ignored arguments prefixed with an underscore (`_req`, `_idx`) are permitted.
- **Strict Naming Conventions (`@typescript-eslint/naming-convention`)**:
  - **Types, Interfaces, Enums, Type Aliases**: `PascalCase` (e.g. `PurchaseRequest`, `TenantKey`).
  - **Variables, Functions, Methods**: `camelCase` (e.g. `calculateTotal`, `activeTenant`).
  - **Constants & Configuration Dictionaries**: `UPPER_CASE` or `PascalCase` for React components and namespace objects (`UI_STRINGS`, `DEFAULT_AES_ALGORITHM`).
  - **React Components**: `PascalCase` (e.g. `CategoryManagerHub`, `VendorPortal`).

---

## ⚛️ Category B: React & Next.js Rules

### 1. Functional Components, Hooks & Security
- **Component Hooks Best Practices (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)**:
  - Hooks must only be invoked at the top level of React function components or custom hooks.
  - All values referenced inside `useEffect`, `useCallback`, and `useMemo` MUST be declared in the dependency array. Never suppress dependency warnings without verified architectural justification.
- **Prohibit Unsafe Rendering (`react/no-danger`)**:
  - The use of `dangerouslySetInnerHTML` is strictly prohibited to prevent Cross-Site Scripting (XSS) vulnerabilities.
  - Render sanitized text, structured Markdown, or React children nodes.
- **Consistent Boolean Attributes (`react/jsx-boolean-value`)**:
  - Boolean JSX attributes MUST use concise shorthand syntax: `<Component isVisible />` instead of `<Component isVisible={true} />`.

### 2. Web Accessibility (`jsx-a11y`)
- **Image Alternative Text (`jsx-a11y/alt-text`)**:
  - All `<img>`, `<Image>`, and graphic elements MUST provide meaningful `alt` text describing the image content or empty `alt=""` for purely decorative elements.
- **No Redundant Roles (`jsx-a11y/no-redundant-roles`)**:
  - HTML semantic elements must not be annotated with redundant ARIA roles (e.g. `<button role="button">` or `<nav role="navigation">`).
- **Valid Anchor Elements (`jsx-a11y/anchor-is-valid`)**:
  - All `<a>` tags must possess valid, accessible `href` attributes. For button-like click handlers, use `<button>` elements with proper styling rather than empty anchors (`<a href="#">`).

---

## 📐 Category C: General Code Quality, Maintainability & Style

### 1. Maintainability & Modularity
- **Cyclomatic Complexity Limit (`complexity: 10`)**:
  - Keep functions focused and modular. Cyclomatic complexity per function must not exceed 10 branches (`if`, `switch`, loops). Refactor deeply nested conditionals into dedicated helper functions or strategy lookup tables.
- **File Length Budget (`max-lines: 300`)**:
  - Application files must remain concise and focused with a maximum target of 300 lines (excluding blank lines and comments).
  - Break monolithic views and handlers into composable child components, dedicated hooks, and utility modules.
- **Maximum Line Length (`max-len: 120`)**:
  - Source code lines must not exceed 120 characters.
  - Break multi-argument function signatures, long parameter lists, and chained methods onto multiple lines.
  - Ignore URLs, regex literals, and imported strings where splitting would impair functionality.
- **Zero Hardcoded User-Facing Strings (`no-literal-strings` / i18n copy policy)**:
  - In adherence to [i18n-standards.md](file:///c:/Users/procu/Desktop/Code/work/procapex_new/.agents/rules/i18n-standards.md), all user-facing copy, labels, placeholders, titles, and messages MUST be extracted to `UI_STRINGS` in `src/constants/strings.ts`.
  - Dynamic substitutions must use `formatString(template, values)`.

### 2. Formatting & ES6+ Standards
- **Single Quotes (`quotes: single`)**:
  - Enforce single quotes (`'string'`) for all JavaScript/TypeScript string literals, allowing double quotes only to avoid escaping or in JSX attributes.
- **Mandatory Semicolons (`semi: always`)**:
  - Every statement must end with an explicit semicolon to prevent automatic semicolon insertion (ASI) hazards.
- **Trailing Commas (`comma-dangle: always-multiline`)**:
  - Multiline object literals, arrays, imports, and parameters must include trailing commas to maintain clean git diffs.
- **Modern Variable Declarations (`prefer-const`, `no-var`)**:
  - The `var` keyword is strictly prohibited.
  - Use `const` for all identifiers that are not reassigned, and `let` only when variable mutation is explicitly required.
- **Object Literal Shorthand (`object-shorthand: always`)**:
  - Always use concise property and method shorthand syntax: `{ name, count }` instead of `{ name: name, count: count }`.
