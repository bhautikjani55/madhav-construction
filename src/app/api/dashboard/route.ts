import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";

export async function GET() {
  try {
    await connectDB();
    const [count, agg, recent] = await Promise.all([
      Invoice.countDocuments(),
      Invoice.aggregate([
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Invoice.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("invoiceNumber customer invoiceDate grandTotal createdAt")
        .lean(),
    ]);
    const totalAmount = agg?.[0]?.total ?? 0;
    return NextResponse.json({
      totalInvoices: count,
      totalAmount,
      recent,
    });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json(
      { totalInvoices: 0, totalAmount: 0, recent: [], error: "DB not configured" },
      { status: 200 }
    );
  }
}
