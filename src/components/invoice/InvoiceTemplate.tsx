import type { InvoiceDTO } from "@/types/invoice";
import { formatDate } from "@/lib/format";

function fmt(n: number): string {
  const v = Number(n) || 0;
  return v.toFixed(2);
}

/** Rows of blank space so the items area stays tall like the reference PDF */
const MIN_BODY_ROWS = 18;

function Logo() {
  return (
    <div className="mc-logo">
      <svg viewBox="0 0 120 62" className="mc-logo-svg" aria-hidden="true">
        {/* buildings */}
        <g>
          <rect x="34" y="14" width="10" height="26" fill="#1a3a8f" />
          <rect x="46" y="6" width="12" height="34" fill="#2f6fd0" />
          <rect x="60" y="12" width="10" height="28" fill="#1a3a8f" />
          <rect x="72" y="18" width="9" height="22" fill="#2f6fd0" />
          {/* windows */}
          <g fill="#cfe3ff">
            <rect x="48" y="10" width="3" height="3" />
            <rect x="52" y="10" width="3" height="3" />
            <rect x="48" y="15" width="3" height="3" />
            <rect x="52" y="15" width="3" height="3" />
            <rect x="48" y="20" width="3" height="3" />
            <rect x="52" y="20" width="3" height="3" />
          </g>
          {/* swoosh */}
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

  return (
    <div className="invoice-sheet mc">
      {/* ===== Header ===== */}
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
            <span className="mc-lb">DATE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span>
            <span className="mc-v">{formatDate(invoice.invoiceDate)}</span>
          </div>
        </div>
      </div>

      {/* ===== Items ===== */}
      <table className="mc-items">
        <thead>
          <tr>
            <th className="w-sr">SR.NO.</th>
            <th className="w-prod">PRODUCT NAME</th>
            <th className="w-hsn">HSN / SAC</th>
            <th className="w-qty">QTY</th>
            <th className="w-rate">RATE</th>
            <th className="w-gst">GST%</th>
            <th className="w-amt">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="mc-data-row">
              <td className="w-sr">{i + 1}</td>
              <td className="w-prod left">{it.productName}</td>
              <td className="w-hsn">{it.hsnSac || ""}</td>
              <td className="w-qty">{it.quantity}</td>
              <td className="w-rate num">{fmt(it.rate)}</td>
              <td className="w-gst">{it.gstPercentage}%</td>
              <td className="w-amt num">{fmt(it.taxableAmount)}</td>
            </tr>
          ))}
          {Array.from({ length: filler }).map((_, i) => (
            <tr key={`f-${i}`} className="mc-fill-row">
              <td className="w-sr">&nbsp;</td>
              <td className="w-prod">&nbsp;</td>
              <td className="w-hsn">&nbsp;</td>
              <td className="w-qty">&nbsp;</td>
              <td className="w-rate">&nbsp;</td>
              <td className="w-gst">&nbsp;</td>
              <td className="w-amt">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Summary (matches reference rows) ===== */}
      <div className="mc-sum">
        {/* Row: GSTIN strip + Sub Total */}
        <div className="mc-sum-row mc-gray">
          <div className="mc-sum-left mc-b">
            GSTIN NO : {invoice.seller.gstin}
          </div>
          <div className="mc-sum-right">
            <span className="mc-b">Sub Total</span>
            <span className="mc-num">{fmt(invoice.subtotal)}</span>
          </div>
        </div>

        {/* Row: bank block + CGST/SGST */}
        <div className="mc-sum-row mc-bank-row">
          <div className="mc-sum-left">
            <div className="mc-bank-line">
              <span className="mc-bank-lb">BANK NAME</span>
              <span>:&nbsp;&nbsp;{invoice.seller.bank.name}</span>
            </div>
            <div className="mc-bank-line">
              <span className="mc-bank-lb">BANK A / C. NO.</span>
              <span>:&nbsp;&nbsp;{invoice.seller.bank.accountNumber}</span>
            </div>
            <div className="mc-bank-line">
              <span className="mc-bank-lb">IFSC Code</span>
              <span>:&nbsp;&nbsp;{invoice.seller.bank.ifsc}</span>
            </div>
            <div className="mc-bank-line">
              <span className="mc-bank-lb">MO.NO.</span>
              <span>:&nbsp;&nbsp;{invoice.seller.mobile}</span>
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

        {/* Row: Total GST + Grand Total label */}
        <div className="mc-sum-row">
          <div className="mc-sum-left">
            <span className="mc-bank-lb">Total GST</span>
            <span className="mc-colon">:</span>
            <span className="mc-num">{fmt(invoice.totalGst)}</span>
          </div>
          <div className="mc-sum-right mc-gray mc-b">Grand Total</div>
        </div>

        {/* Row: Bill Amount + Grand value */}
        <div className="mc-sum-row">
          <div className="mc-sum-left">
            <span className="mc-bank-lb">Bill Amount</span>
            <span className="mc-colon">:</span>
            <span className="mc-num">{fmt(invoice.billAmount)}</span>
          </div>
          <div className="mc-sum-right mc-grand-val">{fmt(invoice.grandTotal)}</div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="mc-foot">
        <div className="mc-foot-left">
          <div className="mc-terms-lb">Terms &amp; Condition :</div>
          <div className="mc-terms-body">
            {(invoice.termsAndConditions || "").split("\n").map((l, i) => (
              <div key={i}>{l}</div>
            ))}
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
