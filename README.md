# Madhav Construction — Invoice / Bill Management

Next.js (App Router) + TypeScript + MongoDB (Mongoose) + Tailwind + React Hook Form + Zod.

No server-side PDF generation. No PDFs stored. Only structured invoice **data** in MongoDB.
Invoice is rendered as a real HTML/React component (`InvoiceTemplate`) and downloaded via
browser print (`window.print()` → Save as PDF) with A4 print CSS.

> Note: no reference PDF file was found in `D:\avadh`, so the template was recreated from the
> textual specification in the prompt (company header, TAX INVOICE title, customer/invoice meta,
> product table SR/PRODUCT/HSN/QTY/RATE/GST%/AMOUNT, GSTIN-bank + tax summary, terms + signatory).

## 1. Setup

```bash
npm install
cp .env.example .env.local   # then edit MONGODB_URI
# .env.local example:
# MONGODB_URI=mongodb://127.0.0.1:27017/invoice-app
# or Atlas:
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/invoice-app?retryWrites=true&w=majority
```

## 2. Login (no signup)

Single user from env (`ADMIN_USER` / `ADMIN_PASSWORD` in `.env.local`, defaults
`admin` / `admin123`). Open the app → redirected to `/login` → session cookie
(`mc_session`, 7 days, httpOnly) guards all pages and `/api/*` via
`src/proxy.ts` (Next 16 convention). Logout via the navbar button. After changing
`.env.local` or auth files, restart the server (`npm run dev` / `npm start`) —
a stale `next start` process will keep serving the old unprotected build.

## 3. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production check (passes)
npm start       # serve production build
```

## 3. Flow

1. Dashboard `/` → stats + recent + Create Invoice
2. `/invoices/new` → customer + date + dynamic items, live Subtotal/CGST/SGST/Total/Grand, Preview (same `InvoiceTemplate`), Save
3. Save → `POST /api/invoices` → backend validates (Zod), generates `MC-0001…` atomically via `Counter`, snapshots seller from `src/lib/company.ts`, recalculates everything, stores in MongoDB → redirect `/invoices/[id]`
4. `/invoices` → history, search (number/customer/mobile), pagination, View/Edit/Delete
5. `/invoices/[id]` → `InvoiceTemplate` + [Back][Edit][Print / Download PDF] → `window.print()`, `@page A4`, `.no-print` hidden, only `.print-area` visible
6. `/products` → product master (auto-fills invoice rows, invoices keep their own snapshot)

## 4. Key files

- `src/components/invoice/InvoiceTemplate.tsx` — A4 invoice, pure HTML/CSS, 210mm×297mm
- `src/styles/invoice.css` — screen + `@media print`, `@page { size: A4; margin: 0 }`
- `src/components/invoice/InvoiceForm.tsx` — RHF + Zod + live calc + preview
- `src/models/{Invoice,Product,Counter}.ts` — Mongoose schemas
- `src/lib/{mongodb,invoice-calculation,invoice-number,validation,company,format}.ts`
- `src/app/api/{invoices,products,dashboard}/route.ts`

## 5. Calculations (backend is source of truth)

- `taxable = qty × rate`, `gstAmt = taxable × gst% / 100`, `lineTotal = taxable + gstAmt`
- `subtotal = Σ taxable`, `totalGst = Σ gstAmt`, `cgst = totalGst/2`, `sgst = totalGst - cgst`
- `bill = subtotal + totalGst`, `grand = round(bill)`
- Table AMOUNT column shows taxable (so its sum = Sub Total, matching the reference example `10×500=5000`).

## 6. Print / PDF

- No Puppeteer/Playwright, no storage. Click **Print / Download PDF** → `window.print()`.
- In dialog: Destination → Save as PDF, Layout → Portrait, Paper → A4, Margins → None, Background graphics → on.

## 7. Company defaults

Edit `src/lib/company.ts` (`COMPANY_INFO`, `DEFAULT_TERMS`, `INVOICE_NUMBER_PREFIX`). Old invoices keep their seller snapshot.
