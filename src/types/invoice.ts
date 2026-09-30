export interface SellerBank {
  name: string;
  accountNumber: string;
  ifsc: string;
}

export interface SellerInfo {
  businessName: string;
  address: string;
  mobile: string;
  email: string;
  gstin: string;
  bank: SellerBank;
}

export interface CustomerInfo {
  name: string;
  address: string;
  mobile: string;
  gstin: string;
}

export interface InvoiceItem {
  productName: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
  taxableAmount: number;
  gstAmount: number;
  amount: number;
}

export interface InvoiceDTO {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  seller: SellerInfo;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  cgstPercentage: number;
  cgstAmount: number;
  sgstPercentage: number;
  sgstAmount: number;
  totalGst: number;
  billAmount: number;
  grandTotal: number;
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDTO {
  _id: string;
  name: string;
  hsnSac: string;
  defaultRate: number;
  gstPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
