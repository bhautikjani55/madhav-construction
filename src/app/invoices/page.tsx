"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR, formatDate } from "@/lib/format";

interface Row {
  _id: string;
  invoiceNumber: string;
  customer: { name: string; mobile: string };
  invoiceDate: string;
  grandTotal: number;
  createdAt: string;
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load(p = 1, q = search) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/invoices?search=${encodeURIComponent(q)}&page=${p}&limit=10`
      );
      const d = await res.json();
      setRows(d.invoices || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
      setPage(d.page || 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string, no: string) {
    if (!confirm(`Delete invoice ${no}? This cannot be undone.`)) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    load(page, search);
  }

  return (
    <div className="flex min-h-[calc(100vh-220px)] flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Invoice History ({total})</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-amber-500 px-4 py-2 font-bold text-slate-900 hover:bg-amber-400"
        >
          + New Invoice
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1, search)}
          placeholder="Search by invoice no, customer name, mobile…"
          className="w-full max-w-md rounded border px-3 py-2"
        />
        <button
          onClick={() => load(1, search)}
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border p-2">Invoice Number</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Date</th>
              <th className="border p-2 text-right">Grand Total</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">No invoices found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id}>
                  <td className="border p-2 font-semibold">{r.invoiceNumber}</td>
                  <td className="border p-2">
                    {r.customer?.name}
                    <div className="text-xs text-slate-500">{r.customer?.mobile}</div>
                  </td>
                  <td className="border p-2">{formatDate(r.invoiceDate)}</td>
                  <td className="border p-2 text-right">{formatINR(r.grandTotal)}</td>
                  <td className="border p-2">
                    <div className="flex gap-1">
                      <Link
                        href={`/invoices/${r._id}`}
                        className="rounded bg-blue-100 px-2 py-1 text-blue-800 hover:bg-blue-200"
                      >
                        View
                      </Link>
                      <Link
                        href={`/invoices/${r._id}/edit`}
                        className="rounded bg-slate-200 px-2 py-1 hover:bg-slate-300"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(r._id, r.invoiceNumber)}
                        className="rounded bg-red-100 px-2 py-1 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 mt-auto flex items-center gap-2 bg-[var(--background)] py-3 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => load(page - 1, search)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          ← Prev
        </button>
        <span>Page {page} of {pages}</span>
        <button
          disabled={page >= pages}
          onClick={() => load(page + 1, search)}
          className="rounded border px-3 py-1 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
