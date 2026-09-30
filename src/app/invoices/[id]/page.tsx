"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import ScaledSheet from "@/components/invoice/ScaledSheet";
import type { InvoiceDTO } from "@/types/invoice";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDTO | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.invoice) setInvoice(d.invoice);
        else setError(d.error || "Invoice not found");
      })
      .catch(() => setError("Failed to load invoice"));
  }, [id]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p>
        <Link href="/invoices" className="text-blue-700 hover:underline">← Back to invoices</Link>
      </div>
    );
  }

  if (!invoice) return <p>Loading invoice…</p>;

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center gap-2">
        <Link href="/invoices" className="rounded border px-4 py-2 hover:bg-slate-100">
          ← Back
        </Link>
        <Link
          href={`/invoices/${id}/edit`}
          className="rounded border px-4 py-2 hover:bg-slate-100"
        >
          Edit
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-700"
        >
          🖨 Print / Download PDF
        </button>
        <span className="text-xs text-slate-500">
          In print dialog choose “Save as PDF”, A4 portrait, margins Default.
        </span>
      </div>

      <div className="print-area overflow-x-auto bg-slate-300 p-3 sm:p-10">
        <ScaledSheet>
          <InvoiceTemplate invoice={invoice} />
        </ScaledSheet>
      </div>
    </div>
  );
}
