import { describe, it, expect } from 'vitest';
import { salesService } from '../src/services/sales.service.js';
import { importService } from '../src/services/import.service.js';
import { memoryStore } from '../src/db/memory-store.js';

describe('Inventory Integrity & Import Staging Quality', () => {
  it('creates invoice and records perpetual inventory dispatch movement', async () => {
    const initialMovements = memoryStore.inventoryMovements.length;

    const invoice = await salesService.createInvoice({
      branchId: 'branch-cai-01',
      customerId: 'cust-cai-01',
      salesRepresentativeId: 'rep-cai-01',
      dueDate: '2026-11-30',
      lines: [
        { productId: 'prod-oil-01', quantity: 15, unitPrice: 890, discountPercent: 2 }
      ]
    }, 'user-mgr-cai');

    expect(invoice.id).toBeDefined();
    expect(invoice.netAmount).toBe(15 * 890 * 0.98);
    expect(memoryStore.inventoryMovements.length).toBe(initialMovements + 1);

    const latestMovement = memoryStore.inventoryMovements[memoryStore.inventoryMovements.length - 1];
    expect(latestMovement.movementType).toBe('DISPATCH');
    expect(latestMovement.quantityChange).toBe(-15);
  });

  it('rejects duplicate invoices and invalid data during CSV staging', async () => {
    const csvContent = `invoice_number,branch_code,customer_code,rep_code,gross_amount,discount_amount\n` +
      `INV-TEST-001,CAI,CUST-CAI-001,REP-CAI-01,50000,1000\n` +
      `INV-CAI-2026-001,CAI,CUST-CAI-001,REP-CAI-01,20000,500\n` + // Duplicate invoice number!
      `INV-TEST-002,INVALID_BRANCH,CUST-CAI-001,REP-CAI-01,30000,500\n` + // Invalid branch!
      `INV-TEST-003,CAI,CUST-CAI-001,REP-CAI-01,-1000,0`; // Negative gross amount!

    const buffer = Buffer.from(csvContent, 'utf-8');
    const result = await importService.parseAndValidateInvoiceFile(buffer, 'test_batch.csv', 'user-admin-01');

    expect(result.totalRows).toBe(4);
    expect(result.validRowsCount).toBe(1); // Only the first row is valid
    expect(result.rejectedRowsCount).toBe(3);

    // Verify rejection reasons
    const duplicateError = result.rejectedRows.find(r => r.error.includes('Duplicate invoice identifier'));
    expect(duplicateError).toBeDefined();

    const branchError = result.rejectedRows.find(r => r.error.includes('Invalid branch code'));
    expect(branchError).toBeDefined();

    const negativeError = result.rejectedRows.find(r => r.error.includes('Invalid gross amount'));
    expect(negativeError).toBeDefined();
  });
});
