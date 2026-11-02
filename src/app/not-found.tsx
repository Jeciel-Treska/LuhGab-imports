import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <SearchX className="h-14 w-14 text-amber-700" aria-hidden />
      <h1 className="text-3xl font-black">Página não encontrada</h1>
      <p className="text-zinc-600">
        O produto ou a página que você procura não existe mais ou mudou de endereço.
      </p>
      <Link
        href="/produtos"
        className="rounded-full bg-gradient-gold px-8 py-3 text-sm font-bold text-dark"
      >
        Ver catálogo completo
      </Link>
    </section>
  );
}
