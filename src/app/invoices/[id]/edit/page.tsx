"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import type { CreateInvoiceInput } from "@/lib/validation";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [initial, setInitial] = useState<CreateInvoiceInput | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.invoice) {
          setError(d.error || "Invoice not found");
          return;
        }
        const inv = d.invoice;
        setInitial({
          customer: {
            name: inv.customer.name,
            address: inv.customer.address,
            mobile: inv.customer.mobile,
            gstin: inv.customer.gstin || "",
          },
          invoiceDate: new Date(inv.invoiceDate),
          items: inv.items.map((it: { productName: string; hsnSac: string; quantity: number; rate: number; gstPercentage: number }) => ({
            productName: it.productName,
            hsnSac: it.hsnSac || "",
            quantity: it.quantity,
            rate: it.rate,
            gstPercentage: it.gstPercentage,
          })),
          termsAndConditions: inv.termsAndConditions || "",
        });
      })
      .catch(() => setError("Failed to load invoice"));
  }, [id]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p>
        <Link href="/invoices" className="text-blue-700 hover:underline">← Back</Link>
      </div>
    );
  }
  if (!initial) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Edit Invoice</h1>
      <p className="text-xs text-slate-500">
        Invoice number and seller snapshot are immutable (financial record).
      </p>
      <InvoiceForm mode="edit" invoiceId={id} initialValues={initial} />
    </div>
  );
}
