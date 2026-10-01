import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { verifySession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Madhav Construction — Invoice Manager",
  description: "Create, store and print GST tax invoices. Data in MongoDB, PDF via browser print.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("mc_session")?.value;
  const loggedIn = (await verifySession(token)) !== null;
  const year = new Date().getFullYear();

  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Navbar loggedIn={loggedIn} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="no-print border-t bg-white py-3 text-center text-xs text-slate-500">
          © {year} Madhav Construction. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
