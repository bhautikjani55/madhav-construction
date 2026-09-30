"use client";

import { useEffect, useState } from "react";
import type { ProductDTO } from "@/types/invoice";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [form, setForm] = useState({ name: "", hsnSac: "", defaultRate: 0, gstPercentage: 18 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/products");
    const d = await res.json();
    setProducts(d.products || []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isActive: true }),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error || "Save failed");
      return;
    }
    setForm({ name: "", hsnSac: "", defaultRate: 0, gstPercentage: 18 });
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(p: ProductDTO) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      hsnSac: p.hsnSac || "",
      defaultRate: p.defaultRate ?? 0,
      gstPercentage: p.gstPercentage ?? 18,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Products</h1>
      <p className="text-sm text-slate-500">
        Saved products auto-fill name, HSN/SAC, rate and GST% in the invoice form.
        Invoices store their own snapshot, so changing a product never alters old invoices.
      </p>

      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="e.g. Cement"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">HSN/SAC</label>
            <input
              value={form.hsnSac}
              onChange={(e) => setForm({ ...form, hsnSac: e.target.value })}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="e.g. 2523"
            />
          </div>
          <div>
            <label className="text-sm font-medium">GST %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.gstPercentage}
              onChange={(e) => setForm({ ...form, gstPercentage: Number(e.target.value) })}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default Rate</label>
            <input
              type="number"
              min={0}
              step="any"
              value={form.defaultRate}
              onChange={(e) => setForm({ ...form, defaultRate: Number(e.target.value) })}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700">
            {editingId ? "Update" : "Add"} Product
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", hsnSac: "", defaultRate: 0, gstPercentage: 18 });
              }}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border p-2">Name</th>
              <th className="border p-2">HSN/SAC</th>
              <th className="border p-2 text-right">Rate</th>
              <th className="border p-2">GST%</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td className="border p-2 font-semibold">{p.name}</td>
                  <td className="border p-2">{p.hsnSac || "-"}</td>
                  <td className="border p-2 text-right">₹{Number(p.defaultRate).toFixed(2)}</td>
                  <td className="border p-2">{p.gstPercentage}%</td>
                  <td className="border p-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="rounded bg-slate-200 px-2 py-1 hover:bg-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
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
    </div>
  );
}
