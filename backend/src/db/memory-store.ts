import bcrypt from 'bcryptjs';

export interface BranchRecord {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  address: string;
  phone: string;
  colorCode: string;
  isActive: boolean;
}

export interface UserRecord {
  id: string;
  branchId: string | null;
  role: 'CEO' | 'BRANCH_MANAGER' | 'ACCOUNTANT' | 'INVENTORY_STAFF' | 'SALES_REP' | 'ADMIN';
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  permissions: string[];
}

export interface SalesRepRecord {
  id: string;
  branchId: string;
  userId?: string | null;
  code: string;
  name: string;
  phone: string;
  email: string;
  commissionRate: number; // e.g. 0.02 = 2%
  isActive: boolean;
}

export interface SalesTargetRecord {
  id: string;
  salesRepresentativeId: string;
  branchId: string;
  periodYear: number;
  periodMonth: number;
  targetAmount: number;
  targetType: string;
}

export interface ProductRecord {
  id: string;
  categoryId: string;
  uomId: string;
  supplierId: string;
  sku: string;
  barcode: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  caseSize: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  minPrice: number;
  isActive: boolean;
  requiresExpiryTracking: boolean;
}

export interface CustomerRecord {
  id: string;
  branchId: string;
  code: string;
  name: string;
  customerType: string;
  taxId: string;
  phone: string;
  address: string;
  creditLimit: number;
  creditDays: number;
  isActive: boolean;
}

export interface InvoiceLineRecord {
  id: string;
  salesInvoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  lineCogs: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  branchId: string;
  customerId: string;
  salesRepresentativeId: string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  cogsAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  status: 'DRAFT' | 'ISSUED' | 'CANCELED';
  notes: string;
}

export interface ReturnRecord {
  id: string;
  returnNumber: string;
  salesInvoiceId: string;
  branchId: string;
  customerId: string;
  returnDate: string;
  totalAmount: number;
  totalCost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  returnReason: string;
  stockDisposition: 'RETURN_TO_STOCK' | 'QUARANTINE_DAMAGED' | 'SCRAPPED';
  notes: string;
}

export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  customerId: string;
  branchId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';
  referenceNumber: string;
  unallocatedAmount: number;
  notes: string;
}

export interface PaymentAllocationRecord {
  id: string;
  customerPaymentId: string;
  salesInvoiceId: string;
  allocatedAmount: number;
}

export interface ExpenseRecord {
  id: string;
  branchId: string;
  categoryId: string;
  categoryName: string;
  expenseDate: string;
  amount: number;
  recipientOrVendor: string;
  paymentMethod: string;
  notes: string;
  isOperatingExpense: boolean;
}

export interface BudgetRecord {
  id: string;
  branchId: string;
  categoryId: string;
  categoryName: string;
  periodYear: number;
  periodMonth: number;
  budgetAmount: number;
}

export interface CommissionCalculationRecord {
  id: string;
  salesRepresentativeId: string;
  salesRepName: string;
  branchId: string;
  periodYear: number;
  periodMonth: number;
  policyCode: string;
  eligibleBaseAmount: number;
  appliedRate: number;
  calculatedCommission: number;
  recordedCommission: number;
  discrepancyAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  notes: string;
}

export interface InventoryMovementRecord {
  id: string;
  warehouseId: string;
  productId: string;
  movementType: string;
  referenceType: string;
  referenceId: string;
  quantityChange: number;
  unitCost: number;
  totalCost: number;
  balanceAfter: number;
  timestamp: string;
}

export interface OperationalAlertRecord {
  id: string;
  branchId?: string | null;
  alertType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string | null;
  username?: string | null;
  branchId?: string | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  details: any;
  ipAddress?: string | null;
  timestamp: string;
}

// Master In-Memory / Fallback Data Store
export class MemoryStore {
  branches: BranchRecord[] = [];
  users: UserRecord[] = [];
  salesReps: SalesRepRecord[] = [];
  targets: SalesTargetRecord[] = [];
  products: ProductRecord[] = [];
  customers: CustomerRecord[] = [];
  invoices: InvoiceRecord[] = [];
  invoiceLines: InvoiceLineRecord[] = [];
  returns: ReturnRecord[] = [];
  payments: PaymentRecord[] = [];
  paymentAllocations: PaymentAllocationRecord[] = [];
  expenses: ExpenseRecord[] = [];
  budgets: BudgetRecord[] = [];
  commissions: CommissionCalculationRecord[] = [];
  inventoryMovements: InventoryMovementRecord[] = [];
  alerts: OperationalAlertRecord[] = [];
  auditLogs: AuditLogRecord[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('Password123!', salt);

    // 1. Branches
    this.branches = [
      {
        id: 'branch-cai-01',
        code: 'CAI',
        nameEn: 'Cairo Branch',
        nameAr: 'فرع القاهرة',
        address: 'Obour Market Logistics Hub, Cairo',
        phone: '+20 2 2456 7890',
        colorCode: '#1E3A8A', // Deep Blue
        isActive: true
      },
      {
        id: 'branch-alx-02',
        code: 'ALX',
        nameEn: 'Alexandria Branch',
        nameAr: 'فرع الإسكندرية',
        address: 'Kababgi Commercial Zone, Smouha, Alexandria',
        phone: '+20 3 4876 5432',
        colorCode: '#0D9488', // Teal
        isActive: true
      },
      {
        id: 'branch-mns-03',
        code: 'MNS',
        nameEn: 'Mansoura Branch',
        nameAr: 'فرع المنصورة',
        address: 'Gomhoria Logistics Corridor, Mansoura, Dakahlia',
        phone: '+20 50 2345 678',
        colorCode: '#15803D', // Muted Green
        isActive: true
      }
    ];

    // 2. Initial Users
    this.users = [
      {
        id: 'user-ceo-01',
        branchId: null,
        role: 'CEO',
        username: 'ceo',
        email: 'ceo@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Sameh Abdel-Rahman (CEO)',
        phone: '+20 100 111 2222',
        isActive: true,
        permissions: ['*']
      },
      {
        id: 'user-admin-01',
        branchId: null,
        role: 'ADMIN',
        username: 'admin',
        email: 'admin@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Tarek Zaki (System Admin)',
        phone: '+20 100 000 9999',
        isActive: true,
        permissions: ['*']
      },
      {
        id: 'user-mgr-cai',
        branchId: 'branch-cai-01',
        role: 'BRANCH_MANAGER',
        username: 'manager.cairo',
        email: 'manager.cairo@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Hassan Mahmoud (Cairo Branch Mgr)',
        phone: '+20 100 333 4444',
        isActive: true,
        permissions: ['BRANCH_VIEW', 'BRANCH_WRITE', 'DISCOUNT_APPROVE', 'RETURN_APPROVE']
      },
      {
        id: 'user-mgr-alx',
        branchId: 'branch-alx-02',
        role: 'BRANCH_MANAGER',
        username: 'manager.alex',
        email: 'manager.alex@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Ahmed El-Sayed (Alexandria Branch Mgr)',
        phone: '+20 100 555 6666',
        isActive: true,
        permissions: ['BRANCH_VIEW', 'BRANCH_WRITE', 'DISCOUNT_APPROVE', 'RETURN_APPROVE']
      },
      {
        id: 'user-mgr-mns',
        branchId: 'branch-mns-03',
        role: 'BRANCH_MANAGER',
        username: 'manager.mansoura',
        email: 'manager.mansoura@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Khaled Badawi (Mansoura Branch Mgr)',
        phone: '+20 100 777 8888',
        isActive: true,
        permissions: ['BRANCH_VIEW', 'BRANCH_WRITE', 'DISCOUNT_APPROVE', 'RETURN_APPROVE']
      },
      {
        id: 'user-acct-01',
        branchId: null,
        role: 'ACCOUNTANT',
        username: 'accountant',
        email: 'accountant@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Mona Radwan (Senior Accountant)',
        phone: '+20 101 222 3333',
        isActive: true,
        permissions: ['FINANCE_READ', 'FINANCE_WRITE', 'PAYMENTS_POST', 'EXPENSES_POST']
      },
      {
        id: 'user-inv-cai',
        branchId: 'branch-cai-01',
        role: 'INVENTORY_STAFF',
        username: 'inventory.cairo',
        email: 'inventory.cairo@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Ibrahim Fathy (Cairo Warehouse Supv)',
        phone: '+20 102 333 4444',
        isActive: true,
        permissions: ['INVENTORY_READ', 'INVENTORY_WRITE', 'STOCK_TRANSFER']
      },
      {
        id: 'user-sales-cai-1',
        branchId: 'branch-cai-01',
        role: 'SALES_REP',
        username: 'omar.khaled',
        email: 'omar.khaled@egypt-distribution.com',
        passwordHash: defaultPasswordHash,
        fullName: 'Omar Khaled (Sales Rep - Cairo)',
        phone: '+20 109 111 2233',
        isActive: true,
        permissions: ['SALES_CREATE', 'CUSTOMERS_VIEW']
      }
    ];

    // 3. Initial Sales Representatives & Targets
    // Required in prompt:
    // Omar Khaled (Cairo): 650,000 EGP
    // Nour Hassan (Cairo): 600,000 EGP
    // Salma Tarek (Alexandria): 580,000 EGP
    // Karim Nabil (Alexandria): 540,000 EGP
    // Mostafa Ibrahim (Mansoura): 420,000 EGP
    // Aya Sherif (Mansoura): 400,000 EGP
    // Total Target: EGP 3,190,000
    this.salesReps = [
      {
        id: 'rep-cai-01',
        branchId: 'branch-cai-01',
        userId: 'user-sales-cai-1',
        code: 'REP-CAI-01',
        name: 'Omar Khaled',
        phone: '+20 109 111 2233',
        email: 'omar.khaled@egypt-distribution.com',
        commissionRate: 0.02,
        isActive: true
      },
      {
        id: 'rep-cai-02',
        branchId: 'branch-cai-01',
        userId: null,
        code: 'REP-CAI-02',
        name: 'Nour Hassan',
        phone: '+20 109 222 3344',
        email: 'nour.hassan@egypt-distribution.com',
        commissionRate: 0.02,
        isActive: true
      },
      {
        id: 'rep-alx-01',
        branchId: 'branch-alx-02',
        userId: null,
        code: 'REP-ALX-01',
        name: 'Salma Tarek',
        phone: '+20 109 333 4455',
        email: 'salma.tarek@egypt-distribution.com',
        commissionRate: 0.02,
        isActive: true
      },
      {
        id: 'rep-alx-02',
        branchId: 'branch-alx-02',
        userId: null,
        code: 'REP-ALX-02',
        name: 'Karim Nabil',
        phone: '+20 109 444 5566',
        email: 'karim.nabil@egypt-distribution.com',
        commissionRate: 0.02,
        isActive: true
      },
      {
        id: 'rep-mns-01',
        branchId: 'branch-mns-03',
        userId: null,
        code: 'REP-MNS-01',
        name: 'Mostafa Ibrahim',
        phone: '+20 109 555 6677',
        email: 'mostafa.ibrahim@egypt-distribution.com',
        commissionRate: 0.02,
        isActive: true
      },
      {
        id: 'rep-mns-02',
        branchId: 'branch-mns-03',
        userId: null,
        code: 'REP-MNS-02',
        name: 'Aya Sherif',
        phone: '+20 109 666 7788',
        email: 'aya.sherif@egypt-distribution.com',
        commissionRate: 0.02,
        isActive: true
      }
    ];

    const currentYear = 2026;
    const currentMonth = 10;

    this.targets = [
      { id: 'tgt-01', salesRepresentativeId: 'rep-cai-01', branchId: 'branch-cai-01', periodYear: currentYear, periodMonth: currentMonth, targetAmount: 650000, targetType: 'NET_SALES' },
      { id: 'tgt-02', salesRepresentativeId: 'rep-cai-02', branchId: 'branch-cai-01', periodYear: currentYear, periodMonth: currentMonth, targetAmount: 600000, targetType: 'NET_SALES' },
      { id: 'tgt-03', salesRepresentativeId: 'rep-alx-01', branchId: 'branch-alx-02', periodYear: currentYear, periodMonth: currentMonth, targetAmount: 580000, targetType: 'NET_SALES' },
      { id: 'tgt-04', salesRepresentativeId: 'rep-alx-02', branchId: 'branch-alx-02', periodYear: currentYear, periodMonth: currentMonth, targetAmount: 540000, targetType: 'NET_SALES' },
      { id: 'tgt-05', salesRepresentativeId: 'rep-mns-01', branchId: 'branch-mns-03', periodYear: currentYear, periodMonth: currentMonth, targetAmount: 420000, targetType: 'NET_SALES' },
      { id: 'tgt-06', salesRepresentativeId: 'rep-mns-02', branchId: 'branch-mns-03', periodYear: currentYear, periodMonth: currentMonth, targetAmount: 400000, targetType: 'NET_SALES' }
    ];

    // 4. Products (Fast-Moving Food & Consumer Goods)
    this.products = [
      {
        id: 'prod-oil-01',
        categoryId: 'cat-oil',
        uomId: 'uom-crt',
        supplierId: 'sup-arma',
        sku: 'OIL-CRN-08L',
        barcode: '6221000100018',
        nameEn: 'Crystal Pure Corn Oil 0.8L (Carton 12)',
        nameAr: 'زيت ذرة كريستال أنقى 0.8 لتر (كرتونة 12)',
        brand: 'Crystal',
        caseSize: 12,
        reorderPoint: 150,
        costPrice: 780.00,
        sellingPrice: 890.00,
        minPrice: 850.00,
        isActive: true,
        requiresExpiryTracking: true
      },
      {
        id: 'prod-oil-02',
        categoryId: 'cat-oil',
        uomId: 'uom-crt',
        supplierId: 'sup-arma',
        sku: 'OIL-SNF-16L',
        barcode: '6221000100025',
        nameEn: 'Crystal Sunflower Oil 1.6L (Carton 6)',
        nameAr: 'زيت عباد شمس كريستال 1.6 لتر (كرتونة 6)',
        brand: 'Crystal',
        caseSize: 6,
        reorderPoint: 120,
        costPrice: 620.00,
        sellingPrice: 710.00,
        minPrice: 680.00,
        isActive: true,
        requiresExpiryTracking: true
      },
      {
        id: 'prod-rice-01',
        categoryId: 'cat-staples',
        uomId: 'uom-crt',
        supplierId: 'sup-doha',
        sku: 'RCE-DHA-05K',
        barcode: '6221000200015',
        nameEn: 'Al Doha Premium Egyptian Rice 5kg (Pack 4)',
        nameAr: 'أرز الضحى فاخر مصري 5 كجم (بالتة 4)',
        brand: 'Al Doha',
        caseSize: 4,
        reorderPoint: 200,
        costPrice: 660.00,
        sellingPrice: 760.00,
        minPrice: 720.00,
        isActive: true,
        requiresExpiryTracking: true
      },
      {
        id: 'prod-pst-01',
        categoryId: 'cat-staples',
        uomId: 'uom-crt',
        supplierId: 'sup-savola',
        sku: 'PST-MLK-400G',
        barcode: '6221000300012',
        nameEn: 'El Maleka Penne Pasta 400g (Carton 20)',
        nameAr: 'مكرونة الملكة قلم 400 جم (كرتونة 20)',
        brand: 'El Maleka',
        caseSize: 20,
        reorderPoint: 300,
        costPrice: 240.00,
        sellingPrice: 285.00,
        minPrice: 270.00,
        isActive: true,
        requiresExpiryTracking: true
      },
      {
        id: 'prod-sgr-01',
        categoryId: 'cat-staples',
        uomId: 'uom-crt',
        supplierId: 'sup-sugar-co',
        sku: 'SGR-WHT-01K',
        barcode: '6221000400019',
        nameEn: 'Hawamdia Refined White Sugar 1kg (Sack 10)',
        nameAr: 'سكر أبيض نقي الحوامدية 1 كجم (رابطة 10)',
        brand: 'Hawamdia',
        caseSize: 10,
        reorderPoint: 250,
        costPrice: 320.00,
        sellingPrice: 370.00,
        minPrice: 350.00,
        isActive: true,
        requiresExpiryTracking: true
      },
      {
        id: 'prod-det-01',
        categoryId: 'cat-detergent',
        uomId: 'uom-crt',
        supplierId: 'sup-armand',
        sku: 'DET-OXI-04K',
        barcode: '6221000500016',
        nameEn: 'Oxi Automatic Powder Detergent 4kg (Pack 4)',
        nameAr: 'مسحوق غسيل أوتوماتيك أوكسي 4 كجم (كرتونة 4)',
        brand: 'Oxi',
        caseSize: 4,
        reorderPoint: 100,
        costPrice: 710.00,
        sellingPrice: 830.00,
        minPrice: 790.00,
        isActive: true,
        requiresExpiryTracking: false
      },
      {
        id: 'prod-det-02',
        categoryId: 'cat-detergent',
        uomId: 'uom-crt',
        supplierId: 'sup-pg',
        sku: 'DET-FRY-650M',
        barcode: '6221000500023',
        nameEn: 'Fairy Lemon Dishwashing Liquid 650ml (Carton 16)',
        nameAr: 'سائل غسيل أطباق فيري ليمون 650 مل (كرتونة 16)',
        brand: 'Fairy',
        caseSize: 16,
        reorderPoint: 180,
        costPrice: 640.00,
        sellingPrice: 745.00,
        minPrice: 710.00,
        isActive: true,
        requiresExpiryTracking: true
      }
    ];

    // 5. Customers
    this.customers = [
      { id: 'cust-cai-01', branchId: 'branch-cai-01', code: 'CUST-CAI-001', name: 'Kheir Zaman Supermarkets (Nasr City)', customerType: 'SUPERMARKET', taxId: '100-234-567', phone: '+20 2 2271 8899', address: 'Abbas El-Akkad St, Nasr City, Cairo', creditLimit: 250000, creditDays: 45, isActive: true },
      { id: 'cust-cai-02', branchId: 'branch-cai-01', code: 'CUST-CAI-002', name: 'Al Rayan Wholesale Market (Giza)', customerType: 'WHOLESALER', taxId: '100-888-999', phone: '+20 2 3572 1100', address: 'Faisal Main Road, Giza', creditLimit: 300000, creditDays: 30, isActive: true },
      { id: 'cust-cai-03', branchId: 'branch-cai-01', code: 'CUST-CAI-003', name: 'Awlad Ragab Grocery Store (Maadi)', customerType: 'GROCERY', taxId: '100-444-333', phone: '+20 2 2358 4400', address: 'Degla, Maadi, Cairo', creditLimit: 120000, creditDays: 30, isActive: true },
      { id: 'cust-alx-01', branchId: 'branch-alx-02', code: 'CUST-ALX-001', name: 'Fathalla Gomla Market (Glym)', customerType: 'SUPERMARKET', taxId: '200-111-222', phone: '+20 3 5841 200', address: 'Horreya Ave, Glym, Alexandria', creditLimit: 280000, creditDays: 45, isActive: true },
      { id: 'cust-alx-02', branchId: 'branch-alx-02', code: 'CUST-ALX-002', name: 'Al Mansheya Wholesale Trading Co', customerType: 'WHOLESALER', taxId: '200-333-444', phone: '+20 3 4839 100', address: 'Al Mansheya Commercial Area, Alexandria', creditLimit: 220000, creditDays: 30, isActive: true },
      { id: 'cust-mns-01', branchId: 'branch-mns-03', code: 'CUST-MNS-001', name: 'Delta Hypermarket (Toriel)', customerType: 'SUPERMARKET', taxId: '300-555-666', phone: '+20 50 2234 111', address: 'Toriel, Mansoura', creditLimit: 200000, creditDays: 30, isActive: true },
      { id: 'cust-mns-02', branchId: 'branch-mns-03', code: 'CUST-MNS-002', name: 'Al Baraka Grocery Chain (Talkha)', customerType: 'GROCERY', taxId: '300-777-888', phone: '+20 50 2521 888', address: 'Talkha Commercial Entrance, Dakahlia', creditLimit: 150000, creditDays: 30, isActive: true }
    ];

    // 6. Invoices & Lines with realistic Egyptian trading numbers
    this.invoices = [
      {
        id: 'inv-cai-101',
        invoiceNumber: 'INV-CAI-2026-001',
        branchId: 'branch-cai-01',
        customerId: 'cust-cai-01',
        salesRepresentativeId: 'rep-cai-01', // Omar Khaled
        invoiceDate: '2026-10-02T10:00:00Z',
        dueDate: '2026-11-16T10:00:00Z',
        grossAmount: 185000.00,
        discountAmount: 7400.00, // 4.0% discount
        taxAmount: 0.00,
        netAmount: 177600.00,
        cogsAmount: 153000.00,
        paidAmount: 100000.00,
        balanceDue: 77600.00,
        paymentStatus: 'PARTIAL',
        status: 'ISSUED',
        notes: 'Monthly standard delivery for Kheir Zaman'
      },
      {
        id: 'inv-cai-102',
        invoiceNumber: 'INV-CAI-2026-002',
        branchId: 'branch-cai-01',
        customerId: 'cust-cai-02',
        salesRepresentativeId: 'rep-cai-02', // Nour Hassan
        invoiceDate: '2026-10-04T11:30:00Z',
        dueDate: '2026-11-03T11:30:00Z',
        grossAmount: 240000.00,
        discountAmount: 4800.00, // 2.0% discount
        taxAmount: 0.00,
        netAmount: 235200.00,
        cogsAmount: 201600.00,
        paidAmount: 235200.00,
        balanceDue: 0.00,
        paymentStatus: 'PAID',
        status: 'ISSUED',
        notes: 'Wholesale order for Al Rayan'
      },
      {
        id: 'inv-cai-103',
        invoiceNumber: 'INV-CAI-2026-003',
        branchId: 'branch-cai-01',
        customerId: 'cust-cai-03',
        salesRepresentativeId: 'rep-cai-01', // Omar Khaled
        invoiceDate: '2026-08-15T09:00:00Z', // Overdue (>30 days overdue)
        dueDate: '2026-09-14T09:00:00Z',
        grossAmount: 95000.00,
        discountAmount: 2850.00,
        taxAmount: 0.00,
        netAmount: 92150.00,
        cogsAmount: 78500.00,
        paidAmount: 30000.00,
        balanceDue: 62150.00,
        paymentStatus: 'PARTIAL',
        status: 'ISSUED',
        notes: 'Follow-up on overdue balance'
      },
      {
        id: 'inv-alx-201',
        invoiceNumber: 'INV-ALX-2026-001',
        branchId: 'branch-alx-02',
        customerId: 'cust-alx-01',
        salesRepresentativeId: 'rep-alx-01', // Salma Tarek
        invoiceDate: '2026-10-03T12:00:00Z',
        dueDate: '2026-11-17T12:00:00Z',
        grossAmount: 210000.00,
        discountAmount: 6300.00, // 3.0% discount
        taxAmount: 0.00,
        netAmount: 203700.00,
        cogsAmount: 172000.00,
        paidAmount: 150000.00,
        balanceDue: 53700.00,
        paymentStatus: 'PARTIAL',
        status: 'ISSUED',
        notes: 'Fathalla Gomla Market bi-weekly bulk'
      },
      {
        id: 'inv-alx-202',
        invoiceNumber: 'INV-ALX-2026-002',
        branchId: 'branch-alx-02',
        customerId: 'cust-alx-02',
        salesRepresentativeId: 'rep-alx-02', // Karim Nabil
        invoiceDate: '2026-05-20T14:00:00Z', // Severely overdue (>90 days overdue)
        dueDate: '2026-06-20T14:00:00Z',
        grossAmount: 145000.00,
        discountAmount: 4350.00,
        taxAmount: 0.00,
        netAmount: 140650.00,
        cogsAmount: 119500.00,
        paidAmount: 50000.00,
        balanceDue: 90650.00,
        paymentStatus: 'PARTIAL',
        status: 'ISSUED',
        notes: 'Mansheya overdue trading balance - collection notice sent'
      },
      {
        id: 'inv-mns-301',
        invoiceNumber: 'INV-MNS-2026-001',
        branchId: 'branch-mns-03',
        customerId: 'cust-mns-01',
        salesRepresentativeId: 'rep-mns-01', // Mostafa Ibrahim
        invoiceDate: '2026-10-05T10:00:00Z',
        dueDate: '2026-11-04T10:00:00Z',
        grossAmount: 160000.00,
        discountAmount: 3200.00,
        taxAmount: 0.00,
        netAmount: 156800.00,
        cogsAmount: 133200.00,
        paidAmount: 156800.00,
        balanceDue: 0.00,
        paymentStatus: 'PAID',
        status: 'ISSUED',
        notes: 'Delta Hypermarket prompt settlement'
      },
      {
        id: 'inv-mns-302',
        invoiceNumber: 'INV-MNS-2026-002',
        branchId: 'branch-mns-03',
        customerId: 'cust-mns-02',
        salesRepresentativeId: 'rep-mns-02', // Aya Sherif
        invoiceDate: '2026-09-20T11:00:00Z', // 1-30 days overdue
        dueDate: '2026-10-05T11:00:00Z',
        grossAmount: 115000.00,
        discountAmount: 2300.00,
        taxAmount: 0.00,
        netAmount: 112700.00,
        cogsAmount: 96000.00,
        paidAmount: 40000.00,
        balanceDue: 72700.00,
        paymentStatus: 'PARTIAL',
        status: 'ISSUED',
        notes: 'Al Baraka pending balance'
      }
    ];

    // 7. Sales Returns
    this.returns = [
      {
        id: 'ret-cai-01',
        returnNumber: 'RET-CAI-2026-001',
        salesInvoiceId: 'inv-cai-101',
        branchId: 'branch-cai-01',
        customerId: 'cust-cai-01',
        returnDate: '2026-10-06T15:00:00Z',
        totalAmount: 4800.00,
        totalCost: 4100.00,
        status: 'APPROVED',
        returnReason: 'DAMAGED_CARTON',
        stockDisposition: 'QUARANTINE_DAMAGED',
        notes: 'Damaged cartons during transit unload'
      },
      {
        id: 'ret-alx-01',
        returnNumber: 'RET-ALX-2026-001',
        salesInvoiceId: 'inv-alx-201',
        branchId: 'branch-alx-02',
        customerId: 'cust-alx-01',
        returnDate: '2026-10-07T14:30:00Z',
        totalAmount: 3200.00,
        totalCost: 2750.00,
        status: 'APPROVED',
        returnReason: 'CUSTOMER_REFUSAL',
        stockDisposition: 'RETURN_TO_STOCK',
        notes: 'Over-ordered stock returned intact to warehouse'
      }
    ];

    // 8. Customer Payments & Allocations
    this.payments = [
      { id: 'pay-01', paymentNumber: 'PAY-2026-001', customerId: 'cust-cai-01', branchId: 'branch-cai-01', paymentDate: '2026-10-05T14:00:00Z', amount: 100000.00, paymentMethod: 'BANK_TRANSFER', referenceNumber: 'CIB-TX-998811', unallocatedAmount: 0.00, notes: 'Direct bank transfer to Cairo account' },
      { id: 'pay-02', paymentNumber: 'PAY-2026-002', customerId: 'cust-cai-02', branchId: 'branch-cai-01', paymentDate: '2026-10-06T16:00:00Z', amount: 235200.00, paymentMethod: 'CHEQUE', referenceNumber: 'QNB-CHQ-120034', unallocatedAmount: 0.00, notes: 'Full settlement cheque cleared' },
      { id: 'pay-03', paymentNumber: 'PAY-2026-003', customerId: 'cust-alx-01', branchId: 'branch-alx-02', paymentDate: '2026-10-07T11:00:00Z', amount: 150000.00, paymentMethod: 'BANK_TRANSFER', referenceNumber: 'AAIB-ALX-4455', unallocatedAmount: 0.00, notes: 'Fathalla partial payment' },
      { id: 'pay-04', paymentNumber: 'PAY-2026-004', customerId: 'cust-mns-01', branchId: 'branch-mns-03', paymentDate: '2026-10-08T13:00:00Z', amount: 156800.00, paymentMethod: 'CASH', referenceNumber: 'CSH-MNS-1002', unallocatedAmount: 0.00, notes: 'Cash receipt at Mansoura branch' }
    ];

    // 9. Branch Expenses & Budgets
    this.expenses = [
      { id: 'exp-cai-01', branchId: 'branch-cai-01', categoryId: 'cat-transport', categoryName: 'Transportation & Fleet Fuel', expenseDate: '2026-10-03', amount: 14500.00, recipientOrVendor: 'Misr Petroleum Fleet Card', paymentMethod: 'BANK_TRANSFER', notes: 'Diesel fuel for Cairo delivery fleet', isOperatingExpense: true },
      { id: 'exp-cai-02', branchId: 'branch-cai-01', categoryId: 'cat-rent', categoryName: 'Warehouse Rent', expenseDate: '2026-10-01', amount: 35000.00, recipientOrVendor: 'Obour Logistic Parks', paymentMethod: 'BANK_TRANSFER', notes: 'October warehouse rent', isOperatingExpense: true },
      { id: 'exp-alx-01', branchId: 'branch-alx-02', categoryId: 'cat-transport', categoryName: 'Transportation & Fleet Fuel', expenseDate: '2026-10-04', amount: 12200.00, recipientOrVendor: 'TotalEnergies Fuel Depot', paymentMethod: 'BANK_TRANSFER', notes: 'Alexandria coastal route fuel', isOperatingExpense: true },
      { id: 'exp-alx-02', branchId: 'branch-alx-02', categoryId: 'cat-rent', categoryName: 'Warehouse Rent', expenseDate: '2026-10-01', amount: 28000.00, recipientOrVendor: 'Smouha Warehouses LLC', paymentMethod: 'BANK_TRANSFER', notes: 'October rent', isOperatingExpense: true },
      { id: 'exp-mns-01', branchId: 'branch-mns-03', categoryId: 'cat-transport', categoryName: 'Transportation & Fleet Fuel', expenseDate: '2026-10-05', amount: 9800.00, recipientOrVendor: 'Delta Distribution Logistics', paymentMethod: 'CASH', notes: 'Delta regional delivery vans', isOperatingExpense: true },
      { id: 'exp-mns-02', branchId: 'branch-mns-03', categoryId: 'cat-rent', categoryName: 'Warehouse Rent', expenseDate: '2026-10-01', amount: 19000.00, recipientOrVendor: 'Mansoura Real Estate Co', paymentMethod: 'BANK_TRANSFER', notes: 'October warehouse rent', isOperatingExpense: true }
    ];

    this.budgets = [
      { id: 'bgt-cai-01', branchId: 'branch-cai-01', categoryId: 'cat-transport', categoryName: 'Transportation & Fleet Fuel', periodYear: currentYear, periodMonth: currentMonth, budgetAmount: 18000.00 },
      { id: 'bgt-cai-02', branchId: 'branch-cai-01', categoryId: 'cat-rent', categoryName: 'Warehouse Rent', periodYear: currentYear, periodMonth: currentMonth, budgetAmount: 35000.00 },
      { id: 'bgt-alx-01', branchId: 'branch-alx-02', categoryId: 'cat-transport', categoryName: 'Transportation & Fleet Fuel', periodYear: currentYear, periodMonth: currentMonth, budgetAmount: 15000.00 },
      { id: 'bgt-alx-02', branchId: 'branch-alx-02', categoryId: 'cat-rent', categoryName: 'Warehouse Rent', periodYear: currentYear, periodMonth: currentMonth, budgetAmount: 28000.00 },
      { id: 'bgt-mns-01', branchId: 'branch-mns-03', categoryId: 'cat-transport', categoryName: 'Transportation & Fleet Fuel', periodYear: currentYear, periodMonth: currentMonth, budgetAmount: 12000.00 },
      { id: 'bgt-mns-02', branchId: 'branch-mns-03', categoryId: 'cat-rent', categoryName: 'Warehouse Rent', periodYear: currentYear, periodMonth: currentMonth, budgetAmount: 19000.00 }
    ];

    // 10. Commission Reconciliations
    // Recalculating based on policy:
    this.commissions = [
      {
        id: 'comm-cai-01',
        salesRepresentativeId: 'rep-cai-01', // Omar Khaled
        salesRepName: 'Omar Khaled',
        branchId: 'branch-cai-01',
        periodYear: currentYear,
        periodMonth: currentMonth,
        policyCode: 'POLICY_NET_AFTER_RETURNS',
        eligibleBaseAmount: 264950.00, // Gross (280,000) - Discounts (10,250) - Returns (4,800)
        appliedRate: 2.00,
        calculatedCommission: 5299.00, // 264,950 * 0.02
        recordedCommission: 5600.00, // Previously estimated on gross 280,000 * 0.02
        discrepancyAmount: -301.00, // Recorded was higher by 301 EGP due to ignoring discounts/returns
        status: 'DRAFT',
        notes: 'Discrepancy identified: previous estimate did not deduct 10,250 EGP discounts and 4,800 EGP returns'
      },
      {
        id: 'comm-cai-02',
        salesRepresentativeId: 'rep-cai-02', // Nour Hassan
        salesRepName: 'Nour Hassan',
        branchId: 'branch-cai-01',
        periodYear: currentYear,
        periodMonth: currentMonth,
        policyCode: 'POLICY_NET_AFTER_RETURNS',
        eligibleBaseAmount: 235200.00,
        appliedRate: 2.00,
        calculatedCommission: 4704.00,
        recordedCommission: 4800.00,
        discrepancyAmount: -96.00,
        status: 'APPROVED',
        notes: 'Reconciled and approved'
      },
      {
        id: 'comm-alx-01',
        salesRepresentativeId: 'rep-alx-01', // Salma Tarek
        salesRepName: 'Salma Tarek',
        branchId: 'branch-alx-02',
        periodYear: currentYear,
        periodMonth: currentMonth,
        policyCode: 'POLICY_NET_AFTER_RETURNS',
        eligibleBaseAmount: 200500.00,
        appliedRate: 2.00,
        calculatedCommission: 4010.00,
        recordedCommission: 4200.00,
        discrepancyAmount: -190.00,
        status: 'DRAFT',
        notes: 'Return deduction of 3,200 EGP accounted for'
      }
    ];

    // 11. Operational Alerts
    this.alerts = [
      {
        id: 'alt-01',
        branchId: 'branch-alx-02',
        alertType: 'OVERDUE_RECEIVABLES',
        severity: 'CRITICAL',
        title: 'Severe Overdue Balance (>90 Days)',
        description: 'Customer Al Mansheya Trading (Alexandria) has 90,650 EGP overdue by 62 days past terms.',
        isResolved: false,
        createdAt: '2026-10-10T08:00:00Z'
      },
      {
        id: 'alt-02',
        branchId: 'branch-cai-01',
        alertType: 'COMMISSION_DISCREPANCY',
        severity: 'WARNING',
        title: 'Commission Overstatement Identified',
        description: 'Omar Khaled recorded commission exceeds policy by 301 EGP due to unadjusted discount deductions.',
        isResolved: false,
        createdAt: '2026-10-10T09:15:00Z'
      },
      {
        id: 'alt-03',
        branchId: 'branch-mns-03',
        alertType: 'LOW_STOCK',
        severity: 'WARNING',
        title: 'Crystal Pure Corn Oil Reorder Threshold',
        description: 'Stock level at Mansoura central depot reached 140 cartons (reorder threshold is 150).',
        isResolved: false,
        createdAt: '2026-10-10T10:30:00Z'
      }
    ];

    // 12. Audit Logs
    this.auditLogs = [
      {
        id: 'aud-01',
        userId: 'user-ceo-01',
        username: 'ceo',
        branchId: null,
        action: 'LOGIN',
        entityName: 'AUTH_SESSION',
        details: { message: 'CEO logged in from executive terminal' },
        ipAddress: '192.168.1.10',
        timestamp: '2026-10-10T08:30:00Z'
      },
      {
        id: 'aud-02',
        userId: 'user-mgr-cai',
        username: 'manager.cairo',
        branchId: 'branch-cai-01',
        action: 'APPROVE',
        entityName: 'SALES_RETURN',
        entityId: 'ret-cai-01',
        details: { returnNumber: 'RET-CAI-2026-001', amount: 4800 },
        ipAddress: '192.168.2.15',
        timestamp: '2026-10-06T15:10:00Z'
      }
    ];
  }
}

export const memoryStore = new MemoryStore();
