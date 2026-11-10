"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import { products } from "@/data/products";
import { useStoreOverrides } from "@/components/StoreConfigProvider";

const FALLBACK_COUNT = 4;

export default function BestSellers() {
  // Assina as edições do lojista: ao salvar, `products` já vem atualizado e re-renderiza.
  useStoreOverrides();

  const featured = products.filter((p) => p.isFeatured);
  const hasFeatured = featured.length > 0;
  const list = hasFeatured ? featured : products.slice(0, FALLBACK_COUNT);

  return (
    <section id="destaques" aria-labelledby="best-title" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-amber-500/10 px-3 py-1 text-xs font-bold text-[#C9A55C]">
            <Sparkles className="h-3.5 w-3.5" /> Catálogo LuhGab Imports
          </div>
          <h2 id="best-title" className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Destaques da Loja
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Suplementos selecionados, com laudo, lacre de procedência e envio em até 24h.
          </p>
        </div>

        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9A55C] transition hover:text-white"
        >
          Ver todos os {products.length} produtos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {!hasFeatured && (
        <p className="mt-6 rounded-xl border border-white/10 bg-[#121216] px-4 py-3 text-sm text-zinc-400">
          Nenhum destaque selecionado no momento. Confira algumas opções do nosso catálogo:
        </p>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
