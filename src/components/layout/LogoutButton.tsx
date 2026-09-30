"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
    >
      Logout
    </button>
  );
}
