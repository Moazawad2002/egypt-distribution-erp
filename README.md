# Enterprise Desktop ERP & Business Analytics System
### Food & Consumer Goods Distribution — Cairo • Alexandria • Mansoura (Egypt)

---

## 1. Executive Summary & Architecture

This enterprise system provides an integrated Desktop ERP, financial analytics, and supply-chain management solution for an Egyptian distribution company operating across three primary hubs:
- **Cairo Branch (`CAI`)**: Central metropolitan distribution center (Corporate Theme: Deep Blue `#1E3A8A`).
- **Alexandria Branch (`ALX`)**: Coastal trading and wholesale hub (Corporate Theme: Teal `#0D9488`).
- **Mansoura Branch (`MNS`)**: Delta agricultural basin and semi-wholesale network (Corporate Theme: Muted Green `#15803D`).

### Centralized Multi-Branch Architecture
```
[Cairo Branch PCs]       \
[Alexandria Branch PCs]   ---> HTTPS (TLS 1.3) ---> [Express.js Backend API] ---> [PostgreSQL 16 Enterprise]
[Mansoura Branch PCs]    /                                  (Port 4000)
[CEO Executive Laptop]  /
```

- **Zero Direct Database Connections from Desktop**: Electron clients connect strictly over authenticated HTTPS REST APIs with JWT tokens. No database credentials exist in the desktop application.
- **Strict Server-Side Branch Scoping**: Branch managers are strictly constrained to their authorized branch ID. Unauthorized attempts to query or post to other branches are rejected with `403 Forbidden`.
- **Financial Precision**: All monetary values are recorded using PostgreSQL `NUMERIC(14, 2)` to eliminate floating-point rounding errors.

---

## 2. Default Seed Accounts & Testing Personas

All accounts have the default password: `Password123!`

| Role | Username | Authorized Scope | Primary Capabilities |
|---|---|---|---|
| **CEO / Owner** | `ceo` | Consolidated (All Branches) | Company-wide P&L, branch comparison, target achievement, strategic oversight. |
| **System Admin** | `admin` | Consolidated (All Branches) | Master catalog, role management, system settings, import audit. |
| **Cairo Manager** | `manager.cairo` | Cairo Branch (`CAI`) | Branch operational invoices, warehouse dispatches, discount & return review. |
| **Alexandria Manager** | `manager.alex` | Alexandria Branch (`ALX`) | Branch operations, coastal routes, overdue collection enforcement. |
| **Mansoura Manager** | `manager.mansoura` | Mansoura Branch (`MNS`) | Delta operations, inventory levels, local customer credit limits. |
| **Senior Accountant** | `accountant` | Financial Operations | Payment receipts, multi-invoice allocations, OPEX logging, aging buckets. |
| **Inventory Supervisor** | `inventory.cairo` | Cairo Warehouse | Stock movements, physical adjustments, transfer receipts. |
| **Sales Representative** | `omar.khaled` | Cairo Field Sales | Customer orders, target tracking, discount requests. |

---

## 3. Initial Sales Representatives & Monthly Targets

| Representative | Branch | Monthly Sales Target (EGP) | Commission Model |
|---|---|:---:|:---:|
| **Omar Khaled** | Cairo | 650,000 | Configurable 2% / Net Sales |
| **Nour Hassan** | Cairo | 600,000 | Configurable 2% / Net Sales |
| **Salma Tarek** | Alexandria | 580,000 | Configurable 2% / Net Sales |
| **Karim Nabil** | Alexandria | 540,000 | Configurable 2% / Net Sales |
| **Mostafa Ibrahim** | Mansoura | 420,000 | Configurable 2% / Net Sales |
| **Aya Sherif** | Mansoura | 400,000 | Configurable 2% / Net Sales |
| **Total Team Target** | **Consolidated** | **3,190,000 EGP** | **Reconciliation Audited** |

---

## 4. Quick Start & Development Instructions

### Prerequisites
- Node.js v20+ LTS or v22+ LTS
- PostgreSQL 16 (or Docker Compose)

### 1. Backend REST API Setup
```bash
cd backend
npm install
npm run prisma:generate

# Start backend development server (Port 4000)
npm run dev
```

### 2. Desktop Application Setup
```bash
cd desktop-app
npm install

# Run React web interface in browser (Port 3000)
npm run dev

# Or launch as native Windows Desktop Electron app
npm run dev:electron
```

### 3. Running Automated Tests
```bash
# Execute backend test suites (Vitest)
cd backend
npm test
```
The test suite validates:
- Authentication & JWT issuance
- Branch scoping isolation (verifies Cairo manager cannot access Alexandria data)
- Exact mathematical formulas ($\text{Net Sales}$, $\text{COGS}$, $\text{Gross Profit}$, $\text{OPEX}$)
- 4-policy commission calculation engine
- Calendar receivables aging buckets (Current, 1-30, 31-60, 61-90, >90 days)
- Perpetual inventory movement integrity
- CSV import staging and duplicate invoice collision detection

---

## 5. Building the Windows Installer (`.exe`)

```bash
cd desktop-app
npm run build:win
```
The packaging output is generated in `desktop-app/dist-installer/`:
- `Egypt-Distribution-ERP-Setup-1.0.0.exe` (NSIS Installer)
- `Egypt-Distribution-ERP-1.0.0.exe` (Standalone Portable Executable)

---

## 6. Project Structure

```
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Complete PostgreSQL relational schema
│   ├── src/
│   │   ├── config/              # Environment & JWT parameters
│   │   ├── db/                  # Prisma client, seed script, memory store
│   │   ├── middleware/          # Auth JWT & Server-enforced branch scoping
│   │   ├── services/            # Financial, inventory, sales, import engines
│   │   ├── controllers/         # Zod-validated request handlers
│   │   ├── routes/              # Mounted REST API endpoints
│   │   ├── app.ts               # Express application configuration
│   │   └── server.ts            # Server entrypoint (Port 4000)
│   ├── tests/                   # Vitest automated test suites
│   ├── Dockerfile               # Production container image
│   └── package.json
│
├── desktop-app/
│   ├── electron/
│   │   └── main.ts              # Electron main process (Security hardened)
│   ├── preload/
│   │   └── index.ts             # Sandboxed contextBridge IPC whitelist
│   ├── src/
│   │   ├── context/             # AuthContext & LanguageContext (Arabic RTL/EN)
│   │   ├── services/            # API client wrapper
│   │   ├── components/          # Navbar, Sidebar, KpiCard, Modal, AlertBanner
│   │   ├── pages/               # 9 Dashboards + Invoices, Payments, Import, Audit
│   │   ├── App.tsx              # Application layout & navigation
│   │   └── main.tsx             # React DOM root
│   ├── tailwind.config.js       # Branch color identities (Cairo, Alex, Mansoura)
│   ├── vite.config.ts           # Vite bundler
│   └── package.json
│
├── docs/
│   ├── REQUIREMENTS.md          # Business requirements & operational context
│   ├── ARCHITECTURE.md          # Multi-branch topology & security model
│   ├── DATABASE_SCHEMA.md       # Full Mermaid ERD & table dictionary
│   ├── KPI_DICTIONARY.md        # Exact mathematical formulas & edge cases
│   ├── SECURITY_MODEL.md        # RBAC matrices & desktop hardening
│   ├── TEST_PLAN.md             # Verification procedures & test cases
│   └── DEPLOYMENT.md            # Production server & backup guide
│
├── docker-compose.yml           # PostgreSQL 16 & Backend services
└── package.json                 # Monorepo task orchestration
```
