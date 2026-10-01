"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvoiceSchema, type CreateInvoiceInput } from "@/lib/validation";
import { calculateInvoiceTotals, round2 } from "@/lib/invoice-calculation";
import { COMPANY_INFO, DEFAULT_TERMS } from "@/lib/company";
import { formatINR, formatDateInput } from "@/lib/format";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import ScaledSheet from "@/components/invoice/ScaledSheet";
import type { InvoiceDTO, ProductDTO } from "@/types/invoice";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const fn = () => setMobile(q.matches);
    fn();
    q.addEventListener("change", fn);
    return () => q.removeEventListener("change", fn);
  }, []);
  return mobile;
}

type Props =
  | { mode: "create" }
  | { mode: "edit"; invoiceId: string; initialValues: CreateInvoiceInput };

const emptyItem = { productName: "", hsnSac: "", quantity: 1, rate: 0, gstPercentage: 18 };

export default function InvoiceForm(props: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const defaultValues: CreateInvoiceInput =
    props.mode === "edit"
      ? props.initialValues
      : {
          customer: { name: "", address: "", mobile: "", gstin: "" },
          invoiceDate: new Date(),
          items: [{ ...emptyItem }],
          termsAndConditions: DEFAULT_TERMS,
        };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateInvoiceInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createInvoiceSchema) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: defaultValues as any,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const isMobile = useIsMobile();

  const watchedItems = useWatch({ control, name: "items" });
  const watchedCustomer = useWatch({ control, name: "customer" });
  const watchedDate = useWatch({ control, name: "invoiceDate" });
  const watchedTerms = useWatch({ control, name: "termsAndConditions" });

  useEffect(() => {
    fetch("/api/products?active=true")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  const totals = useMemo(() => {
    const safe = (watchedItems || []).map((it) => ({
      quantity: Number(it?.quantity) || 0,
      rate: Number(it?.rate) || 0,
      gstPercentage: Number(it?.gstPercentage) || 0,
    }));
    return calculateInvoiceTotals(safe);
  }, [watchedItems]);

  function applyProduct(index: number, productId: string) {
    if (!productId) return;
    const p = products.find((x) => x._id === productId);
    if (!p) return;
    setValue(`items.${index}.productName`, p.name, { shouldValidate: true });
    setValue(`items.${index}.hsnSac`, p.hsnSac || "", { shouldValidate: true });
    setValue(`items.${index}.rate`, p.defaultRate ?? 0, { shouldValidate: true });
    setValue(`items.${index}.gstPercentage`, p.gstPercentage ?? 18, {
      shouldValidate: true,
    });
  }

  const previewInvoice: InvoiceDTO = useMemo(() => {
    const items = (watchedItems || []).map((it, i) => ({
      productName: it?.productName || "",
      hsnSac: it?.hsnSac || "",
      quantity: Number(it?.quantity) || 0,
      rate: Number(it?.rate) || 0,
      gstPercentage: Number(it?.gstPercentage) || 0,
      taxableAmount: totals.items[i]?.taxableAmount ?? round2((Number(it?.quantity) || 0) * (Number(it?.rate) || 0)),
      gstAmount: totals.items[i]?.gstAmount ?? 0,
      amount: totals.items[i]?.amount ?? 0,
    }));
    return {
      _id: "preview",
      invoiceNumber: props.mode === "edit" ? "EDIT-PREVIEW" : "MC-PREVIEW",
      invoiceDate:
        watchedDate instanceof Date
          ? watchedDate.toISOString()
          : new Date(watchedDate as unknown as string).toISOString(),
      seller: {
        businessName: COMPANY_INFO.businessName,
        address: COMPANY_INFO.address,
        mobile: COMPANY_INFO.mobile,
        email: COMPANY_INFO.email,
        gstin: COMPANY_INFO.gstin,
        bank: { ...COMPANY_INFO.bank },
      },
      customer: {
        name: watchedCustomer?.name || "",
        address: watchedCustomer?.address || "",
        mobile: watchedCustomer?.mobile || "",
        gstin: watchedCustomer?.gstin || "",
      },
      items,
      subtotal: totals.subtotal,
      cgstPercentage: totals.cgstPercentage,
      cgstAmount: totals.cgstAmount,
      sgstPercentage: totals.sgstPercentage,
      sgstAmount: totals.sgstAmount,
      totalGst: totals.totalGst,
      billAmount: totals.billAmount,
      grandTotal: totals.grandTotal,
      termsAndConditions: watchedTerms || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [watchedItems, watchedCustomer, watchedDate, watchedTerms, totals, props.mode]);

  async function onSubmit(data: CreateInvoiceInput) {
    setSaving(true);
    setServerError("");
    try {
      const url =
        props.mode === "edit" ? `/api/invoices/${props.invoiceId}` : "/api/invoices";
      const method = props.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          invoiceDate:
            data.invoiceDate instanceof Date
              ? data.invoiceDate.toISOString()
              : data.invoiceDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const detail =
          json?.details?.fieldErrors || json?.details?.formErrors || json?.error;
        setServerError(
          typeof detail === "string" ? detail : JSON.stringify(detail || json?.error || "Save failed")
        );
        return;
      }
      const id = json.id || json.invoice?._id || (props.mode === "edit" ? props.invoiceId : "");
      router.push(`/invoices/${id}`);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {serverError && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* CUSTOMER */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">Customer Details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Customer Name *</label>
            <input
              {...register("customer.name")}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="e.g. Ramesh Patel"
            />
            {errors.customer?.name && (
              <p className="text-xs text-red-600">{errors.customer.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Mobile Number *</label>
            <input
              {...register("customer.mobile")}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="10-digit mobile"
              maxLength={10}
            />
            {errors.customer?.mobile && (
              <p className="text-xs text-red-600">{errors.customer.mobile.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Address *</label>
            <textarea
              {...register("customer.address")}
              className="mt-1 w-full rounded border px-3 py-2"
              rows={2}
              placeholder="Customer full address"
            />
            {errors.customer?.address && (
              <p className="text-xs text-red-600">{errors.customer.address.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">GSTIN (optional)</label>
            <input
              {...register("customer.gstin")}
              className="mt-1 w-full rounded border px-3 py-2 uppercase"
              placeholder="e.g. 24ABCDE1234F1Z5"
            />
            {errors.customer?.gstin && (
              <p className="text-xs text-red-600">{errors.customer.gstin.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Invoice Date *</label>
            <input
              type="date"
              {...register("invoiceDate")}
              defaultValue={formatDateInput(
                props.mode === "edit" ? props.initialValues.invoiceDate : new Date()
              )}
              className="mt-1 w-full rounded border px-3 py-2"
            />
            {errors.invoiceDate && (
              <p className="text-xs text-red-600">{String(errors.invoiceDate.message)}</p>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Invoice number is generated automatically by the backend (MC-0001, MC-0002, …).
        </p>
      </section>

      {/* ITEMS */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Products / Items</h2>
          <button
            type="button"
            onClick={() => append({ ...emptyItem })}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            + Add Product
          </button>
        </div>

        {/* Mobile: stacked product cards */}
        {isMobile ? (
          <div className="space-y-3">
            {fields.map((f, i) => {
              const qty = Number(watchedItems?.[i]?.quantity) || 0;
              const rate = Number(watchedItems?.[i]?.rate) || 0;
              const amt = round2(qty * rate);
              return (
                <div key={f.id} className="rounded-lg border bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold">Item {i + 1}</span>
                    <button
                      type="button"
                      disabled={fields.length <= 1}
                      onClick={() => remove(i)}
                      className="rounded bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200 disabled:opacity-40"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <select
                    className="mb-2 w-full rounded border bg-white px-2 py-2 text-sm"
                    defaultValue=""
                    onChange={(e) => applyProduct(i, e.target.value)}
                  >
                    <option value="">— Select saved product —</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} • ₹{p.defaultRate} • {p.gstPercentage}%
                      </option>
                    ))}
                  </select>
                  <label className="text-xs font-medium text-slate-600">Product name *</label>
                  <input
                    {...register(`items.${i}.productName`)}
                    className="mb-2 mt-0.5 w-full rounded border bg-white px-3 py-2"
                    placeholder="Product name"
                  />
                  {errors.items?.[i]?.productName && (
                    <p className="mb-1 text-xs text-red-600">
                      {errors.items[i]?.productName?.message}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600">HSN/SAC</label>
                      <input
                        {...register(`items.${i}.hsnSac`)}
                        className="mt-0.5 w-full rounded border bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Qty *</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        {...register(`items.${i}.quantity`)}
                        className="mt-0.5 w-full rounded border bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Rate *</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        {...register(`items.${i}.rate`)}
                        className="mt-0.5 w-full rounded border bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">GST% *</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        {...register(`items.${i}.gstPercentage`)}
                        className="mt-0.5 w-full rounded border bg-white px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right font-bold">{formatINR(amt)}</div>
                </div>
              );
            })}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2">Sr</th>
                <th className="border p-2">Product (select / type)</th>
                <th className="border p-2">HSN/SAC</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Rate</th>
                <th className="border p-2">GST%</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">—</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const qty = Number(watchedItems?.[i]?.quantity) || 0;
                const rate = Number(watchedItems?.[i]?.rate) || 0;
                const amt = round2(qty * rate);
                return (
                  <tr key={f.id}>
                    <td className="border p-1 text-center">{i + 1}</td>
                    <td className="border p-1">
                      <select
                        className="mb-1 w-full rounded border px-2 py-1 text-xs"
                        defaultValue=""
                        onChange={(e) => applyProduct(i, e.target.value)}
                      >
                        <option value="">— Select saved product —</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} • ₹{p.defaultRate} • {p.gstPercentage}%
                          </option>
                        ))}
                      </select>
                      <input
                        {...register(`items.${i}.productName`)}
                        className="w-full rounded border px-2 py-1"
                        placeholder="Product name"
                      />
                      {errors.items?.[i]?.productName && (
                        <p className="text-xs text-red-600">
                          {errors.items[i]?.productName?.message}
                        </p>
                      )}
                    </td>
                    <td className="border p-1">
                      <input
                        {...register(`items.${i}.hsnSac`)}
                        className="w-24 rounded border px-2 py-1"
                      />
                    </td>
                    <td className="border p-1">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        {...register(`items.${i}.quantity`)}
                        className="w-20 rounded border px-2 py-1"
                      />
                    </td>
                    <td className="border p-1">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        {...register(`items.${i}.rate`)}
                        className="w-24 rounded border px-2 py-1"
                      />
                    </td>
                    <td className="border p-1">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        {...register(`items.${i}.gstPercentage`)}
                        className="w-20 rounded border px-2 py-1"
                      />
                    </td>
                    <td className="border p-1 text-right font-semibold">
                      {formatINR(amt)}
                    </td>
                    <td className="border p-1 text-center">
                      <button
                        type="button"
                        disabled={fields.length <= 1}
                        onClick={() => remove(i)}
                        className="rounded bg-red-100 px-2 py-1 text-red-700 hover:bg-red-200 disabled:opacity-40"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
        {errors.items && (
          <p className="mt-2 text-xs text-red-600">{String(errors.items.message ?? "Check items")}</p>
        )}

        {/* Live summary */}
        <div className="mt-4 ml-auto max-w-sm space-y-1 rounded border bg-slate-50 p-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
          <div className="flex justify-between"><span>CGST ({totals.cgstPercentage}%)</span><span>{formatINR(totals.cgstAmount)}</span></div>
          <div className="flex justify-between"><span>SGST ({totals.sgstPercentage}%)</span><span>{formatINR(totals.sgstAmount)}</span></div>
          <div className="flex justify-between"><span>Total GST</span><span>{formatINR(totals.totalGst)}</span></div>
          <div className="flex justify-between border-t pt-1 text-base"><span>Grand Total</span><strong>{formatINR(totals.grandTotal)}</strong></div>
        </div>

        <div className="mt-3">
          <label className="text-sm font-medium">Terms & Conditions</label>
          <textarea
            {...register("termsAndConditions")}
            rows={3}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="hidden rounded border px-4 py-2 font-semibold hover:bg-slate-100 md:inline-block"
        >
          {showPreview ? "Hide Preview" : "Preview Invoice"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-amber-500 px-6 py-2 font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? "Saving…" : props.mode === "edit" ? "Update Invoice" : "Save Invoice"}
        </button>
      </div>

      {showPreview && (
        <section className="hidden rounded-lg border bg-slate-100 p-3 sm:p-4 md:block">
          <h2 className="mb-2 font-bold">Preview (same template as saved invoice)</h2>
          <div className="overflow-x-auto bg-slate-300 p-3 sm:p-6">
            <ScaledSheet>
              <InvoiceTemplate invoice={previewInvoice} />
            </ScaledSheet>
          </div>
        </section>
      )}
    </form>
  );
}
