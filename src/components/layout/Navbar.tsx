"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/layout/LogoutButton";

const NAV_LINKS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 2.5h8l3 3v12H5z" strokeLinejoin="round" />
        <path d="M13 2.5v3h3M8 10h5M8 13h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Products",
    icon: (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M10 2.5 16.5 6v8L10 17.5 3.5 14V6z" strokeLinejoin="round" />
        <path d="M3.5 6 10 9.5 16.5 6M10 9.5v8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Navbar({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

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
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-1.5 rounded px-3 py-1.5 hover:bg-slate-800 ${
                    isActive(l.href) ? "bg-slate-800 text-white" : "text-slate-200"
                  }`}
                >
                  <span className="[&>svg]:h-4 [&>svg]:w-4">{l.icon}</span>
                  {l.label}
                </Link>
              ))}
              <Link
                href="/invoices/new"
                className="ml-1 flex items-center gap-1.5 rounded bg-amber-500 px-3 py-1.5 font-semibold text-slate-900 hover:bg-amber-400"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                </svg>
                New Invoice
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
      {/* Mobile menu — full-screen overlay drawer */}
      {loggedIn && open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white md:hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <div className="font-extrabold tracking-wide">
                MADHAV <span className="text-amber-400">CONSTRUCTION</span>
              </div>
              <div className="text-xs text-slate-400">Invoice Manager</div>
            </div>
            <button
              className="rounded-full border border-slate-700 p-2 text-lg leading-none hover:bg-slate-800"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-2 px-5 py-6">
            <div className="px-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Menu
            </div>
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition ${
                    active
                      ? "bg-slate-800 text-white shadow-inner ring-1 ring-slate-700"
                      : "text-slate-200 hover:bg-slate-800/70"
                  }`}
                >
                  <span className={active ? "text-amber-400" : "text-slate-400"}>
                    {l.icon}
                  </span>
                  {l.label}
                  <span className="ml-auto text-slate-500">›</span>
                </Link>
              );
            })}

            <Link
              href="/invoices/new"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-base font-bold text-slate-900 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
            >
              <span className="text-xl leading-none">+</span> New Invoice
            </Link>
          </nav>

          <div className="mt-auto border-t border-slate-800 px-5 py-5">
            <div onClick={() => setOpen(false)}>
              <LogoutButton className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-base font-medium text-slate-200 hover:bg-slate-800" />
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Madhav Construction • Surat
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
