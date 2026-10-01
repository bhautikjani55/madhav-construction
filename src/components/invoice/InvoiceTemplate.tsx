import type { InvoiceDTO } from "@/types/invoice";
import { amountInWords, formatDate } from "@/lib/format";

function fmt(n: number): string {
  const v = Number(n) || 0;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

/** Blank rows so the items area stays tall like the reference bill (single A4 page) */
const MIN_BODY_ROWS = 15;

function Logo() {
  return (
    <div className="mc-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/madhav-logo.jpeg" alt="Madhav Construction" className="mc-logo-img" />
    </div>
  );
}

export default function InvoiceTemplate({ invoice }: { invoice: InvoiceDTO }) {
  const items = invoice.items || [];
  const filler = Math.max(0, MIN_BODY_ROWS - items.length);
  const termsLines = (invoice.termsAndConditions || "").split("\n").filter(Boolean);

  return (
    <div className="invoice-sheet mc">
      {/* ===== Header — single box, no vertical divider (matches avadhbill) ===== */}
      <div className="mc-header">
        <div className="mc-header-logo">
          <Logo />
        </div>
        <div className="mc-header-center">
          <div className="mc-name">{invoice.seller.businessName}</div>
          <div className="mc-addr">{invoice.seller.address}</div>
          <div className="mc-contact">
            MO : {invoice.seller.mobile}&nbsp;&nbsp;EMAIL : {invoice.seller.email}
          </div>
        </div>
      </div>

      {/* ===== Title ===== */}
      <div className="mc-tax">TAX INVOICE</div>

      {/* ===== Customer / Invoice meta ===== */}
      <div className="mc-cust">
        <div className="mc-cust-left">
          <div className="mc-line">
            <span className="mc-lb">M / s. :</span>
            <span className="mc-v mc-b">{invoice.customer.name}</span>
          </div>
          <div className="mc-line">
            <span className="mc-lb">Address :</span>
            <span className="mc-v">{invoice.customer.address}</span>
          </div>
          <div className="mc-line">
            <span className="mc-lb">MO. NO :</span>
            <span className="mc-v">{invoice.customer.mobile}</span>
          </div>
          <div className="mc-line">
            <span className="mc-lb">GSTIN NO :</span>
            <span className="mc-v">{invoice.customer.gstin || ""}</span>
          </div>
        </div>
        <div className="mc-cust-right">
          <div className="mc-line">
            <span className="mc-lb">INVOICE NO :</span>
            <span className="mc-v mc-b">{invoice.invoiceNumber}</span>
          </div>
          <div className="mc-line">
            <span className="mc-lb mc-date-lb">DATE</span>
            <span className="mc-lb">:</span>
            <span className="mc-v">{formatDate(invoice.invoiceDate)}</span>
          </div>
        </div>
      </div>

      {/* ===== Items ===== */}
      <table className="mc-items">
        <colgroup>
          <col className="c-sr" />
          <col className="c-prod" />
          <col className="c-hsn" />
          <col className="c-qty" />
          <col className="c-rate" />
          <col className="c-gst" />
          <col className="c-amt" />
        </colgroup>
        <thead>
          <tr>
            <th>SR.NO.</th>
            <th>PRODUCT NAME</th>
            <th>HSN / SAC</th>
            <th>QTY</th>
            <th>RATE</th>
            <th>GST%</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="mc-data-row">
              <td>{i + 1}</td>
              <td className="left">{it.productName}</td>
              <td>{it.hsnSac || ""}</td>
              <td>{it.quantity}</td>
              <td className="num">{fmt(it.rate)}</td>
              <td>{it.gstPercentage}%</td>
              <td className="num">{fmt(it.taxableAmount)}</td>
            </tr>
          ))}
          {Array.from({ length: filler }).map((_, i) => (
            <tr key={`f-${i}`} className="mc-fill-row">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Summary — exact avadhbill rows ===== */}
      <div className="mc-sum">
        {/* GSTIN strip + Sub Total */}
        <div className="mc-sum-row mc-gray">
          <div className="mc-sum-left mc-b GSTIN-strip">
            GSTIN NO : {invoice.seller.gstin}
          </div>
          <div className="mc-sum-right">
            <span className="mc-b">Sub Total</span>
            <span className="mc-num">{fmt(invoice.subtotal)}</span>
          </div>
        </div>

        {/* Bank block + CGST/SGST */}
        <div className="mc-sum-row mc-bank-row">
          <div className="mc-sum-left mc-bank">
            <div className="mc-bank-line">
              <span className="mc-bank-lb">BANK NAME</span>
              <span className="mc-bank-v">: {invoice.seller.bank.name}</span>
            </div>
            <div className="mc-bank-line">
              <span className="mc-bank-lb">BANK A / C. NO.</span>
              <span className="mc-bank-v">: {invoice.seller.bank.accountNumber}</span>
            </div>
            <div className="mc-bank-line">
              <span className="mc-bank-lb">IFSC Code</span>
              <span className="mc-bank-v">: {invoice.seller.bank.ifsc}</span>
            </div>
            <div className="mc-bank-line">
              <span className="mc-bank-lb">MO.NO.</span>
              <span className="mc-bank-v">: {invoice.seller.mobile}</span>
            </div>
          </div>
          <div className="mc-sum-right mc-tax-box">
            <div className="mc-tax-line">
              <span>CGST TAX ({invoice.cgstPercentage}%)</span>
              <span className="mc-num">{fmt(invoice.cgstAmount)}</span>
            </div>
            <div className="mc-tax-line">
              <span>SGST TAX ({invoice.sgstPercentage}%)</span>
              <span className="mc-num">{fmt(invoice.sgstAmount)}</span>
            </div>
          </div>
        </div>

        {/* Total GST + Grand Total + value on same row */}
        <div className="mc-sum-row">
          <div className="mc-sum-left">
            <span className="mc-bank-lb sm">Total GST</span>
            <span className="mc-colon">:</span>
            <span className="mc-words-val">{amountInWords(invoice.totalGst)}</span>
          </div>
          <div className="mc-sum-right mc-gray mc-b">
            <span>Grand Total</span>
            <span className="mc-num">{fmt(invoice.grandTotal)}</span>
          </div>
        </div>

        {/* Bill Amount */}
        <div className="mc-sum-row">
          <div className="mc-sum-left">
            <span className="mc-bank-lb sm">Bill Amount</span>
            <span className="mc-colon">:</span>
            <span className="mc-words-val">{amountInWords(invoice.grandTotal)}</span>
          </div>
          <div className="mc-sum-right">&nbsp;</div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="mc-foot">
        <div className="mc-foot-left">
          <div className="mc-terms-lb">Terms &amp; Condition :</div>
          <div className="mc-terms-body">
            {termsLines.length > 0 ? (
              termsLines.map((l, i) => <div key={i}>{l}</div>)
            ) : (
              <div>&nbsp;</div>
            )}
          </div>
        </div>
        <div className="mc-foot-right">
          <div className="mc-for">For, madhav construction</div>
          <div className="mc-sign">(Authorised Signatory)</div>
        </div>
      </div>
    </div>
  );
}
