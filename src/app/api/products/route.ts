import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const activeOnly = searchParams.get("active") === "true";

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.name = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }
    if (activeOnly) filter.isActive = true;

    const products = await Product.find(filter).sort({ name: 1 }).limit(200).lean();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const product = await Product.create(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
