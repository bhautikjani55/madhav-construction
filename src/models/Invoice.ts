import mongoose, { Schema, Document } from "mongoose";

export interface InvoiceItemSub {
  productName: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
  taxableAmount: number;
  gstAmount: number;
  amount: number;
}

export interface InvoiceDoc extends Document {
  invoiceNumber: string;
  invoiceDate: Date;
  seller: {
    businessName: string;
    address: string;
    mobile: string;
    email: string;
    gstin: string;
    bank: { name: string; accountNumber: string; ifsc: string };
  };
  customer: { name: string; address: string; mobile: string; gstin: string };
  items: InvoiceItemSub[];
  subtotal: number;
  cgstPercentage: number;
  cgstAmount: number;
  sgstPercentage: number;
  sgstAmount: number;
  totalGst: number;
  billAmount: number;
  grandTotal: number;
  termsAndConditions: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<InvoiceItemSub>(
  {
    productName: { type: String, required: true, trim: true },
    hsnSac: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    gstPercentage: { type: Number, required: true, min: 0, max: 100 },
    taxableAmount: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<InvoiceDoc>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    seller: {
      businessName: { type: String, required: true },
      address: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String, required: true },
      gstin: { type: String, required: true },
      bank: {
        name: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifsc: { type: String, required: true },
      },
    },
    customer: {
      name: { type: String, required: true, trim: true },
      address: { type: String, required: true },
      mobile: { type: String, required: true },
      gstin: { type: String, default: "" },
    },
    items: { type: [ItemSchema], required: true, validate: [(v: unknown[]) => v.length > 0, "At least one item required"] },
    subtotal: { type: Number, required: true },
    cgstPercentage: { type: Number, required: true, default: 0 },
    cgstAmount: { type: Number, required: true, default: 0 },
    sgstPercentage: { type: Number, required: true, default: 0 },
    sgstAmount: { type: Number, required: true, default: 0 },
    totalGst: { type: Number, required: true },
    billAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    termsAndConditions: { type: String, default: "" },
  },
  { timestamps: true }
);

InvoiceSchema.index({ "customer.name": 1 });
InvoiceSchema.index({ "customer.mobile": 1 });
InvoiceSchema.index({ invoiceDate: -1 });

export const Invoice =
  (mongoose.models.Invoice as mongoose.Model<InvoiceDoc>) ||
  mongoose.model<InvoiceDoc>("Invoice", InvoiceSchema);
