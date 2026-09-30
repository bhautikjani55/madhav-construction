import { z } from "zod";

const mobileRegex = /^[0-9]{10}$/;
const gstinRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

export const invoiceItemSchema = z.object({
  productName: z.string().trim().min(1, "Product name is required").max(200),
  hsnSac: z.string().trim().max(20).default(""),
  quantity: z.coerce.number().positive("Quantity must be > 0").max(1000000),
  rate: z.coerce.number().min(0, "Rate must be >= 0").max(100000000),
  gstPercentage: z.coerce
    .number()
    .min(0, "GST% must be >= 0")
    .max(100, "GST% must be <= 100"),
});

export const createInvoiceSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, "Customer name is required").max(200),
    address: z.string().trim().min(1, "Customer address is required").max(500),
    mobile: z
      .string()
      .trim()
      .regex(mobileRegex, "Mobile must be 10 digits"),
    gstin: z
      .string()
      .trim()
      .max(20)
      .refine(
        (v) => v === "" || gstinRegex.test(v),
        "Invalid GSTIN format"
      )
      .default(""),
  }),
  invoiceDate: z.coerce.date(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required").max(100),
  termsAndConditions: z.string().max(2000).default(""),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  customer: createInvoiceSchema.shape.customer.partial().optional(),
  items: z.array(invoiceItemSchema).min(1).max(100).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  hsnSac: z.string().trim().max(20).default(""),
  defaultRate: z.coerce.number().min(0).max(100000000).default(0),
  gstPercentage: z.coerce.number().min(0).max(100).default(18),
  isActive: z.boolean().default(true),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ProductInput = z.infer<typeof productSchema>;
