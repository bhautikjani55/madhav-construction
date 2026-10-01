import type { InvoiceDTO } from "@/types/invoice";
import { amountInWords, formatDate } from "@/lib/format";

function fmt(n: number): string {
  const v = Number(n) || 0;
  return v.toFixed(2);
}

/** Blank rows so the items area stays tall like the reference bill (single A4 page) */
const MIN_BODY_ROWS = 15;

function Logo() {
  return (
    <div className="mc-logo">
      <svg viewBox="0 0 120 62" className="mc-logo-svg" aria-hidden="true">
        <g>
          <rect x="34" y="14" width="10" height="26" fill="#1a3a8f" />
          <rect x="46" y="6" width="12" height="34" fill="#2f6fd0" />
          <rect x="60" y="12" width="10" height="28" fill="#1a3a8f" />
          <rect x="72" y="18" width="9" height="22" fill="#2f6fd0" />
          <g fill="#cfe3ff">
            <rect x="48" y="10" width="3" height="3" />
            <rect x="52" y="10" width="3" height="3" />
            <rect x="48" y="15" width="3" height="3" />
            <rect x="52" y="15" width="3" height="3" />
            <rect x="48" y="20" width="3" height="3" />
            <rect x="52" y="20" width="3" height="3" />
          </g>
          <path
            d="M18 42 Q45 34 60 40 Q80 46 102 38 Q84 50 58 48 Q34 46 18 42 Z"
            fill="#2f6fd0"
          />
          <path
            d="M22 46 Q50 42 78 45"
            stroke="#1a3a8f"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
        <text
          x="60"
          y="58"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="900"
          fontSize="14"
          fill="#0b2a6b"
          letterSpacing="0.5"
        >
          MADHAV
        </text>
      </svg>
      <div className="mc-logo-sub">— CONSTRUCTION —</div>
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

        {/* Total GST + Grand Total label */}
        <div className="mc-sum-row">
          <div className="mc-sum-left">
            <span className="mc-bank-lb sm">Total GST</span>
            <span className="mc-colon">:</span>
            <span className="mc-words-val">{amountInWords(invoice.totalGst)}</span>
          </div>
          <div className="mc-sum-right mc-gray mc-b">
            <span>Grand Total</span>
            <span className="mc-num" />
          </div>
        </div>

        {/* Bill Amount + Grand value */}
        <div className="mc-sum-row">
          <div className="mc-sum-left">
            <span className="mc-bank-lb sm">Bill Amount</span>
            <span className="mc-colon">:</span>
            <span className="mc-words-val">{amountInWords(invoice.grandTotal)}</span>
          </div>
          <div className="mc-sum-right mc-grand-val">{fmt(invoice.grandTotal)}</div>
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
