import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
  formatCurrency: (amount: number) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Brand & App
    appName: 'نظام إدارة وتوزيع السلع الاستهلاكية بمصر',
    appSubTitle: 'نظام تخطيط موارد المؤسسات والتحليلات المركزية',
    cairoBranch: 'فرع القاهرة',
    alexBranch: 'فرع الإسكندرية',
    mansouraBranch: 'فرع المنصورة',
    allBranches: 'كافة الفروع الموحدة',
    allEgypt: 'جمهورية مصر العربية',

    // Nav
    navCeoOverview: 'نظرة عامة تنفيذية (CEO)',
    navBranchComparison: 'مقارنة أداء الفروع',
    navSalesReps: 'المندوبون والمستهدفات',
    navCommissions: 'تسوية العمولات',
    navProductProfit: 'ربحية المنتجات والمخزون',
    navInventory: 'المخزون وحركة المستودعات',
    navReceivables: 'العملاء والتحصيلات',
    navExpenses: 'المصروفات والتسليمات',
    navDataQuality: 'جودة البيانات والتنبيهات',
    navInvoices: 'فواتير المبيعات',
    navPayments: 'التحصيلات والسدادات',
    navImport: 'استيراد إكسل و CSV',
    navAudit: 'سجل الرقابة والأمان',
    logout: 'تسجيل الخروج',

    // KPIs
    grossSales: 'إجمالي المبيعات',
    netSales: 'صافي المبيعات',
    cogs: 'تكلفة البضاعة المباعة (COGS)',
    grossProfit: 'مجمل الربح',
    grossProfitMargin: 'هامش مجمل الربح',
    operatingExpenses: 'المصروفات التشغيلية',
    operatingProfit: 'الربح التشغيلي',
    operatingMargin: 'هامش الربح التشغيلي',
    discounts: 'الخصومات الممنوحة',
    discountRate: 'معدل الخصم',
    returns: 'مردودات المبيعات',
    returnRate: 'معدل المردودات',
    receivables: 'المديونيات القائمة',
    inventoryValue: 'قيمة المخزون',
    monthlyTarget: 'المستهدف الشهري',
    achievementRate: 'نسبة الإنجاز',

    // General
    status: 'الحالة',
    date: 'التاريخ',
    actions: 'الإجراءات',
    customer: 'العميل',
    representative: 'المندوب',
    branch: 'الفرع',
    amount: 'المبلغ',
    save: 'حفظ',
    cancel: 'إلغاء',
    createNew: 'إضافة جديد',
    export: 'تصدير',
    refresh: 'تحديث البيانات',
    search: 'بحث...',
    currency: 'ج.م'
  },
  en: {
    // Brand & App
    appName: 'Egypt FMCG Distribution ERP',
    appSubTitle: 'Centralized Multi-Branch Enterprise Analytics',
    cairoBranch: 'Cairo Branch',
    alexBranch: 'Alexandria Branch',
    mansouraBranch: 'Mansoura Branch',
    allBranches: 'All Branches (Consolidated)',
    allEgypt: 'Arab Republic of Egypt',

    // Nav
    navCeoOverview: 'Executive Overview (CEO)',
    navBranchComparison: 'Branch Comparison',
    navSalesReps: 'Sales Reps & Targets',
    navCommissions: 'Commissions Engine',
    navProductProfit: 'Product Profitability',
    navInventory: 'Inventory & Warehouses',
    navReceivables: 'Customers & Receivables',
    navExpenses: 'Expenses & Deliveries',
    navDataQuality: 'Data Quality & Alerts',
    navInvoices: 'Sales Invoices',
    navPayments: 'Customer Payments',
    navImport: 'Excel & CSV Import',
    navAudit: 'Audit Logs & Security',
    logout: 'Sign Out',

    // KPIs
    grossSales: 'Gross Sales',
    netSales: 'Net Sales',
    cogs: 'Cost of Goods Sold (COGS)',
    grossProfit: 'Gross Profit',
    grossProfitMargin: 'Gross Profit Margin',
    operatingExpenses: 'Operating Expenses (OPEX)',
    operatingProfit: 'Operating Profit',
    operatingMargin: 'Operating Margin',
    discounts: 'Discounts',
    discountRate: 'Discount Rate',
    returns: 'Sales Returns',
    returnRate: 'Return Rate',
    receivables: 'Outstanding Receivables',
    inventoryValue: 'Inventory Valuation',
    monthlyTarget: 'Monthly Target',
    achievementRate: 'Target Achievement',

    // General
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    customer: 'Customer',
    representative: 'Representative',
    branch: 'Branch',
    amount: 'Amount',
    save: 'Save',
    cancel: 'Cancel',
    createNew: 'Create New',
    export: 'Export',
    refresh: 'Refresh Data',
    search: 'Search...',
    currency: 'EGP'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('erp_lang') as Language) || 'ar'
  );

  const setLanguage = (lang: Language) => {
    localStorage.setItem('erp_lang', lang);
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const formatCurrency = (amount: number): string => {
    const formatted = Math.round(amount).toLocaleString();
    return language === 'ar' ? `${formatted} ج.م` : `${formatted} EGP`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRtl: language === 'ar',
        formatCurrency
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
