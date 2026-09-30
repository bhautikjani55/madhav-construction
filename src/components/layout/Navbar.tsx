import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";

export default function Navbar({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="no-print border-b bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-extrabold tracking-wide">
          MADHAV <span className="text-amber-400">CONSTRUCTION</span>
          <span className="ml-2 hidden text-xs font-normal text-slate-300 sm:inline">
            Invoice Manager
          </span>
        </Link>
        {loggedIn && (
          <nav className="flex items-center gap-1 text-sm">
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
        )}
      </div>
    </header>
  );
}
