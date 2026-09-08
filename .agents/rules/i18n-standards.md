# Antigravity Rule: Internationalization (i18n) & UI Strings Standards

## 🌐 Overview & Mandate
All AI coding agents (**Antigravity**, **Cursor**, **Claude**, etc.) MUST strictly enforce internationalization (i18n) readiness across the entire application whenever introducing, modifying, or refactoring user interfaces, components, forms, modals, or user-facing messaging.

---

## 📋 Core Architectural Rules

### 1. Zero Hardcoded User-Facing Strings & Literals
- Application components, views, modals, forms, tables, badges, tooltips, dialogs, and navigation elements MUST NOT embed raw user-facing literal strings in JSX/TSX or application code.
- All user-facing text, titles, subtitles, descriptions, button labels, input placeholders, table headers, empty state notices, ARIA labels, and error messages MUST be defined in dedicated constants modules under `src/constants/strings.ts` and referenced via the centralized `UI_STRINGS` dictionary.
- Anti-pattern:
  ```tsx
  // ❌ STRICTLY FORBIDDEN: Raw literal strings
  <h1>Multi-Tenancy Architecture & Corporate Roster</h1>
  <button>Submit Requisition</button>
  <input placeholder="Search projects..." />
  ```
- Compliant pattern:
  ```tsx
  // ✅ REQUIRED: Centralized UI_STRINGS constants
  import { UI_STRINGS } from '@/constants';

  <h1>{UI_STRINGS.tenantOverview.title}</h1>
  <button>{UI_STRINGS.common.submit}</button>
  <input placeholder={UI_STRINGS.common.search} />
  ```

---

### 2. Centralized UI_STRINGS Dictionary Architecture
- All strings must be categorized by semantic namespace within `src/constants/strings.ts`:
  - `common`: Global reusable actions, labels, statuses, and generic terms (`appName`, `loading`, `save`, `cancel`, `submit`, `search`, etc.).
  - `header`: Application header, brand identity, client/role switchers, and top-level action buttons.
  - `dashboard`: Sourcing command dashboard, pipeline stages, metrics, and quick action labels.
  - Component-specific namespaces: `tenantOverview`, `prApprovalQueue`, `mastersAudit`, `commercialEval`, `negotiationHub`, `aiCostStudio`, `boqStudio`, `ppoModule`, `vendorPortal`, `prModule`, `categoryManagerHub`.
  - `modals`: Dialog titles, field labels, descriptions, and submission buttons for popups.
- Export all strings through the centralized barrel at `src/constants/index.ts`.
- Clean import:
  ```typescript
  import { UI_STRINGS } from '@/constants';
  ```

---

### 3. Template Placeholders for Dynamic Runtime Substitution
- For strings containing dynamic or computed values (e.g., counts, usernames, tenant names, amounts, round numbers, IDs), agents MUST NOT use inline string concatenation or ad-hoc template literals.
  - ❌ Prohibited: `"Round " + round`
  - ❌ Prohibited: `` `Showing ${count} line-items` ``
  - ❌ Prohibited: `` `${tenantName} – Sourcing Command` ``
- Dynamic strings MUST be declared as template strings using `{placeholder}` tokens in `src/constants/strings.ts`:
  ```typescript
  export const UI_STRINGS = {
    dashboard: {
      sourcingCommandTemplate: '{tenantName} – Sourcing Command',
    },
    negotiationHub: {
      roundTemplate: 'Round {round}',
    },
    boqStudio: {
      specsCountTemplate: 'Showing {count} line-items strictly corresponding to specifications shown on: {title}',
    },
    ppoModule: {
      poNumberTemplate: 'Purchase Order #{poNumber}',
      signedByTemplate: 'Signed by {name}',
    },
  };
  ```
- Components MUST interpolate these tokens at runtime using the centralized `formatString` helper:
  ```tsx
  import { UI_STRINGS, formatString } from '@/constants';

  <h2>
    {formatString(UI_STRINGS.dashboard.sourcingCommandTemplate, {
      tenantName: activeTenant.name,
    })}
  </h2>

  <span>
    {formatString(UI_STRINGS.ppoModule.signedByTemplate, {
      name: tierApprover.name,
    })}
  </span>
  ```

---

### 4. Dedicated Data Types & Interfaces Architecture
- Zero inline type definitions for strings.
- All dictionary contracts, template value maps, and namespace interfaces MUST be declared in `src/types/strings.ts` and re-exported via `src/types/index.ts`.
- Include:
  - `StringTemplateValues`: Record contract for template substitution parameters (`Record<string, string | number | boolean | undefined | null>`).
  - Namespace interfaces: `CommonStrings`, `HeaderStrings`, `DashboardStrings`, `TenantOverviewStrings`, `PRApprovalQueueStrings`, `MastersAuditStrings`, `CommercialEvalStrings`, `NegotiationHubStrings`, `AICostStudioStrings`, `BOQStudioStrings`, `PPOModuleStrings`, `VendorPortalStrings`, `PRModuleStrings`, `CategoryManagerHubStrings`, `ModalStrings`.
  - `UIStringsDictionary`: Top-level dictionary contract enforcing all namespaces.

---

### 5. Modernized Tests: Assert Against UI_STRINGS Constants
- Unit and integration tests (`tests/`) MUST NOT assert against hardcoded string literals or brittle loose regular expressions.
- Tests MUST import `UI_STRINGS` (and `formatString`) from `@/constants` and assert directly against the dictionary constants:
  ```tsx
  // ❌ Prohibited: Brittle literal assertions
  expect(screen.getByText('Multi-Tenancy Architecture & Corporate Roster')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Submit Requisition/i })).toBeInTheDocument();

  // ✅ Required: Modern resilient assertions
  import { UI_STRINGS, formatString } from '@/constants';

  expect(screen.getByText(UI_STRINGS.tenantOverview.title)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: UI_STRINGS.common.submit })).toBeInTheDocument();
  expect(
    screen.getByText(
      formatString(UI_STRINGS.dashboard.sourcingCommandTemplate, { tenantName: 'L&T Construction' })
    )
  ).toBeInTheDocument();
  ```
- This guarantees tests remain resilient against UI copy adjustments, translations, or localization changes.

---

### 6. Verification & Quality Assurance Pipeline
- Every modification touching UI strings, components, or test suites MUST execute and pass the quality check pipeline:
  1. `npm run build` (0 Next.js compilation errors)
  2. `npm run test:coverage` (strict $\ge 90\%$ benchmark per file across lines, statements, branches, and functions)
  3. `npm run typecheck` (`tsc --noEmit` with 0 type errors)
  4. `npm run lint` (`next lint` with 0 warnings or errors)
  5. `npm run db:validate` (Prisma schema validation)
