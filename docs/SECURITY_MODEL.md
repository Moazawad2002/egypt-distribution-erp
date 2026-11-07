# Enterprise Security Model & Access Control Architecture

## 1. Role-Based Access Control (RBAC) Matrix

| Resource / Action | CEO / Owner | Branch Manager | Accountant | Inventory Staff | Sales Rep | Administrator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **All Branches Aggregation** |  Full |  Restricted |  Restricted |  Restricted |  Restricted |  Full |
| **Branch-Specific Data** |  Full |  Own Branch Only |  Authorized Only |  Warehouse Only |  Assigned Customers |  Admin Only |
| **Executive Dashboards** |  Full |  Own Branch Only |  Financial Only |  No |  No |  Audit Only |
| **Create Sales Invoices** |  Read-Only |  Approve |  Review |  No |  Create (Assigned) |  System |
| **Approve Discounts** |  Override |  Up to 10% |  No |  No |  Request Only |  No |
| **Sales Returns (RMA)** |  Audit |  Approve |  Post Credit |  Inspect Stock |  Submit Claim |  Audit |
| **Inventory Adjustments** |  Audit |  Approve |  Cost Review |  Initiate Count |  No |  Audit |
| **Stock Transfers** |  Audit |  Authorize Out/In |  No |  Dispatch/Receive |  No |  Audit |
| **Post Customer Payments** |  Audit |  Audit |  Full Create/Allocate |  No |  Collect & Log |  Audit |
| **Record Branch Expenses** |  Audit |  Submit/Approve |  Verify & Pay |  No |  Expense Claim |  Audit |
| **Commission Reconciliation** |  Sign-off |  Branch Review |  Payroll Match |  No |  View Own Statement |  Audit |
| **User & Role Provisioning** |  Authorize |  No |  No |  No |  No |  Full Managed |
| **Audit Log Inspection** |  Full |  Branch Events |  Finance Events |  No |  No |  Full System |

---

## 2. Server-Enforced Branch Scoping Rules

Security is enforced strictly on the backend API layer. React client state and Electron renderer memory are treated as untrusted.

### Rule 1: Identity Token Derivation
All protected endpoints require an `Authorization: Bearer <token>` header. The token payload contains:
```json
{
  "userId": "uuid-v4",
  "username": "nour.manager",
  "role": "BRANCH_MANAGER",
  "branchId": "branch-cairo-uuid",
  "branchCode": "CAI"
}
```
The server verifies the JWT signature and looks up the active user state. The user's role and branch ID are derived solely from the server's validated session.

### Rule 2: Automatic Query Scoping Middleware
For any user whose role is NOT `CEO` or `ADMIN`:
1. The middleware injects `where: { branchId: req.user.branchId }` into all database reads and writes.
2. If a request provides a query parameter `?branchId=branch-alexandria-uuid` or a payload with a different `branchId`, the middleware intercepts and either overrides it or rejects the call with `403 Forbidden: Cross-branch access denied`.
3. In multi-branch aggregation endpoints, non-CEO requests return data strictly filtered to their authorized branch.

---

## 3. Desktop Application Security Architecture

### 3.1 Electron Security Hardening Checklist
- `contextIsolation: true`: Isolates preload scripts from the renderer's website context.
- `nodeIntegration: false`: Renderer has zero access to Node `fs`, `child_process`, `net`, or internal modules.
- `webPreferences.sandbox: true`: Chromium process-level sandboxing enabled.
- `webPreferences.enableRemoteModule: false`: Prevents remote module code execution.
- `webSecurity: true`: Enforces same-origin policy and strict resource loading.

### 3.2 IPC Communication Whitelist
The preload script exposes only explicit asynchronous RPC calls:
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemVersion: () => ipcRenderer.invoke('system:get-version'),
  exportPdf: (htmlContent: string) => ipcRenderer.invoke('export:pdf', htmlContent),
  showSaveDialog: (options: object) => ipcRenderer.invoke('dialog:save', options),
  getNetworkStatus: () => ipcRenderer.invoke('network:status')
});
```
Arbitrary IPC channels like `execute-shell` or `eval` are strictly prohibited.

### 3.3 Zero Secrets in Desktop Distribution
- The desktop bundle contains **no database passwords, master API keys, or cloud credentials**.
- Communication with the backend occurs exclusively over TLS 1.3 encrypted HTTPS.
- Authentication tokens are kept in secure application memory (with optional encrypted OS keychain persistence via `safeStorage` API).
