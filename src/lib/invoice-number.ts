import { Counter } from "@/models/Counter";
import { INVOICE_NUMBER_PREFIX, INVOICE_NUMBER_PAD } from "@/lib/company";

/** Atomically generate the next invoice number (e.g. MC-0001). */
export async function getNextInvoiceNumber(): Promise<string> {
  const doc = await Counter.findOneAndUpdate(
    { _id: "invoice" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  ).lean();

  const seq: number = doc?.sequence ?? 1;
  const padded = String(seq).padStart(INVOICE_NUMBER_PAD, "0");
  return `${INVOICE_NUMBER_PREFIX}-${padded}`;
}
