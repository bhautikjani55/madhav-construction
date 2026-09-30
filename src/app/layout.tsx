import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Madhav Construction — Invoice Manager",
  description: "Create, store and print GST tax invoices. Data in MongoDB, PDF via browser print.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="no-print border-t bg-white py-3 text-center text-xs text-slate-500">
          Madhav Construction • Invoices stored as data in MongoDB • Print via browser (Save as PDF)
        </footer>
      </body>
    </html>
  );
}
