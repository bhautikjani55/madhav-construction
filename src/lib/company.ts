/**
 * Default seller / company configuration.
 * Used as a snapshot when a new invoice is created.
 * Source of truth = reference PDF.
 */
export const COMPANY_INFO = {
  businessName: "MADHAV CONSTRUCTION",
  address: "SHILALEKH, PARVAT PATIYA CANAL ROAD, SURAT GUJARAT",
  mobile: "9726098802",
  email: "madhav.construction2026@gmail.com",
  gstin: "24BCLPH5166C1ZT",
  bank: {
    name: "ICICI BANK",
    accountNumber: "058405009587",
    ifsc: "ICIC0000584",
  },
} as const;

export const INVOICE_NUMBER_PREFIX = "MC";
export const INVOICE_NUMBER_PAD = 4;

export const DEFAULT_TERMS =
  "1. Goods once sold will not be taken back.\n2. Payment due within 15 days from invoice date.\n3. Interest @18% p.a. will be charged on delayed payments.\n4. Subject to Surat jurisdiction.";
