"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Login failed");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border bg-white p-6 shadow-sm">
      <h1 className="text-center text-xl font-extrabold">
        MADHAV <span className="text-amber-500">CONSTRUCTION</span>
      </h1>
      <p className="mb-4 mt-1 text-center text-sm text-slate-500">
        Sign in to manage invoices
      </p>
      {error && (
        <p className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="current-password"
            required
          />
        </div>
        <button
          disabled={loading}
          className="w-full rounded bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
