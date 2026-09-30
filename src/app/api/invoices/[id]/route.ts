import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";
import { updateInvoiceSchema } from "@/lib/validation";
import { calculateInvoiceTotals } from "@/lib/invoice-calculation";

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
    }
    await connectDB();
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("GET /api/invoices/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
    }
    await connectDB();
    const existing = await Invoice.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    // Merge customer (seller + invoiceNumber stay immutable)
    if (data.customer) {
      const current =
        typeof (existing.customer as unknown as { toObject?: () => object })
          .toObject === "function"
          ? (
              existing.customer as unknown as { toObject: () => object }
            ).toObject()
          : (existing.customer as unknown as object);
      existing.customer = {
        ...(current as object),
        ...data.customer,
      } as typeof existing.customer;
    }
    if (data.invoiceDate) existing.invoiceDate = new Date(data.invoiceDate);
    if (typeof data.termsAndConditions === "string")
      existing.termsAndConditions = data.termsAndConditions;

    // Recalculate if items supplied
    if (data.items) {
      const totals = calculateInvoiceTotals(data.items);
      existing.items = data.items.map((it, i) => ({
        productName: it.productName,
        hsnSac: it.hsnSac || "",
        quantity: Number(it.quantity),
        rate: Number(it.rate),
        gstPercentage: Number(it.gstPercentage),
        taxableAmount: totals.items[i].taxableAmount,
        gstAmount: totals.items[i].gstAmount,
        amount: totals.items[i].amount,
      })) as typeof existing.items;
      existing.subtotal = totals.subtotal;
      existing.cgstPercentage = totals.cgstPercentage;
      existing.cgstAmount = totals.cgstAmount;
      existing.sgstPercentage = totals.sgstPercentage;
      existing.sgstAmount = totals.sgstAmount;
      existing.totalGst = totals.totalGst;
      existing.billAmount = totals.billAmount;
      existing.grandTotal = totals.grandTotal;
    }

    // NOTE: invoiceNumber + seller snapshot intentionally immutable (financial record).
    await existing.save();
    return NextResponse.json({ invoice: existing });
  } catch (err) {
    console.error("PUT /api/invoices/[id] error:", err);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
    }
    await connectDB();
    const deleted = await Invoice.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/invoices/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
