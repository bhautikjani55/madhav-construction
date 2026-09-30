/** Centralised money-safe calculation helpers (2-decimal rounding). */

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface CalcItemInput {
  quantity: number;
  rate: number;
  gstPercentage: number;
}

export interface CalcItemResult {
  taxableAmount: number;
  gstAmount: number;
  amount: number;
}

export function calculateItem(input: CalcItemInput): CalcItemResult {
  const qty = Number(input.quantity) || 0;
  const rate = Number(input.rate) || 0;
  const gst = Number(input.gstPercentage) || 0;

  const taxableAmount = round2(qty * rate);
  const gstAmount = round2((taxableAmount * gst) / 100);
  const amount = round2(taxableAmount + gstAmount);

  return { taxableAmount, gstAmount, amount };
}

export interface InvoiceTotals {
  subtotal: number;
  cgstPercentage: number;
  cgstAmount: number;
  sgstPercentage: number;
  sgstAmount: number;
  totalGst: number;
  billAmount: number;
  grandTotal: number;
}

export function calculateInvoiceTotals(
  items: CalcItemInput[]
): InvoiceTotals & { items: CalcItemResult[] } {
  const calculatedItems = items.map((it) => calculateItem(it));

  const subtotal = round2(
    calculatedItems.reduce((s, it) => s + it.taxableAmount, 0)
  );
  const totalGst = round2(
    calculatedItems.reduce((s, it) => s + it.gstAmount, 0)
  );

  const cgstAmount = round2(totalGst / 2);
  // Avoid 0.01 drift: sgst = total - cgst
  const sgstAmount = round2(totalGst - cgstAmount);

  let cgstPercentage = 0;
  let sgstPercentage = 0;
  if (subtotal > 0 && totalGst > 0) {
    const effectiveRate = (totalGst / subtotal) * 100;
    cgstPercentage = round2(effectiveRate / 2);
    sgstPercentage = round2(effectiveRate / 2);
  } else if (items.length > 0) {
    // Fallback: if all items share the same GST%, use half of it
    const first = Number(items[0]?.gstPercentage) || 0;
    const allSame = items.every(
      (it) => Number(it.gstPercentage) === first
    );
    if (allSame) {
      cgstPercentage = round2(first / 2);
      sgstPercentage = round2(first / 2);
    }
  }

  const billAmount = round2(subtotal + totalGst);
  const grandTotal = Math.round(billAmount);

  return {
    items: calculatedItems,
    subtotal,
    cgstPercentage,
    cgstAmount,
    sgstPercentage,
    sgstAmount,
    totalGst,
    billAmount,
    grandTotal,
  };
}
