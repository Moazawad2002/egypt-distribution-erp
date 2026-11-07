import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { memoryStore } from '../db/memory-store.js';

export interface StagedInvoiceRow {
  rowNumber: number;
  invoiceNumber: string;
  branchCode: string;
  customerCode: string;
  repCode: string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  isValid: boolean;
  errors: string[];
}

export interface ImportValidationResult {
  jobId: string;
  totalRows: number;
  validRowsCount: number;
  rejectedRowsCount: number;
  previewRows: StagedInvoiceRow[];
  rejectedRows: Array<{ rowNumber: number; error: string; raw: any }>;
}

export class ImportService {
  async parseAndValidateInvoiceFile(
    fileBuffer: Buffer,
    fileName: string,
    userId: string
  ): Promise<ImportValidationResult> {
    let records: any[] = [];

    if (fileName.endsWith('.csv')) {
      const content = fileBuffer.toString('utf-8');
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } else {
      // Excel workbook (.xlsx, .xls)
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      records = XLSX.utils.sheet_to_json(sheet);
    }

    const stagedRows: StagedInvoiceRow[] = [];
    const rejectedRows: Array<{ rowNumber: number; error: string; raw: any }> = [];

    let rowIdx = 1;
    for (const row of records) {
      rowIdx++;
      const errors: string[] = [];

      const invoiceNumber = (row.invoice_number || row.InvoiceNumber || row.InvoiceNo || '').toString().trim();
      const branchCode = (row.branch_code || row.BranchCode || row.Branch || '').toString().trim().toUpperCase();
      const customerCode = (row.customer_code || row.CustomerCode || row.Customer || '').toString().trim();
      const repCode = (row.rep_code || row.RepCode || row.SalesRepresentative || '').toString().trim();
      const invoiceDate = (row.invoice_date || row.InvoiceDate || row.Date || new Date().toISOString().split('T')[0]).toString().trim();
      const dueDate = (row.due_date || row.DueDate || '').toString().trim();

      const grossAmount = parseFloat(row.gross_amount || row.GrossAmount || row.Gross || '0');
      const discountAmount = parseFloat(row.discount_amount || row.DiscountAmount || row.Discount || '0');
      const netAmount = parseFloat(row.net_amount || row.NetAmount || (grossAmount - discountAmount).toString());

      // Validations
      if (!invoiceNumber) {
        errors.push('Missing required Invoice Number');
      } else {
        // Duplicate check
        const existingInvoice = memoryStore.invoices.find(i => i.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase());
        if (existingInvoice) {
          errors.push(`Duplicate invoice identifier: ${invoiceNumber} already exists in database`);
        }
      }

      const branch = memoryStore.branches.find(b => b.code === branchCode);
      if (!branch) {
        errors.push(`Invalid branch code '${branchCode}'. Must be CAI, ALX, or MNS`);
      }

      if (isNaN(grossAmount) || grossAmount <= 0) {
        errors.push(`Invalid gross amount: '${grossAmount}'. Must be positive number`);
      }

      if (discountAmount < 0) {
        errors.push(`Negative discount amount: '${discountAmount}' is not allowed`);
      }

      if (discountAmount > grossAmount) {
        errors.push(`Discount ${discountAmount} cannot exceed gross amount ${grossAmount}`);
      }

      const isValid = errors.length === 0;

      const staged: StagedInvoiceRow = {
        rowNumber: rowIdx,
        invoiceNumber,
        branchCode,
        customerCode,
        repCode,
        invoiceDate,
        dueDate: dueDate || invoiceDate,
        grossAmount: isNaN(grossAmount) ? 0 : grossAmount,
        discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
        netAmount: isNaN(netAmount) ? 0 : netAmount,
        isValid,
        errors
      };

      stagedRows.push(staged);
      if (!isValid) {
        rejectedRows.push({
          rowNumber: rowIdx,
          error: errors.join('; '),
          raw: row
        });
      }
    }

    const jobId = `job-${Date.now()}`;

    // Record Import Audit
    memoryStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId,
      action: 'IMPORT_STAGING',
      entityName: 'IMPORT_JOB',
      entityId: jobId,
      details: {
        fileName,
        totalRows: records.length,
        validRows: stagedRows.filter(r => r.isValid).length,
        rejectedRows: rejectedRows.length
      },
      timestamp: new Date().toISOString()
    });

    return {
      jobId,
      totalRows: records.length,
      validRowsCount: stagedRows.filter(r => r.isValid).length,
      rejectedRowsCount: rejectedRows.length,
      previewRows: stagedRows.slice(0, 10),
      rejectedRows
    };
  }

  async commitImport(validRows: StagedInvoiceRow[], userId: string) {
    let committed = 0;
    for (const row of validRows) {
      if (!row.isValid) continue;

      const branch = memoryStore.branches.find(b => b.code === row.branchCode);
      if (!branch) continue;

      const customer = memoryStore.customers.find(c => c.branchId === branch.id) || memoryStore.customers[0];
      const rep = memoryStore.salesReps.find(r => r.branchId === branch.id) || memoryStore.salesReps[0];

      const invoiceId = `inv-imp-${Date.now()}-${committed}`;
      const cogs = row.grossAmount * 0.82; // standard 82% estimated baseline

      memoryStore.invoices.push({
        id: invoiceId,
        invoiceNumber: row.invoiceNumber,
        branchId: branch.id,
        customerId: customer.id,
        salesRepresentativeId: rep.id,
        invoiceDate: row.invoiceDate,
        dueDate: row.dueDate,
        grossAmount: row.grossAmount,
        discountAmount: row.discountAmount,
        taxAmount: 0.00,
        netAmount: row.netAmount,
        cogsAmount: cogs,
        paidAmount: 0.00,
        balanceDue: row.netAmount,
        paymentStatus: 'UNPAID',
        status: 'ISSUED',
        notes: 'Imported from staged batch'
      });
      committed++;
    }

    return { committedCount: committed };
  }
}

export const importService = new ImportService();
