# ProCPX Platform – End-to-End Technical Implementation Plan (Phase 1)

**Revision:** 1.0  
**Project:** ProCPX – Procurement Intelligence Platform  
**Target Flow:** Purchase Request → BOQ → Commercial Evaluation → AI Cost Intelligence → Negotiation → PPO → Work Order / PO Issuance  
**Document Source:** `ProCPX_Functional_Requirement_Document_Phase_1.pdf`

---

## 1. Executive Summary & Architecture Overview

**ProCPX** is an enterprise-grade AI-powered Procurement Intelligence Platform. Phase 1 digitizes and optimizes the complete source-to-award procurement workflow—spanning **Purchase Requests (PR)**, **BOQ extraction & mapping**, **multi-source commercial price evaluation**, **AI-driven cost modeling & break-up**, **structured vendor negotiations**, **Purchase Price Offer (PPO)** approval, and **Work Order / Purchase Order (PO)** issuance.

Budgetary controls, budget upload/shortfall workflows, and post-order billing are explicitly out of scope for Phase 1.

```
+---------------------------------------------------------------------------------------------------------+
|                                        PROCPX END-TO-END WORKFLOW                                       |
+---------------------------------------------------------------------------------------------------------+
  [1. Purchase Request] 
          │
          ▼
  [2. Cost Centre & Category Mapping]
          │
          ▼
  [3. BOQ Creation] ───► (Route A: AI GFC Extraction | Route B: Standard Template | Route C: Excel Upload)
          │
          ▼
  [4. PR Approval Workflow]
          │
          ▼
  [5. PR Buyer Acceptance & Assignment]
          │
          ▼
  [6. Commercial Price Check] ───► (Rate Card + Vendor Quotes + Market Benchmark + Internal Standard)
          │
          ▼
  [7. Price Comparison Matrix]
          │
          ├───► Price Acceptable? (YES) ──────────────────────────┐
          │                                                       │
          └───► Price Acceptable? (NO)                            │
                    │                                             │
                    ▼                                             │
        [8. AI Cost Analysis & MLEO Break-up]                     │
                    │                                             │
                    ▼                                             │
        [9. Multi-Round Vendor Negotiation]                       │
                    │                                             │
                    ▼                                             │
  [10. Final Commercial Comparison & Recommendation] ◄────────────┘
          │
          ▼
  [11. PPO Creation & Commercial Drafting]
          │
          ▼
  [12. PPO Approval Matrix]
          │
          ▼
  [13. Work Order / PO Issuance & PDF Generation]
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Recommended Technology Stack

| Layer | Recommended Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | **Next.js 14 / React 18, TypeScript, Tailwind CSS, Lucide Icons** | Modern, responsive enterprise UI with SSR, server actions, dynamic data tables (`@tanstack/react-table`), and chart visualizers (`recharts`). |
| **Backend API** | **FastAPI (Python 3.11+)** | High performance, native async support, strict data typing with Pydantic, native integration with AI/ML libraries and PDF generation engines. |
| **Database & ORM** | **PostgreSQL (with SQLAlchemy 2.0 / Alembic)** | Relational integrity for transactional procurement, JSONB support for flexible BOQ line items, quotation revisions, and audit logs. |
| **AI Intelligence** | **Gemini AI Engine (JSON Structured Mode)** | Fast, high-accuracy multi-modal document extraction for GFC drawings/PDFs, bottom-up cost breakdown modeling, and rate reasonableness scoring. |
| **Document / PDF Engine** | **ReportLab / WeasyPrint** | Pixel-perfect, enterprise-standard Work Order & Purchase Order PDF generation with digital signature blocks and audit stamps. |
| **Auth & Security** | **JWT (JSON Web Tokens) with RBAC** | Role-based permission guards across 6 distinct user roles with full session validation and HTTPS encryption. |

---

## 3. Core Functional Modules & Scope Mapping

### Module 1: Cost Centre & Master Setup (FR-01)
- **Role:** Buyer Admin
- **Features:**
  - Create, activate/deactivate Cost Centres and Procurement Categories.
  - Unit of Measurement (UOM) management (`Sqm`, `Cum`, `Ton`, `Kg`, `Nos`, `Rmt`, etc.).
  - User Role mapping and approval threshold configuration.
  - Master Rate Card management with geo-tagging and effective validity dates.

### Module 2: Purchase Request (PR) Engine (FR-02)
- **Role:** Requester / Buyer
- **Features:**
  - Auto-generated PR numbers (e.g. `PR-2026-0001`).
  - Project/Reference association, Cost Centre selection, Category mapping, Required By date.
  - Multi-line item entry (item description, specifications, estimated quantity, required delivery date).
  - Document & drawing attachments upload.

### Module 3: Tri-Route BOQ Creation Studio (FR-03, AI-01, AI-02)
- **Role:** Estimator / Buyer
- **Supported Routes:**
  1. **Route 1 (AI-Assisted GFC $\rightarrow$ BOQ):** Upload GFC (Good For Construction) drawings/documents; Gemini AI automatically parses line items, specifications, units, and quantities with confidence scoring and duplicate/missing item flags.
  2. **Route 2 (Standard BOQ Selection):** Choose from pre-configured enterprise BOQ templates.
  3. **Route 3 (New BOQ Upload):** Upload Excel/CSV with automated column mapping, syntax validation, and line-item review.
- Version control and human-in-the-loop validation for all BOQ line items.

### Module 4: PR Approval & Buyer Acceptance (FR-04, FR-05)
- **Role:** Approver / Buyer
- **Features:**
  - Configurable multi-tier Approval Matrix based on procurement categories/estimated values.
  - Approve, Reject, or Send Back with reviewer comments and audit timestamp.
  - Approved PR lands in Buyer Workbench for procurement acceptance and Buyer assignment.

### Module 5: Commercial Price Check & 4-Way Comparison (FR-06, FR-07, AI-03, AI-04)
- **Role:** Buyer
- **Features:**
  - Vendor quotation intake (quoted unit rate, taxes, discount, payment terms, delivery lead time, validity).
  - **4-Way Normalized Comparison Engine:**
    1. **Rate Card Price**
    2. **Vendor Quotations (Ranked L1, L2, L3...)**
    3. **AI Market / Benchmark Price**
    4. **Internal Historical Standard Price**
  - Line-item and total package variance calculations ($\Delta$ amount & $\%$).
  - Automated Price Acceptability Classifier (`Acceptable` vs `Non-Acceptable / High Variance`).

### Module 6: AI Cost Analysis & MLEO Component Break-up (FR-08, FR-09, AI-05, AI-06)
- **Role:** Buyer
- **Features:**
  - Triggered automatically or on-demand for non-acceptable / outlier quoted rates.
  - **Bottom-Up MLEO Modeling:**
    - **M**aterial Component ($\%$, estimated base rate)
    - **L**abour Component ($\%$, man-hour rates)
    - **E**quipment / Plant Machinery Component ($\%$, hire/operating costs)
    - **O**verheads & Contractor Margin ($\%$)
  - Explanatory cost drivers, assumptions, and confidence levels.
  - Full Human-in-the-Loop override and annotation capability.

### Module 7: Vendor Negotiation Hub (FR-10, AI-07)
- **Role:** Buyer / Vendor
- **Features:**
  - AI-suggested target price ranges and negotiation talking points.
  - Multi-round negotiation logging: Original Quote $\rightarrow$ Buyer Counter-Offer $\rightarrow$ Vendor Revised Quote.
  - Target price tracking, buyer remarks, vendor justifications, and attachment history.
  - Immutable revision tracking (every negotiation round creates an immutable snapshot).

### Module 8: Final Comparison & Purchase Price Offer (PPO) (FR-11, FR-12, FR-13)
- **Role:** Buyer / Approver
- **Features:**
  - Final commercial ranking reflecting latest valid negotiated rates.
  - One-click PPO generation pulling approved PR, BOQ items, negotiated rates, taxes, delivery terms, and payment milestones.
  - PPO Approval Matrix routing with digital approval/rejection notes.

### Module 9: Work Order / Purchase Order Issuance (FR-14)
- **Role:** Buyer
- **Features:**
  - Automatic PO number generation upon PPO approval.
  - Production-ready PDF generation with corporate branding, detailed BOQ schedule, payment terms, and delivery milestones.
  - Automated vendor communication and status tracking (`Issued`, `Acknowledged`).

### Module 10: Executive Dashboards & Audit Trail (FR-15, Section 10 & 11)
- **Role:** All Roles (RBAC filtered)
- **Features:**
  - PR Status & Ageing Dashboard.
  - BOQ Creation & AI Validation Studio.
  - Rate Card vs Vendor Quote vs Benchmark Variance Analytics.
  - Negotiation Cost Savings & Vendor Performance Analytics.
  - Full End-to-End Immutable Audit Trail logging every action, old vs new values, user, and timestamp.

---

## 4. User Roles & Permission Matrix

| Role | PR Create | BOQ Prep / AI Validation | PR Approve | Commercial Eval & AI Costing | Vendor Negotiation | PPO Create | PPO Approve | Issue PO | Master Setup |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Requester** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Estimator** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approver** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Buyer** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Buyer Admin**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Vendor** | ❌ | ❌ | ❌ | Submit Quote | Submit Counter | ❌ | ❌ | View PO | ❌ |

---

## 5. Acceptance Criteria Checklist (Phase 1 Baseline)

- [x] **PR Creation**: User can submit a PR without mandatory budget upload or budget checks.
- [x] **Tri-Route BOQ**: Supports GFC $\rightarrow$ BOQ (AI), Standard Templates, and Excel Uploads.
- [x] **Auditability**: PR approval, buyer acceptance, and all commercial revisions are fully tracked.
- [x] **Commercial Check**: Displays Rate Card, Vendor Quotes, Market Benchmark, and Internal Standards side-by-side.
- [x] **AI Cost Modeling**: Provides bottom-up MLEO breakdown with human override for non-acceptable rates.
- [x] **Negotiation History**: Captures all counter-offers, revised quotes, timestamps, and justifications.
- [x] **PPO & PO**: PPO approval automatically triggers Work Order / PO creation with downloadable PDF.
- [x] **Strict Scope Guard**: Excludes budget consumption, shortfall requests, billing checks, measurement certification, and project closure.
