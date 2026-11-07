# Comprehensive Test Plan & Quality Assurance Strategy

## 1. Test Objectives & Coverage Matrix

| Test Domain | Target Suite | Key Invariants Tested |
|---|---|---|
| **Security & Access Control** | Backend Integration | Branch scoping prevents cross-branch data access; direct API tampering returns 403; expired/forged tokens return 401. |
| **Financial Calculations** | Unit & Service Tests | $\text{Net Sales} = \text{Gross} - \text{Discount} - \text{Returns}$; $\text{Gross Profit} = \text{Net} - \text{COGS}$; Commission 4-policy engine matches mathematical definitions; aging buckets match calendar due dates. |
| **Inventory Integrity** | Transactional Tests | Dispatches atomically decrement available stock; stock movements record exact balance after; negative stock is rejected; transfer out/in preserves conservation of inventory. |
| **Customer Receivables** | Accounting Tests | Partial payment allocations reduce balance due; unallocated payment amounts are tracked; credit limit breaches raise operational alerts. |
| **Data Quality & Staging** | Import Pipeline Tests | Duplicate invoice numbers trigger collision warnings; invalid foreign keys or negative amounts in CSV rows are captured in rejected-row reports without crashing batch. |

---

## 2. Test Execution Command Guide

Run tests from the root directory:
```bash
# Run backend test suite
cd backend
npm test

# Run frontend unit & component tests
cd ../desktop-app
npm test

# Run end-to-end integration tests
cd ../backend
npm run test:e2e
```
