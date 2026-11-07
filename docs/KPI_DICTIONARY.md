# Business KPI Dictionary & Financial Logic Specification

This document provides mathematical definitions, source database fields, exclusions, and business assumptions for all analytical indicators computed by the system.

---

## 1. Top-Line Revenue & Profitability KPIs

### 1.1 Gross Sales (إجمالي المبيعات)
* **Definition**: Total value of invoiced sales before applying discounts, value-added tax adjustments, or subsequent customer returns.
* **Formula**:
  $$\text{Gross Sales} = \sum_{\text{invoice} \in \mathcal{I}} \left( \sum_{\text{line} \in \text{lines}} (\text{quantity} \times \text{unit\_price}) \right)$$
* **Source Fields**: `sales_invoices.gross_amount` (aggregated from `sales_invoice_lines`).
* **Inclusions**: All invoices with `status \in \{ 'ISSUED', 'PARTIAL', 'PAID' \}`.
* **Exclusions**: Invoices in `DRAFT` or `CANCELED` state; customer returns; subsequent credit notes.

### 1.2 Invoice Discounts & Leakage (الخصومات الممنوحة)
* **Definition**: Price concessions and promotional discounts granted to customers.
* **Formula**:
  $$\text{Discounts} = \sum_{\text{invoice} \in \mathcal{I}} \text{sales\_invoices.discount\_amount}$$
* **Discount Leakage Rate**:
  $$\text{Discount Rate \%} = \begin{cases} \frac{\text{Discounts}}{\text{Gross Sales}} \times 100 & \text{if Gross Sales} > 0 \\ 0\% & \text{otherwise} \end{cases}$$

### 1.3 Sales Returns (مردودات المبيعات)
* **Definition**: Monetary value of goods returned by customers and accepted by branch operations.
* **Formula**:
  $$\text{Sales Returns} = \sum_{\text{return} \in \mathcal{R}} \text{sales\_returns.total\_amount}$$
* **Return Rate \%**:
  $$\text{Return Rate \%} = \begin{cases} \frac{\text{Sales Returns}}{\text{Gross Sales}} \times 100 & \text{if Gross Sales} > 0 \\ 0\% & \text{otherwise} \end{cases}$$
* **Exclusions**: Rejected return claims (`status = 'REJECTED'`).

### 1.4 Net Sales (صافي المبيعات)
* **Definition**: True top-line revenue earned after accounting for price deductions and returned inventory.
* **Formula**:
  $$\text{Net Sales} = \text{Gross Sales} - \text{Discounts} - \text{Sales Returns}$$
* **Assumptions**: Taxes (VAT) are accounted for separately in fiscal balance sheets and excluded from commercial net revenue.

### 1.5 Cost of Goods Sold - COGS (تكلفة البضاعة المباعة)
* **Definition**: Direct cost of inventory items sold to customers, minus the cost of goods successfully returned to restockable inventory.
* **Formula**:
  $$\text{COGS} = \sum \text{sales\_invoice\_lines.line\_cogs} - \sum \text{sales\_return\_lines.line\_cost}_{(\text{disposition} = \text{'RETURN\_TO\_STOCK'})}$$
* **Costing Policy**: Weighted Average Cost (WAC) per product per branch batch, with FIFO batch tracing enabled for strict batch lots.
* **Caveat**: Goods scrapped or quarantined as damaged upon return do NOT reduce COGS; they remain in COGS or are transferred to a shrinkage loss account.

### 1.6 Gross Profit & Margin (مجمل الربح وهامش مجمل الربح)
* **Formula**:
  $$\text{Gross Profit} = \text{Net Sales} - \text{COGS}$$
  $$\text{Gross Profit Margin \%} = \begin{cases} \frac{\text{Gross Profit}}{\text{Net Sales}} \times 100 & \text{if Net Sales} > 0 \\ 0\% & \text{otherwise} \end{cases}$$
* **Safe Handling**: If $\text{Net Sales} \le 0$, margin is reported as $0.00\%$ or flagged as negative variance.

### 1.7 Operating Profit & Margin (الربح التشغيلي)
* **Definition**: Commercial earnings remaining after subtracting all documented branch operating expenses.
* **Included Expense Categories**:
  - Transportation, vehicle fuel, fleet maintenance, and delivery logistics.
  - Branch warehouse rent, electricity, utilities, and internet.
  - Branch administrative overhead, stationery, and packaging supplies.
  - Field sales travel allowances and authorized marketing incentives.
* **Formula**:
  $$\text{Operating Expenses (OPEX)} = \sum_{\text{expense} \in \mathcal{E}} \text{expenses.amount}_{(\text{is\_operating\_expense} = \text{true})}$$
  $$\text{Operating Profit} = \text{Gross Profit} - \text{Operating Expenses}$$
  $$\text{Operating Margin \%} = \begin{cases} \frac{\text{Operating Profit}}{\text{Net Sales}} \times 100 & \text{if Net Sales} > 0 \\ 0\% & \text{otherwise} \end{cases}$$
* **Exclusion Warning**: Headquarter central corporate taxes and capital depreciation are excluded from branch-level operating profit and tracked at consolidated corporate level only.

---

## 2. Sales Force & Commission Performance KPIs

### 2.1 Sales Target Achievement (نسبة تحقيق المستهدف)
* **Formula**:
  $$\text{Achievement \%} = \begin{cases} \frac{\text{Eligible Sales}}{\text{Target Amount}} \times 100 & \text{if Target Amount} > 0 \\ 0\% & \text{otherwise} \end{cases}$$
* **Configurable Basis**: Defaults to **Net Sales** (Gross Sales minus individual representative's discounts and returns) to deter volume gaming.

### 2.2 Commission Calculation Models
The engine supports 4 configurable policies:
1. **Policy 1: Gross Sales Basis**:
   $$\text{Commission} = \text{Gross Sales} \times 2.0\%$$
2. **Policy 2: Net of Discount Basis**:
   $$\text{Commission} = (\text{Gross Sales} - \text{Discounts}) \times 2.0\%$$
3. **Policy 3: Net Sales Basis (Recommended Baseline)**:
   $$\text{Commission} = (\text{Gross Sales} - \text{Discounts} - \text{Returns}) \times 2.0\%$$
4. **Policy 4: Profit-Contribution Model (Growth Incentive)**:
   $$\text{Commission} = \text{Gross Profit} \times 10.0\%$$

* **Commission Discrepancy**:
  $$\text{Discrepancy} = \text{Recalculated Commission} - \text{Recorded Commission}$$

---

## 3. Working Capital & Balance Sheet KPIs

### 3.1 Customer Receivables & Aging Buckets
* **Invoice Balance Due**:
  $$\text{Balance Due} = \text{Net Invoice Amount} - \sum \text{Allocated Payments}$$
* **Aging Computation**:
  $$\text{Days Past Due} = \max\left(0, \lfloor \text{Current Date} - \text{Invoice Due Date} \rfloor\right)$$
* **Aging Buckets**:
  - **Current**: $\text{Days Past Due} \le 0$ (not yet due)
  - **1–30 Days**: $1 \le \text{Days Past Due} \le 30$
  - **31–60 Days**: $31 \le \text{Days Past Due} \le 60$
  - **61–90 Days**: $61 \le \text{Days Past Due} \le 90$
  - **>90 Days Overdue**: $\text{Days Past Due} > 90$ (High credit risk)

* **Overdue Receivables Ratio**:
  $$\text{Overdue Ratio \%} = \frac{\sum_{\text{overdue}} \text{Balance Due}}{\sum_{\text{all}} \text{Balance Due}} \times 100$$

### 3.2 Inventory Valuation & Days Sales of Inventory (DSI)
* **Total Inventory Value**:
  $$\text{Inventory Value} = \sum_{\text{batches}} (\text{quantity\_available} \times \text{unit\_cost})$$
* **Days Sales of Inventory (DSI)**:
  $$\text{DSI} = \frac{\text{Average Inventory Value}}{\text{Annualized COGS} / 365}$$
