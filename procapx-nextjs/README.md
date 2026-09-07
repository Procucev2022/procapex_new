# ProCPX – Procurement & AI Cost Intelligence Platform (Next.js App)

Enterprise-grade source-to-award procurement platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and **jsPDF**.

---

## 🚀 How to Run Locally

### 1. Navigate to the project directory
```bash
cd "c:\Users\Lenovo\OneDrive\Desktop\Antigravityfiles\procapx-nextjs"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the Next.js development server
```bash
npm run dev
```

### 4. Open in your browser
Navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Tech Stack & Features

- **Framework**: Next.js 14 with App Router & Server/Client components
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS & Lucide Icons
- **PDF Generation**: `jspdf` & `jspdf-autotable` for downloadable Work Orders & POs
- **State Management**: React Context (`ProcurementContext`) with pre-seeded construction procurement data

---

## 📦 Functional Scope Implemented (Phase 1 Baseline)

1. **Dashboard**: Executive KPIs, savings analytics, pipeline stage distribution.
2. **Purchase Requests (PR)**: Create and submit PRs with multi-tier approval actions and Buyer acceptance (no budget blockers).
3. **BOQ Studio**: Tri-route BOQ creation (AI GFC Ingestion, Standard Templates, Excel Upload).
4. **Commercial Evaluation**: 4-way normalized matrix (**Rate Card** vs **Vendor Quotes** vs **AI Benchmark** vs **Internal Standard**) with auto-variance rules.
5. **AI Cost Intelligence**: Bottom-up **Material, Labour, Equipment, Overheads (MLEO)** cost break-up with human override (AI-08).
6. **Vendor Negotiation Hub**: Multi-round counter-offers, revised quotes timeline, and savings tracking.
7. **PPO & Work Orders**: PPO approval matrix $\rightarrow$ Automatic PO Generation $\rightarrow$ **Official PDF Purchase Order download**.
8. **Role Switcher & Audit Trail**: Switch between *Buyer*, *Requester*, *Estimator*, *Approver*, *Admin*, and *Vendor* roles with immutable event logs.
