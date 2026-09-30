import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";
import { createInvoiceSchema } from "@/lib/validation";
import { calculateInvoiceTotals } from "@/lib/invoice-calculation";
import { getNextInvoiceNumber } from "@/lib/invoice-number";
import { COMPANY_INFO, DEFAULT_TERMS } from "@/lib/company";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { invoiceNumber: rx },
        { "customer.name": rx },
        { "customer.mobile": rx },
      ];
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Invoice.countDocuments(filter),
    ]);

    return NextResponse.json({
      invoices,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("GET /api/invoices error:", err);
    const msg =
      err instanceof Error && err.message.includes("MONGODB_URI")
        ? "Database not configured. Set MONGODB_URI in .env.local"
        : "Failed to fetch invoices";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { customer, invoiceDate, items, termsAndConditions } = parsed.data;

    // Backend recalculation — never trust frontend totals
    const totals = calculateInvoiceTotals(items);
    const calcItems = items.map((it, i) => ({
      productName: it.productName,
      hsnSac: it.hsnSac || "",
      quantity: Number(it.quantity),
      rate: Number(it.rate),
      gstPercentage: Number(it.gstPercentage),
      taxableAmount: totals.items[i].taxableAmount,
      gstAmount: totals.items[i].gstAmount,
      amount: totals.items[i].amount,
    }));

    // Atomic invoice number generation
    const invoiceNumber = await getNextInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      seller: {
        businessName: COMPANY_INFO.businessName,
        address: COMPANY_INFO.address,
        mobile: COMPANY_INFO.mobile,
        email: COMPANY_INFO.email,
        gstin: COMPANY_INFO.gstin,
        bank: {
          name: COMPANY_INFO.bank.name,
          accountNumber: COMPANY_INFO.bank.accountNumber,
          ifsc: COMPANY_INFO.bank.ifsc,
        },
      },
      customer: {
        name: customer.name,
        address: customer.address,
        mobile: customer.mobile,
        gstin: customer.gstin || "",
      },
      items: calcItems,
      subtotal: totals.subtotal,
      cgstPercentage: totals.cgstPercentage,
      cgstAmount: totals.cgstAmount,
      sgstPercentage: totals.sgstPercentage,
      sgstAmount: totals.sgstAmount,
      totalGst: totals.totalGst,
      billAmount: totals.billAmount,
      grandTotal: totals.grandTotal,
      termsAndConditions: termsAndConditions || DEFAULT_TERMS,
    });

    return NextResponse.json(
      { invoice, id: invoice._id, invoiceNumber },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("POST /api/invoices error:", err);
    if (
      err instanceof Error &&
      err.message.includes("MONGODB_URI")
    ) {
      return NextResponse.json(
        { error: "Database not configured. Set MONGODB_URI in .env.local" },
        { status: 500 }
      );
    }
    const e = err as { code?: number };
    if (e?.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate invoice number. Please retry." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
