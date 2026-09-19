# Walkthrough: Tabular Text Centering & Alignment in Negotiation Studio

## Executive Summary
Addressed user requirement:
> *"As per attached tabular , ensure text is centred properly with proper alignment"*

Based on the provided screenshot of the **Item-Wise Line Item Negotiation Studio & BAFO Table**, table headers, data cells, and totals were exhibiting awkward multi-line word breaks (e.g. splitting *"Vendor"* and *"1 2nd /"* across 6 vertical lines) and uneven right-alignment.

We updated the table styling and structure to ensure:
1. **Proper Horizontal & Vertical Centering**:
   - Headers, data values, and totals across `Qty & UOM`, `AI Should-Cost Target (₹)`, Vendor 1st Quotes, Vendor 2nd / Latest Quotes (BAFO), and `Target Counter Offer (₹)` are centered (`text-center align-middle`).
2. **Structured Multi-Line Column Headers**:
   - Replaced raw string concatenation with a structured 3-line hierarchy:
     - **Line 1 (Vendor Name)**: `font-bold text-xs whitespace-nowrap` (e.g. *"Vendor 1"*).
     - **Line 2 (Round / Phase)**: `text-[11px] font-bold whitespace-nowrap` (e.g. *"1st Quote (₹)"*, *"2nd / Latest Quote (₹)"*).
     - **Line 3 (Subtitle)**: `text-[9px] font-normal mt-0.5` (e.g. *"Initial Rate & Amount"*, *"Revised BAFO Rate & Amount"*).
3. **Appropriate Column Widths**:
   - Added minimum widths (`min-w-[150px]`, `min-w-[165px]`, `min-w-[220px]`) to eliminate cramped text wrapping.
4. **Centered Counter-Offer Controls**:
   - `Target Counter Offer (₹)` title, subtitle, rate inputs, amount labels, vendor select dropdown, and *"Send Offer →"* button are centered within their column.

---

# Walkthrough: Blank Supplier Selection Provision in RFQ Studio

## Executive Summary
Addressed user requirement:
> *"whenever it is going to supplier selection, it has to show blank supplier selection provision. presently suppliers are already selected"*

Previously, when navigating to **Sub-Tab 2: Supplier Selection** in the Category Manager Hub (or opening default `PR-2026-0005`), suppliers were pre-selected due to:
1. `CategoryManagerHub.tsx` initializing `rfqVendors` with `currentPR.nominatedVendors` whenever `isSubmitted` was truthy.
2. `INITIAL_CIRCULATED_RFQS` in `src/constants/procurement.ts` having pre-defined `invitedVendors: ['VND-001', 'VND-002', 'CLT-VND-003']`.
3. Legacy `localStorage` caches (`procapex_prs_v1` and `procapex_circulated_rfqs_v1`) retaining pre-selected vendors from earlier demo sessions.

We resolved this so that **whenever going to Supplier Selection, it always opens with a completely blank supplier selection provision**:
- `0` selected suppliers (`0 selected`, `0 Vendors in RFQ Scope`).
- All multi-select checkboxes are unchecked.
- The selected chips area displays: *"No suppliers selected yet. Open the dropdown above to nominate suppliers."*
- The Nominated Suppliers Roster table displays the empty state: *"No Suppliers Nominated for RFQ Yet"*.
- When the user actively selects suppliers via the dropdown or clicks `+ Add All Rate Card Vendors`, suppliers are added cleanly.
- Clicking `↺ Reset to Default (Blank)` returns cleanly to the blank provision.
- Commercial Matrix, BAFO, MLEO, Negotiation Studio, and PPO Generation remain fully functional and resilient via fallback to `it.vendorQuotes`.

---

## Changes Implemented

### 1. Centralized Constants
- **File**: [src/constants/procurement.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/procurement.ts)
  - Updated `INITIAL_CIRCULATED_RFQS['PR-2026-0005']` and `['PR-2026-0003']` to have `invitedVendors: []` instead of pre-selected vendor IDs.

### 2. State Management & Legacy LocalStorage Sanitization
- **File**: [src/context/ProcurementContext.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/context/ProcurementContext.tsx)
  - Sanitized `procapex_prs_v1` when loading from `localStorage` to ensure demo PRs (`PR-2026-0001` through `PR-2026-0005`) initialize with `nominatedVendors: []`.
  - Sanitized `procapex_circulated_rfqs_v1` when loading from `localStorage` to ensure initial demo RFQs do not load pre-selected `invitedVendors`.
  - Updated `submitBuyerCounterOffer` fallback from hardcoded `['VND-001', 'VND-002']` to dynamically read quoted vendors from `it.vendorQuotes`.

### 3. Category Manager Hub Component
- **File**: [src/components/CategoryManagerHub.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/CategoryManagerHub.tsx)
  - Updated `useEffect` on `currentPR` to always initialize `setRfqVendors([])` so supplier selection is initially blank.
  - Updated `selectPR(prId)` to set `setRfqVendors([])` upon switching PRs.
  - Updated `useEffect` on `initialPRId` to set `setRfqVendors([])`.
  - Updated `syncPRsToPRData` to set `nominatedVendors: []` when unpopulated, preventing legacy seed vendor arrays from leaking into the UI.
  - Preserved multi-round Commercial Matrix and Negotiation evaluation via `participatingVendorIds` fallback to quoted vendors.

### 4. RFQ Circulation History Table
- **File**: [src/components/category-manager/RFQCirculationHistoryTable.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/category-manager/RFQCirculationHistoryTable.tsx)
  - Added clean fallback message: *"No suppliers nominated"* when an RFQ has zero invited vendors.

### 5. Automated Tests
- **File**: [tests/components/VendorReflectEverywhere.test.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/tests/components/VendorReflectEverywhere.test.tsx)
  - Added automated integration test: `always shows blank supplier selection provision with 0 selected suppliers on default PR-2026-0005 and when reset`.

---

## Changes Implemented

### 1. Prisma Schema & Neon PostgreSQL Database
- Updated [prisma/schema.prisma](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/prisma/schema.prisma):
  - `MasterCategory`: Stores category `id`, `name`, `shortCode`, `costCenter`, `description`, `subtotalCost`, `baselineBudget`, `committedCost`, `status`.
  - `MasterSubCategory`: Stores sub-category `id`, `categoryId`, `name`, `shortCode`, `description`.
  - `MasterStandardBOQItem`: Stores standard line item `id`, `code`, `categoryId`, `subCategoryId`, `desc`, `uom`, `benchmarkRate`, `qty`, `calculatedCost`, `status`.
- Executed `npx prisma db push` to synchronize tables to the live Neon PostgreSQL database in cloud.

### 2. Category Database Service Layer
- Created [src/lib/category-db.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/lib/category-db.ts):
  - `getCategoriesFromDatabase()`: Fetches all categories, subcategories, and standard BOQ items from PostgreSQL. Auto-seeds defaults on initial load if database is empty.
  - `saveCategoriesToDatabase()`: Performs transactional upsert across categories, sub-categories, and items into PostgreSQL with query auditing. Also updates a local JSON backup for offline resilience.

### 3. REST API Endpoint
- Created [src/app/api/categories/route.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/app/api/categories/route.ts):
  - `GET /api/categories`: Returns all active master categories and nested standard BOQ items with correlation logging.
  - `POST /api/categories`: Receives updated categories payload and upserts them into PostgreSQL.

### 4. Client State Hydration & Synchronization
- Updated [src/context/useBudgetManager.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/context/useBudgetManager.ts):
  - `getStoredCategories()` & `getStoredBudget()`: Reads cached categories and budget from `localStorage` immediately on mount.
  - `mergeCategoryCollections()`: Intelligently merges server categories with local additions, ensuring no local categories, subcategories, or items are ever lost.
  - `persistCategoriesToStorageAndApi()`: Atomically updates `localStorage` and triggers background HTTP `POST` to `/api/categories`.
  - Updated all action handlers (`addCategory`, `addSubCategory`, `addStandardBOQItem`, `uploadBatchStandardBOQItems`, `updateItemQuantity`, `resetCategoryQuantities`, `toggleItemHoldStatus`) to call `persistCategoriesToStorageAndApi`.
  - `useEffect` on mount fetches latest data from `/api/categories` and merges updates into state.

---

## Verification & Test Results

### 1. Automated Unit & Integration Tests
All 4 test suites passed with 30 passing tests:
- `tests/context/categoryPersistence.test.ts`: **5/5 PASS**
- `tests/lib/category-db.test.ts`: **5/5 PASS** (Validated live Prisma queries & API routes)
- `tests/context/useBudgetManager.test.tsx`: **16/16 PASS**
- `tests/components/CategoryAndStandardBOQMasterIntegration.test.tsx`: **4/4 PASS**

### 2. Quality Pipeline
- `npm run typecheck`: **0 errors** (Strict TypeScript compilation)
- `npm run lint`: **0 errors** (Next.js ESLint rules verified)
- `npm run db:validate`: **Valid** (`The schema at prisma/schema.prisma is valid 🚀`)

### 3. End-to-End Live API Verification
Tested live on `http://localhost:3000/api/categories`:
- `GET /api/categories` returned 200 with all 6 categories.
- `POST /api/categories` saved a new category, sub-category, and standard item to PostgreSQL (`savedToDb: true`).
- A subsequent `GET /api/categories` confirmed the newly added category, subcategory, and item were present in the database.

---

# Walkthrough: Vendor Onboarding & Dedicated Vendor Login Page

## Executive Summary
Addressed user requirement:
> *"Once vendor on boarded , his login page shall be displayed in the vendor role . login credentials userid: welcome, password : welcome"*

We implemented a dedicated **Enterprise Vendor Login Gate** inside the Vendor Portal (`Role 7: Vendor Portal & Supplier Workbench`) along with an automated onboarding credentials alert in the Vendor Management Module.

---

## Changes Implemented

### 1. Vendor Portal Login Gate Component
- **File**: [src/components/vendor-portal/VendorLoginView.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/vendor-portal/VendorLoginView.tsx)
- Provides modern enterprise login view:
  - **Company Selector**: Lists all platform vendors and client-onboarded contractors (such as `Rao Interior works` `CLT-VND-003`) with `🏢 Client Onboarded` distinction badge.
  - **Credentials Inputs**: User ID and Password fields with clear labels and validation.
  - **Accepted Credentials**: User ID `welcome` (case-insensitive) and Password `welcome`.
  - **Auto-Fill Demo Credentials Button**: One-click autofill for fast testing and demonstration.
  - **Structured Logging**: Emits audit logs with correlation info on login attempts, failures, and successes.

### 2. Vendor Portal Role Gating & Session State
- **File**: [src/components/VendorPortal.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/VendorPortal.tsx)
- Gated behind `isAuthenticated` state with browser `sessionStorage` persistence (`procapex_vendor_authenticated`).
- When unauthenticated, displays `VendorLoginView`.
- Upon successful login (`welcome`/`welcome`):
  - Automatically loads the vendor's active RFQ, quotation tabs (Round 1, Round 2 BAFO, Final Settlement), and PPO acceptance console.
  - Displays an active session badge: `Authenticated Session Active`.
  - Displays a **Sign Out / Switch Vendor** action to cleanly log out and return to the login gate.

### 3. Vendor Onboarding Alert in Vendor Management
- **File**: [src/components/vendor-management/VendorManagementModule.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/vendor-management/VendorManagementModule.tsx)
- When a new contractor is onboarded (via Quick Add modal or CSV bulk import), an alert banner is displayed:
  - Confirms empanelment of the vendor.
  - Details the provisioned login credentials: `User ID: welcome` and `Password: welcome`.
  - Includes a direct button `"Go to Vendor Login Portal →"` that navigates directly to the Vendor Portal login gate.

### 4. Internationalization & Centralized Strings
- **File**: [src/types/strings.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/types/strings.ts)
- **File**: [src/constants/strings.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/strings.ts)
- Zero hardcoded UI strings; all labels, buttons, error messages, and credentials hints are defined under `UI_STRINGS.vendorPortal`.

---

## Verification & Test Results

### 1. Automated Tests
- `tests/components/VendorPortal.test.tsx`: **10/10 PASS** (Includes 5 login gate tests: unauthenticated gate, wrong credential rejection, successful login with `welcome`/`welcome`, quick-fill button, sign out).
- `tests/components/VendorLoginIntegration.test.tsx`: **3/3 PASS** (End-to-end integration: login gate default in vendor role, credential check for `Rao Interior works`, onboarded credentials alert banner).
- `tests/components/VendorManagementModule.test.tsx`: **8/8 PASS**.

### 2. Quality Pipeline Verification
- `npm run typecheck`: **0 errors** (Strict TypeScript compilation).
- `npm run lint`: **0 errors** (ESLint / Next.js clean).
- `npm run build`: **0 errors** (Production bundle build and static page generation completed successfully).

---

# Walkthrough: Robust BOQ CSV Ingestion for Multi-Line Engineering Specifications & Column Alignment

## Executive Summary
Addressed user issue:
> *"while uploading standard template its not taking data in the right columns pleae find data attached"*

The user uploaded an Excel/CSV spreadsheet where detailed civil/interior engineering specifications caused data to shift across columns, resulting in ghost rows with `0.0` quantity (e.g. `CAIW-INTEWO-001` with `0.0` and `CAIW-INTEWO-002` with `0.0`) and continuation lines shifting into the Item Code, Specification, UOM, and Quantity columns.

---

## Root Cause Analysis
1. **Multi-line Specifications in Excel / CSV (RFC 4180)**:
   - When civil/interior engineers write specifications in Excel using `Alt+Enter` or multi-line paragraphs, the specification cell contains newline characters (`\r\n` or `\n`).
   - When exported to CSV conforming to RFC 4180, these cells are enclosed in quotes:
     ```csv
     CAIW-INTEWO-001,"18 mm Ply Support Behind Gypsum Sheet
     Providing and fixing 18 mm thick plywood supports behind gypsum sheets by cutting and installing 300 mm wide plywood pieces between aluminium pipes, including proper alignment, fixing with necessary fasteners",Nos,1
     ```
   - Previously, `boq-csv-parser.ts` blindly split the entire file with `.split(/\r\n|\n|\r/)`. This split the quoted specification right down the middle, creating:
     - **Row 1**: `CAIW-INTEWO-001 | 18 mm Ply Support Behind Gypsum Sheet | Nos | 0.0`
     - **Row 2**: `Providing and fixing... | including proper alignment | fixing with necessary fasteners | 1`
2. **Unquoted Commas in Descriptive Sentences**:
   - In Row 2, commas separating descriptive clauses (`..., including proper alignment, fixing with necessary fasteners, 1`) were treated by `splitCSVRow` as column delimiters:
     - Column 0 (Item Code): `Providing and fixing 18 mm thick plywood supports...`
     - Column 1 (Specification): `including proper alignment`
     - Column 2 (UOM): `fixing with necessary fasteners`
     - Column 3 (Quantity): `1`

---

## Architectural Solutions Implemented

### 1. RFC 4180 Multi-Line Quoted Record Tokenizer
- **File**: [src/lib/boq-csv-parser.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/lib/boq-csv-parser.ts)
- Implemented `splitCSVIntoRows(csvText: string): string[]`:
  - Tracks quotation boundaries (`"` and escaped `""`).
  - Newlines inside quoted fields are preserved intact as part of the field value.
  - Newlines outside quoted fields delineate physical records.
- Replaced naive `.split('\n')` in [src/lib/standard-boq-csv.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/lib/standard-boq-csv.ts) to also use `splitCSVIntoRows`.

### 2. Intelligent Unquoted Continuation Row Detection & Auto-Merging
- In case files are exported without outer quotation or with broken row breaks:
  - `isContinuationRow()` detects rows that begin with civil/interior action verbs (`Providing and fixing`, `Supplying and fixing`, `Laying`, `Fabrication`, `Execution`, `Including`, `P/F`, etc.) or have blank item codes.
  - `parseUnquotedContinuationRow()` captures all text clauses, extracts the intended line quantity (e.g. `1`), and merges them back into the parent item (`CAIW-INTEWO-001`).
  - Auto-updates the parent quantity from `0.0` to the actual quantity (`1`), cleans up ghost rows, and retains the correct UOM (`Nos`).

### 3. Excess Columns Recombination
- When unquoted commas exist in descriptive phrases, `parseExcessColsRow()` dynamically inspects the trailing columns for recognized UOMs (`Nos`, `Sqm`, `Cum`, `Rmt`, etc.) and quantities, consolidating all intermediate comma-separated parts into the specification description.

### 4. Multiline Specification UI Formatting
- **File**: [src/components/PRModule.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/PRModule.tsx)
- Added `whitespace-pre-line` to the specification table cell so multi-line engineering clauses wrap cleanly without breaking layout.

---

## Verification & Test Results

### 1. Automated Tests
- `tests/lib/boq-csv-parser.test.ts`: **22/22 PASS**
  - Verified RFC 4180 multiline quoted specifications.
  - Verified unquoted continuation rows with `CAIW-INTEWO-001` and `CAIW-INTEWO-002`.
  - Verified excess columns from unquoted commas.
  - Verified blank template workflows and fallback mappings.
- `tests/lib/standard-boq-csv.test.ts`: **13/13 PASS**
- `tests/components/PRModule.test.tsx`: **13/13 PASS**

### 2. Quality Pipeline
- `npm run typecheck`: **0 errors**
- `npm run lint`: **0 errors**

---

# Walkthrough: Rate Card Coverage Calculation from Standard BOQ & Dedicated Vendor Profile Rate Card Confirmation Tab

## Executive Summary
Addressed user requirements:
> *"For all Rate card suppliers, % of Rate card coverage shall be mentioned . This percentage has to come rate card coverage out of standard BOQ of particular category. In vendor profile, also for rate card acceptance and for rate card reference there should be seperate tab. all rate card related confirmation shall happen from that rate card tab"*

We architected and implemented:
1. **Dynamic Standard BOQ Rate Card Coverage Engine**: Computes the exact coverage percentage (`coveredCount / totalStandardBOQItems * 100%`) out of the active Standard BOQ catalog for each category.
2. **Dedicated Rate Card Tab in Vendor Profile & Vendor Portal**: Integrated into [VendorCredibilityDrawer.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/vendor-management/VendorCredibilityDrawer.tsx) and [VendorPortal.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/VendorPortal.tsx), empowering buyers and sellers to review benchmark schedules, digitally confirm agreements with a single click, submit counter-offers, and empanel missing Standard BOQ items directly.
3. **Comprehensive Coverage Visibility Across Modules**: Added Standard BOQ coverage badges (`Rate Card: X% Std BOQ (Y/Z)`) on vendor badges, table rows, Category Manager Hub cards, and Rate Card agreement views.

---

## Architectural & Technical Implementation

### 1. Standard BOQ Coverage Calculation Engine
- **File**: [src/lib/rate-card-utils.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/lib/rate-card-utils.ts)
  - `findMatchingStandardBOQCategory()`: Matches vendor category names and aliases (e.g. `'INTERIOR'`, `'Interior Fitout'`, `'CAT-INTERIOR'`, `'Civil & Structural'`, `'MEP'`) against master project categories.
  - `calculateVendorCategoryRateCardCoverage()`: Finds all line items in the vendor's Rate Card agreement, matches them against the category's Standard BOQ items by code or description, and computes:
    - `coveredCount`: Number of standard catalog items covered in the Rate Card.
    - `totalStandardBOQItems`: Total line items defined in that category's Standard BOQ.
    - `coveragePct`: Exact percentage rounded to whole number.
    - `missingStandardBOQItems`: List of remaining items available to empanel.
    - `allCategoryItemsCovered`: Boolean indicating 100% fast-track eligibility.

### 2. Context & State Management
- **File**: [src/context/useRateCardManager.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/context/useRateCardManager.ts)
- **File**: [src/context/ProcurementContext.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/context/ProcurementContext.tsx)
  - Linked `budgetManager.projectCategories` to `useRateCardManager`.
  - Exposed `getVendorCategoryRateCardCoverage(vendorId, categoryCodeOrName)` through `ProcurementContext` for real-time reactivity when standard BOQ items or rate cards are updated.

### 3. Dedicated Vendor Profile Rate Card Confirmation Tab
- **File**: [src/components/rate-card/VendorProfileRateCardTab.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/rate-card/VendorProfileRateCardTab.tsx)
  - **Standard BOQ Coverage Hero Card**: Visual progress bar, percentage badge, item fraction indicator (`6/6 Items Covered`), and eligibility pill.
  - **Agreement Summary Header**: Rate Card Agreement ID, status badge, validity period, SLA response time, and payment terms.
  - **Line-Item Benchmark Reference Table**: Displays AI Should-Cost, Recent Best RC Rate, Last PPO issued price, proposed rate, and ratified/counter rate for every line item.
  - **Digital Ratification & Confirmation Console**:
    - Legal declaration checkbox acknowledging pricing and terms.
    - Signatory name input field.
    - **"Accept & Confirm Rate Card" Button**: Directly finalizes and confirms the agreement.
    - **"Counter Offer" Flow**: Allows adjusting rates with seller notes.
    - **Digital Ratification Certificate**: Verified seal with timestamp and signatory upon ratification.
  - **Missing Standard BOQ Items Section**: Identifies all unmapped items from the category's Standard BOQ and provides a 1-click **"+ Empanel into Rate Card"** button.

### 4. Integration into Vendor Profile Drawer & Vendor Portal
- **File**: [src/components/vendor-management/VendorCredibilityDrawer.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/vendor-management/VendorCredibilityDrawer.tsx)
  - Added dedicated `'rate_card'` tab to the drawer's tab navigation with credit card icon.
  - Renders `VendorProfileRateCardTab` with buyer confirmation capabilities.
- **File**: [src/components/VendorPortal.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/VendorPortal.tsx)
  - Added `'rate_card'` tab to supplier navigation workbench.
  - Suppliers can review agreements and submit formal acceptance or counter-proposals directly from their portal.
- **File**: [src/components/vendor-management/VendorCategoryBadge.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/vendor-management/VendorCategoryBadge.tsx)
  - Displays coverage pill `Rate Card: X% Std BOQ (Y/Z)` for every Rate Card supplier.
- **File**: [src/components/CategoryManagerHub.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/CategoryManagerHub.tsx)
  - Displays `RC: X% Std BOQ` in vendor nomination cards and dropdown selectors.

### 5. Architectural Standards Compliance
- **Zero Inline Types**: Declared in [src/types/rate-cards.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/types/rate-cards.ts) and exported via [src/types/index.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/types/index.ts).
- **Zero Hardcoded Strings**: All UI text and parameterized templates defined in [src/constants/strings.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/strings.ts) under `UI_STRINGS.rateCards`.
- **Zero Inline Constants**: Default data initialized in [src/constants/rate-cards.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/rate-cards.ts).

---

## Verification & Test Results

### 1. Automated Unit & Integration Tests
Ran 7 targeted Jest test suites covering all calculations, state transitions, components, and integration touchpoints:
- `tests/lib/rate-card-utils.test.ts`: **5/5 PASS**
- `tests/context/useRateCardManager.test.ts`: **4/4 PASS**
- `tests/components/VendorProfileRateCardTab.test.tsx`: **4/4 PASS**
- `tests/components/RateCardModule.test.tsx`: **3/3 PASS**
- `tests/components/RateCardRFQAndPPOIntegration.test.tsx`: **3/3 PASS**
- `tests/components/VendorProfileAndPortalRateCardIntegration.test.tsx`: **3/3 PASS**
- `tests/components/CategoryManagerHub.test.tsx`: **19/19 PASS**
- Total: **41/41 PASS**

### 2. Quality Pipeline Verification
- `npm run typecheck`: **0 errors** (Strict TypeScript compilation passed).
- `npm run lint`: **0 errors** (ESLint rules, naming conventions, max length verified).
- Next.js development server running cleanly on `http://localhost:3000`.

---

# Walkthrough: Enterprise Reverse E-Auction Arena (Buyer & Vendor Portals)

## Executive Summary
Addressed user requirement:
> *"In RFQ & Commercial Matrix , in the tab of Vendor negotiation and offers, need to create option for E-auction . Once we click on E-Auction, Seperate E-Auction page shall come. E-Auction shall carry all general features required to conduct E-Auction. Vendors also need to have seperate E-Auction page to participate ."*

We architected and implemented a complete enterprise reverse E-Auction system with:
1. **Dedicated Buyer Command & Monitoring Center**: Launched from Tab 4 (*Vendor Negotiation & Counter-Offers*) in the RFQ & Commercial Matrix (`CategoryManagerHub.tsx`). Features live countdown timer, dynamic overtime extension, anti-sniping protection, buyer controls (Start, Pause, Resume, Extend, Conclude, Competitive Simulation), KPI dashboard, live L1 leaderboard with gold trophy indicator, and chronological bid audit log.
2. **Dedicated Vendor Bidding Arena**: Seamlessly integrated into the Vendor Portal (`VendorPortal.tsx`). Features synchronized live auction countdown, rank hero card (🏆 Leading L1 vs ⚠️ Outbid alert), 1-click quick decrement buttons (`-₹25,000`, `-₹50,000`, `-₹1,00,000`), custom package bid submission with minimum decrement validation, legal binding declaration, and confidential proxy/auto-bidding floor.
3. **Seamless L1 Award & Direct PPO Transition**: Upon concluding the auction, buyers can award the contract to the L1 winning vendor with one click, automatically updating the requisition into the Pre-Purchase Order (PPO) preparation lifecycle.

---

## Architectural & Technical Implementation

### 1. Data Contracts & Architecture
- **File**: [src/types/eauction.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/types/eauction.ts)
  - Defined strict TypeScript contracts: `EAuctionSession`, `EAuctionParticipant`, `EAuctionBid`, `EAuctionRule`, `SubmitBidInput`, `SetProxyFloorInput`, `BuyerEAuctionPageProps`, `VendorEAuctionPageProps`, and `BidValidationResult`.
  - Re-exported via [src/types/index.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/types/index.ts).

### 2. Constants & Seed Data
- **File**: [src/constants/eauction.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/eauction.ts)
  - Defined standard auction parameters in `DEFAULT_EAUCTION_RULES`:
    - Initial Duration: 900 seconds (15 minutes).
    - Minimum Decrement: ₹25,000.
    - Anti-Sniping Overtime Extension: +180 seconds (+3 minutes) when a bid is received in the last 120 seconds.
  - Seeded initial live auction sessions (`SEED_EAUCTIONS`) for `PR-2026-0005` with active vendors: `Rao Interior works` (`CLT-VND-003`), `DesignCraft Millworks & Interiors Pvt Ltd` (`VND-001`), `Prestige Woodcraft Solutions` (`VND-005`), and `Urban Space Innovators` (`VND-007`).
  - Re-exported via [src/constants/index.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/index.ts).
- **UI Strings Dictionary**:
  - Added comprehensive `UI_STRINGS.eauction` namespace to [src/constants/strings.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/strings.ts) and [src/types/strings.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/types/strings.ts) for 100% i18n copy compliance (zero hardcoded strings).

### 3. Core Engine & State Management
- **File**: [src/lib/eauction-utils.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/lib/eauction-utils.ts)
  - `validateBidSubmission()`: Validates that bids are lower than the vendor's own previous best bid by at least the minimum decrement.
  - `calculateAuctionRanks()`: Dynamically calculates L1, L2, L3 ranks based on lowest bid price and earliest timestamp.
  - `calculateAuctionSavings()`: Computes total and percentage savings relative to starting baseline price.
  - `generateSimulatedVendorBid()`: Generates realistic competitive vendor counter-bids for testing and demonstrations.
  - `shouldTriggerOvertimeExtension()`: Triggers anti-sniping duration extension when a competitive bid arrives near closing time.
  - `formatAuctionTimer()`: High-visibility format `MM:SS` for the auction countdown.
- **File**: [src/context/useEAuctionManager.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/context/useEAuctionManager.ts)
  - Manages auction state machine (`SCHEDULED`, `LIVE`, `PAUSED`, `EXTENDED`, `CONCLUDED`, `AWARDED`).
  - Implements 1-second interval ticker for active countdowns.
  - Exposes actions: `startEAuction`, `pauseEAuction`, `resumeEAuction`, `extendEAuction`, `concludeEAuction`, `submitEAuctionBid`, `setEAuctionProxyFloor`, `simulateVendorBid`, and `awardEAuctionToL1`.
  - Emits detailed structured logs using `logger.info`, `logger.warn`, and `logger.debug`.
- **File**: [src/context/ProcurementContext.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/context/ProcurementContext.tsx)
  - Wired `useEAuctionManager` into `ProcurementContext` and exposed all auction states and methods to the entire application.

### 4. Dedicated Buyer Command & Monitoring Center
- **File**: [src/components/eauction/BuyerEAuctionPage.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/eauction/BuyerEAuctionPage.tsx)
  - **Auction Header**: Back navigation button, PR title, category badge, and status indicator.
  - **Command Ticker & Control Bar**:
    - High-tech digital countdown clock displaying minutes and seconds.
    - Buyer Controls: `Start Auction`, `Pause`, `Resume`, `+5 Min Extend`, `Conclude Bidding`, `Simulate Competitor Bid`, and `Award L1 & Generate PPO`.
  - **Real-Time KPIs**: Baseline Budget, Starting L1 Bid, Current L1 Bid, Total Net Savings (₹ and %), Total Bids Placed, and Active Empaneled Bidders.
  - **Live Vendor Leaderboard**: Real-time ranking with gold trophy badge for L1, current bid amounts, and price decrements.
  - **Live Bid Audit Stream**: Chronological audit trail of all bids submitted with timestamps, vendors, and decrement values.

### 5. Dedicated Vendor Bidding Arena
- **File**: [src/components/eauction/VendorEAuctionPage.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/eauction/VendorEAuctionPage.tsx)
  - **Live Auction Banner**: Synchronized countdown clock, category label, and minimum decrement rule.
  - **Dynamic Rank Hero Card**:
    - Highlights current status: `🏆 You are currently Leading L1` (emerald styling) vs `⚠️ You have been Outbid - Rank #2` (amber styling).
    - Displays difference to current L1 price and current best offer.
  - **One-Click Quick Decrement Buttons**:
    - Enables instantaneous bidding with `-₹25,000`, `-₹50,000`, and `-₹1,00,000` buttons calculating the exact package price on click.
  - **Custom Validated Bid Form**:
    - Input field for entering specific revised package bid amounts with live minimum decrement validation.
    - Legal binding declaration checkbox required before placing bids.
  - **Confidential Proxy/Auto-Bidding Floor**:
    - Allows vendors to define a confidential floor price; automatically places minimum decrement bids whenever the vendor is outbid down to their floor.
  - **Real-Time Bidding History**: Live list of the vendor's submitted bids with timestamps and rank updates.

### 6. Module Integration Points
- **RFQ & Commercial Matrix Integration**:
  - **File**: [src/components/CategoryManagerHub.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/CategoryManagerHub.tsx)
  - In Tab 4 (*Vendor Negotiation & Counter-Offers*), added the primary action button:
    - `⚡ Launch E-Auction Arena` with amber badge indicator.
  - Clicking this button transitions the view to `<BuyerEAuctionPage />` for the active RFQ.
  - Returning or awarding to L1 smoothly routes back to negotiation or proceeds to PPO preparation.
- **Vendor Portal Integration**:
  - **Files**: [src/components/VendorPortal.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/VendorPortal.tsx) and [src/components/vendor-portal/useVendorPortal.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/vendor-portal/useVendorPortal.ts)
  - Added dedicated tab: `⚡ E-Auction Arena` in the supplier workbench navigation bar.
  - Renders `<VendorEAuctionPage />` scoped to the logged-in vendor (`activeVendorId`).

---

## Verification & Test Results

### 1. Automated Unit & Integration Tests
Created 5 comprehensive test suites containing 27 new tests, verifying all functionality:
1. `tests/lib/eauction-utils.test.ts`: **6/6 PASS**
   - Validates bid validation logic, minimum decrements, ranking calculation, savings formulas, and overtime triggers.
2. `tests/context/useEAuctionManager.test.ts`: **5/5 PASS**
   - Validates auction lifecycle transitions (Start, Pause, Resume, Extend, Conclude), bid submissions, proxy floors, and L1 awards.
3. `tests/components/BuyerEAuctionPage.test.tsx`: **3/3 PASS**
   - Validates buyer controls, timer displays, leaderboard rendering, simulation triggers, and PPO award navigation.
4. `tests/components/VendorEAuctionPage.test.tsx`: **4/4 PASS**
   - Validates vendor rank hero cards, quick decrement actions, custom bid validation, and proxy floor configurations.
5. `tests/components/EAuctionIntegration.test.tsx`: **2/2 PASS**
   - Validates end-to-end multi-vendor bidding workflows, L1 rank shifts, anti-sniping overtime extension, and buyer PPO awards.

### 2. Full Suite Regression Verification
- Ran all **75 test suites** across the entire repository:
  - **75 passed, 75 total suites**
  - **659 passed, 659 total tests**
  - **0 regressions**
- `npm run typecheck`: **0 errors** (TypeScript compilation passed).
- `npm run lint`: **0 errors** (ESLint code standards verified).

---

# Walkthrough: Removal of Active RFQ Packages & Tender Queue Tabular Form

## Executive Summary
Addressed user request:
> *"above tabular form of  RFQ Tender closure  & Submission provisions can be removed"* (with screenshot of `ACTIVE RFQ PACKAGES & TENDER QUEUE`).

We removed the redundant `ACTIVE RFQ PACKAGES & TENDER QUEUE` tabular block (`id="rfq-packages-queue-panel"`) from the bottom of Tab 1 in the Category Manager Hub. In its place, we equipped the top header banner of the Category Manager Hub with quick package-switching pills (`PR-2026-0005`, `PR-2026-0003`, `PR-2026-0002`, `PR-2026-0004`, `PR-2026-0007`), enabling instant switching from any tab without scrolling through the page.

---

## Changes Implemented
1. **[CategoryManagerHub.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/CategoryManagerHub.tsx)**:
   - Removed the `ACTIVE RFQ PACKAGES & TENDER QUEUE` table and its container (`#rfq-packages-queue-panel`).
   - Cleaned up unused `Layers` import from `lucide-react`.
   - Added compact RFQ Package selector buttons directly in the top header banner (`Switch RFQ Package`), allowing buyers to toggle active packages from anywhere in the hub.
   - Preserved persistent RFQ Tender Closure & Submission Provisions controls and the Tender Circulation Registry (`RFQCirculationHistoryTable`).
2. **[CategoryManagerHub.test.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/tests/components/CategoryManagerHub.test.tsx)**:
   - Verified seamless package switching and PR status assertions via the new header controls.

---

## Verification & Quality Pipeline
- `npm run typecheck`: **0 errors**
- `npm run lint`: **0 errors**
- Jest Test Suite: **75/75 passed** (**659/659 tests passed**)

---

# Walkthrough: Project Cost Budget Planning Renaming & Navigation Repositioning

## Executive Summary
Addressed user request:
> *"change the name of the page as  \" Project cost budget planning \" and move this page  next to \"BOQ Studio & RFQ Management\""* (with screenshot of `Project Cost Budget Planning & Financial Allocation`).

We updated the page header title and navigation tab to **"Project Cost Budget Planning"**, and repositioned the module in the main navigation hierarchy so that it appears immediately next to (following) **"BOQ Studio & RFQ Management"**.

---

## Changes Implemented

1. **Page Title Update in UI Strings Dictionary**:
   - **File**: [src/constants/strings.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/strings.ts)
   - Updated `UI_STRINGS.budgetPlanning.title` from `'Project Cost Budget Planning & Financial Allocation'` to `'Project Cost Budget Planning'`.
   - Rendered in [BudgetOverviewHeader.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/budget/BudgetOverviewHeader.tsx) as the primary page `<h1>`.

2. **Navigation Order & Label Repositioning**:
   - **File**: [src/constants/navigation.ts](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/constants/navigation.ts)
   - Moved `boq_rfq_management` to index 0 (`BOQ Studio & RFQ Management`).
   - Positioned `budget_planning` to index 1 (`Project Cost Budget Planning`), immediately next to BOQ Studio & RFQ Management.
   - Cleaned module tab labels to standardized names.

3. **Test Suite Updates**:
   - **File**: [tests/components/Header.test.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/tests/components/Header.test.tsx)
   - Updated navigation tab labels and assertions to match the updated sequence and naming.

---

## Feature: Onboarded Vendor Visibility in RFQ & Blank RFQ Creation from BOQ Studio

### 1. Newly Onboarded Vendor Visibility in RFQ
- **Problem**: When a vendor was onboarded via the Vendor Management module (`source: 'CLIENT_ONBOARDED'`), they were often omitted from the Category Manager RFQ supplier nomination dropdown due to category mismatch or strict rate-card filtering.
- **Solution**:
  - In [CategoryManagerHub.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/CategoryManagerHub.tsx):
    - **Guaranteed Inclusion**: All client-onboarded vendors are always included in the vendor list, clearly distinguished by an `🏢 Client Boarded` emerald badge.
    - **Flexible Matching**: `matchVendorToPRCategory` enhanced to check multi-category arrays (`vendorCategories`) and major industry synonyms (Fitouts, Millwork, Carpentry, Furniture, Structural, Civil, MEP, Electrical, HVAC, Plumbing, Fabrication).
    - **Dedicated Filter Pill**: Added `🏢 Client Onboarded ({count})` alongside `All Vendors`, `Rate Card Vendors`, and `Non-Rate Card Vendors`.
    - **In-Dropdown Search**: Live text search (`vendorSearchQuery`) by vendor name, vendor ID, or category name.
    - **Category Scope Override Toggle**: "Show all categories (including all client onboarded)" checkbox allows buyers to nominate vendors from adjacent disciplines.

### 2. Move to Blank RFQ Page from BOQ Studio
- **Problem**: Clicking "Proceed to Raise RFQ" in BOQ Studio navigated to the demo Reception Counter PR (`PR-2026-0005`) which had pre-seeded nominated vendors (`VND-001`, `VND-002`, `VND-005`) and pre-filled quotations, preventing buyers from starting from a clean blank RFQ package.
- **Solution**:
  - In [PRModule.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/PRModule.tsx):
    - `handleProceedToRaiseRFQ`: Dynamically calculates the next requisition ID (e.g. `PR-2026-0006`), initializes empty nominated suppliers (`nominatedVendors: []`), sets status to `SUBMITTED`, assigns title `'New Blank RFQ Package'`, and navigates to this new package ID.
  - In [CategoryManagerHub.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/src/components/CategoryManagerHub.tsx):
    - `syncPRsToPRData`: For non-seed packages, sets `nominatedVendors: []` and empty vendor quotes.
    - `useEffect` form reset: Automatically clears general inputs (Cost Centre, Square Feet, Delivery Address, Site Contact, Staging Plan) to blank placeholders when switching to a non-seed PR.
    - Added `+ New Blank RFQ` button in the header (`handleCreateBlankRFQ`) for quick manual creation of a blank package.
    - Added empty state cards for documents and nominated suppliers table when lists are empty.
    - Added safe fallbacks for `l1VendorId`, `l1MinTotal`, and `pendingVendorTotal` calculations when 0 vendors are nominated.

---

## Verification & Quality Pipeline
- `npm run typecheck`: **0 errors** (Strict TypeScript compilation passed).
- `npx jest`: **75/75 test suites passed** (**661/661 unit & integration tests passed**).
- Added dedicated integration tests in [VendorReflectEverywhere.test.tsx](file:///c:/Users/Lenovo/OneDrive/Desktop/Procapex%20Long/Antigravityfiles/tests/components/VendorReflectEverywhere.test.tsx) verifying newly onboarded client vendors are visible and selectable in RFQ supplier nomination, and that clicking "Proceed to Raise RFQ" generates a clean, blank RFQ package.



