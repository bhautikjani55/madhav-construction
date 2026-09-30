"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "@/components/layout/LogoutButton";

export default function Navbar({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print border-b bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-extrabold tracking-wide" onClick={() => setOpen(false)}>
          MADHAV <span className="text-amber-400">CONSTRUCTION</span>
          <span className="ml-2 hidden text-xs font-normal text-slate-300 sm:inline">
            Invoice Manager
          </span>
        </Link>
        {loggedIn && (
          <>
            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 text-sm md:flex">
              <Link href="/" className="rounded px-3 py-1.5 hover:bg-slate-800">
                Dashboard
              </Link>
              <Link href="/invoices" className="rounded px-3 py-1.5 hover:bg-slate-800">
                Invoices
              </Link>
              <Link href="/products" className="rounded px-3 py-1.5 hover:bg-slate-800">
                Products
              </Link>
              <Link
                href="/invoices/new"
                className="ml-1 rounded bg-amber-500 px-3 py-1.5 font-semibold text-slate-900 hover:bg-amber-400"
              >
                + New Invoice
              </Link>
              <LogoutButton />
            </nav>
            {/* Hamburger */}
            <button
              className="rounded p-2 hover:bg-slate-800 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? "✕" : "☰"}
            </button>
          </>
        )}
      </div>
      {/* Mobile menu */}
      {loggedIn && open && (
        <nav className="flex flex-col gap-1 border-t border-slate-700 px-4 py-3 text-sm md:hidden">
          {[
            { href: "/", label: "Dashboard" },
            { href: "/invoices", label: "Invoices" },
            { href: "/products", label: "Products" },
            { href: "/invoices/new", label: "+ New Invoice" },
          ].map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2 hover:bg-slate-800"
            >
              {l.label}
            </Link>
          ))}
          <div onClick={() => setOpen(false)}>
            <LogoutButton />
          </div>
        </nav>
      )}
    </header>
  );
}
