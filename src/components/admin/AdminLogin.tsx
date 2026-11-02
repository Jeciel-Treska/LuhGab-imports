"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Não foi possível entrar.");
    } catch {
      setError("Sem conexão. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-16">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950 text-white">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-5 font-sans text-2xl font-bold tracking-tight text-zinc-950">Painel da loja</h1>
        <p className="mt-1 text-sm text-zinc-500">Acesso restrito ao lojista.</p>

        {!configured && (
          <p role="alert" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Acesso não configurado. Defina <code className="font-mono">ADMIN_PASSWORD</code> (mínimo 8
            caracteres) no <code className="font-mono">.env.local</code> e reinicie o servidor.
          </p>
        )}

        <label htmlFor="admin-password" className="mt-6 block text-xs font-semibold uppercase tracking-wide text-zinc-600">
          Senha
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(error)}
          className="mt-1.5 h-12 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password || !configured}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Entrar
        </button>
      </form>
    </div>
  );
}
