"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR, formatDate } from "@/lib/format";

interface Recent {
  _id: string;
  invoiceNumber: string;
  customer: { name: string };
  invoiceDate: string;
  grandTotal: number;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalInvoices: 0, totalAmount: 0, recent: [] as Recent[] });
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setStats({
          totalInvoices: d.totalInvoices || 0,
          totalAmount: d.totalAmount || 0,
          recent: d.recent || [],
        });
        if (d.error) setDbError("MongoDB not connected — set MONGODB_URI in .env.local");
      })
      .catch(() => setDbError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-amber-500 px-4 py-2 font-bold text-slate-900 hover:bg-amber-400"
        >
          + Create Invoice
        </Link>
      </div>

      {dbError && (
        <div className="rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {dbError}. Copy <code>.env.example</code> to <code>.env.local</code> and set{" "}
          <code>MONGODB_URI</code>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Total Invoices</div>
          <div className="text-3xl font-extrabold">{loading ? "…" : stats.totalInvoices}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Business</div>
          <div className="font-bold">MADHAV CONSTRUCTION</div>
          <div className="text-xs text-slate-500">GSTIN: 24BCLPH5166C1ZT</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-bold">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm text-blue-700 hover:underline">
            View all →
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-slate-500">
            {loading ? "Loading…" : "No invoices yet. Create your first invoice."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="border p-2">Invoice No</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((r) => (
                  <tr key={r._id}>
                    <td className="border p-2">
                      <Link href={`/invoices/${r._id}`} className="text-blue-700 hover:underline">
                        {r.invoiceNumber}
                      </Link>
                    </td>
                    <td className="border p-2">{r.customer?.name}</td>
                    <td className="border p-2">{formatDate(r.invoiceDate)}</td>
                    <td className="border p-2 text-right">{formatINR(r.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
