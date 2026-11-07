# Business & System Requirements Document

## 1. Executive Summary & Company Profile

**Company**: Egyptian Food & FMCG Distribution Co. S.A.E.  
**Industry**: Fast-Moving Consumer Goods (FMCG) Wholesale & Distribution  
**Primary Product Lines**:
- Edible & Cooking Oils (Sunflower, Corn, Blended)
- Grains & Staples (Egyptian Rice, Pasta, Flour, Sugar)
- Packaged Food Products & Canned Goods
- Household Detergents, Soaps, and Cleaning Agents

**Geographical Scope**:
The company operates across three strategic commercial centers in Egypt:
1. **Cairo (Greater Cairo Region)** - Central hub, high-volume retail & hypermarket distribution.
2. **Alexandria (Alexandria & Coastal Strip)** - Wholesale merchants, coastal grocery chains.
3. **Mansoura (Delta Agricultural & Commercial Basin)** - Regional semi-wholesalers, rural grocery networks.

**Operational Model**:
- Products are procured in bulk from domestic FMCG manufacturers and agricultural mills.
- Central and branch warehouses receive, store, and dispatch goods.
- Field Sales Representatives take orders across assigned routes and customer portfolios.
- Deliveries are executed by dedicated branch fleets.
- Customers (supermarkets, mini-markets, wholesale traders) purchase on cash-on-delivery or credit terms.
- Credit balances are collected through sales representatives and branch collection agents.
- Monthly sales targets and commission incentives are assigned to sales representatives.

---

## 2. Core Business Problem & Investigation Hypotheses

The CEO and executive board observed that while top-line **gross sales are expanding**, bottom-line **net profitability and cash flows are stagnating or eroding**. Management previously relied on disconnected Excel workbooks across branches, creating critical visibility gaps.

### Hypotheses to Investigate
1. **Excessive & Uncontrolled Discounts**: Sales representatives granting discretionary invoice-level discounts to achieve volume quotas at the expense of gross margins.
2. **High Sales Returns**: Expired, damaged, or rejected goods returned without root-cause classification, reducing net sales while incurring logistics costs.
3. **Purchase Price Volatility**: Currency devaluation and supplier cost inflation causing historical purchases and current replenishment costs to diverge, skewing margin assumptions.
4. **Logistics & Transportation Costs**: Fleet fuel, maintenance, third-party freight, and inefficient delivery routing eroding branch operating profits.
5. **Slow-Moving & Aging Inventory**: Working capital locked in slow-moving SKUs while high-velocity items suffer stockouts.
6. **Receivables Aging & Credit Risk**: Extended payment terms without credit limit enforcement leading to overdue balances (>90 days) and impaired liquidity.
7. **Volume-Biased Commission Policy**: Commissions rewarded purely on gross revenue rather than net collected sales or gross profit contribution.
8. **Branch Disparities**: Unexplained variations in operating expense ratios between Cairo, Alexandria, and Mansoura.

---

## 3. System Scope & Functional Requirements

### 3.1 Multi-Branch Organization & Security
- **Strict Data Scoping**: Cairo, Alexandria, and Mansoura operational data partitioned server-side.
- **Centralized Database**: Single authoritative PostgreSQL cluster. No branch data silos.
- **Role-Based Access Control (RBAC)**:
  - CEO / Owner: Consolidated multi-branch analytics, cross-branch comparisons, administrative oversight.
  - Branch Manager: Full operational view restricted strictly to assigned branch.
  - Accountant: Receivables, payables, payment allocation, expense logging, and budget tracking.
  - Inventory Employee: Warehouse receipts, dispatches, stock adjustments, batch tracking.
  - Sales Representative / Employee: Assigned customers, orders, deliveries, and individual target tracking.
  - Administrator: System settings, user provisioning, audit inspection, and reference master data.

### 3.2 Master Data Management
- **Products & Categories**: SKU, Barcode, UOM, Category, Reorder Point, Standard Cost, Selling Price.
- **Suppliers**: Commercial registration, tax ID, payment terms, contact information.
- **Customers**: Commercial name, branch assignment, credit limit, payment terms, GPS/address, tier.
- **Sales Representatives**: Branch assignment, active status, effective-dated monthly sales targets.

### 3.3 Transaction Modules
- **Sales Invoicing & Dispatch**: Multi-line sales orders, unit prices, discounts, line totals, VAT, net payable.
- **Sales Returns & Credit Notes**: RMA workflow, return reason classification (Damaged, Expired, Customer Refusal, Incorrect Delivery), stock disposition (Returned to Stock vs Quarantined/Scrapped).
- **Purchasing & Goods Received**: Purchase orders, supplier invoices, landed cost allocation, batch & expiry capture.
- **Inventory Movements**: Real-time perpetual inventory balance, batch tracking, warehouse-to-warehouse transfers, physical count adjustments.
- **Customer Collections & Payments**: Cash and bank payment receipts, multi-invoice allocation, unallocated payment tracking, customer statements of account.
- **Expenses & Budgeting**: Categorized branch operating expenses (transportation, salaries, rent, utilities, marketing), monthly branch budget allocation, variance monitoring.
- **Commission Calculations**: Flexible policy engine (Gross Sales, Net Sales after Discounts, Net Sales after Discounts & Returns, Margin-based), approval cycle, adjustment logging.

### 3.4 Dashboards & Analytics
1. **CEO Executive Overview**: Consolidated KPIs, revenue trends, gross vs operating profit, branch league table.
2. **Branch Comparison**: Normalized side-by-side performance of Cairo, Alexandria, and Mansoura.
3. **Sales & Representative Performance**: Target achievement %, discount leakage, return rates per rep.
4. **Commission Reconciliation**: Discrepancy detection between recorded and recalculated commissions.
5. **Product Profitability**: High/low margin SKUs, contribution margin, volume vs margin matrix.
6. **Inventory & Warehouse Health**: Stock valuation, stockouts, days sales of inventory (DSI), expiry risk alerts.
7. **Customer Receivables & Aging**: Aging buckets (Current, 1-30, 31-60, 61-90, 90+ days), credit limit breach alerts.
8. **Expenses & Delivery Logistics**: Operating expense breakdown, transport cost per ton/invoice, delivery punctuality.
9. **Data Quality & Audit**: Duplicate invoice detection, unallocated payments, missing costs, negative stock attempts.

### 3.5 Excel & CSV Migration / Staging Pipeline
- Support for importing legacy spreadsheets.
- Staging table architecture with strict pre-validation.
- Duplicate detection, reference resolution, and error reporting per row.

### 3.6 Desktop Application & User Experience
- Built for Windows Desktop (ready for cross-platform expansion).
- Full bilingual support: **Arabic (RTL)** and **English (LTR)**.
- Egyptian Pound (**EGP**) currency formatting and Egypt local time display.
- Branch theme accents: Cairo (`#1E3A8A` Deep Blue), Alexandria (`#0D9488` Teal), Mansoura (`#15803D` Muted Green).
- Offline notification and network status indicators.

---

## 4. Non-Functional & Reliability Requirements

| Requirement | Metric / Standard |
|---|---|
| **Architecture** | Client-Server: Electron Desktop $\to$ Express REST API $\to$ PostgreSQL |
| **Data Integrity** | ACID compliance via PostgreSQL transactions; zero dirty reads on inventory/cash |
| **Precision** | Financial amounts stored in PostgreSQL `NUMERIC(14, 2)` (no IEEE float rounding) |
| **Response Time** | API response $< 200\text{ms}$ for standard queries; $< 600\text{ms}$ for aggregate reports |
| **Security** | JWT authentication (HTTP-only or secure bearer), bcrypt password hashing ($12$ rounds), strictly parameterized ORM queries |
| **Desktop Client** | Electron Context Isolation enabled, Node Integration disabled in renderer, secure IPC |
| **Auditability** | Complete immutable audit log capturing actor, IP, timestamp, entity, and diff payload |
