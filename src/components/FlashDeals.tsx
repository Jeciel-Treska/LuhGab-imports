"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import { getProductById, products } from "@/data/products";
import { useFlashDealsConfig, useStoreOverrides } from "@/components/StoreConfigProvider";

const pad = (n: number) => String(n).padStart(2, "0");

const MAX_DEALS = 4;

/** Contagem regressiva até o fim do dia. */
function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setRemaining(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const parts =
    remaining === null
      ? ["--", "--", "--"]
      : [Math.floor(remaining / 3600), Math.floor((remaining % 3600) / 60), remaining % 60].map(pad);

  return (
    <div
      role="timer"
      aria-label="Tempo restante das ofertas"
      className="flex items-center gap-1.5 text-xs font-bold tabular-nums text-zinc-300"
    >
      <span className="font-medium text-zinc-400">Termina em:</span>
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="rounded border border-white/10 bg-black px-2 py-1 font-mono text-xs font-bold text-[#C9A55C]">{part}</span>
          {i < 2 && <span className="font-bold text-energy-red-500">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function FlashDeals() {
  const { mode, productIds } = useFlashDealsConfig();
  useStoreOverrides(); // re-renderiza quando preços/descontos mudam

  // Manual: exatamente os produtos escolhidos pelo lojista. Auto (ou lista manual
  // vazia): os maiores descontos em estoque.
  const manual =
    mode === "manual"
      ? (productIds ?? []).flatMap((id) => {
          const product = getProductById(id);
          return product ? [product] : [];
        })
      : [];
  const deals =
    manual.length > 0
      ? manual
      : [...products]
          .filter((p) => p.inStock && p.discountPercentage > 0)
          .sort((a, b) => b.discountPercentage - a.discountPercentage)
          .slice(0, MAX_DEALS);

  if (deals.length === 0) return null;
  return (
    <section aria-labelledby="flash-title" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeader
        id="flash-title"
        title="Ofertas Relâmpago do Dia"
        href="/produtos?ofertas=1"
        linkLabel="Ver todas as ofertas"
      >
        <Countdown />
      </SectionHeader>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {deals.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} cta="Comprar agora" />
          </li>
        ))}
      </ul>
    </section>
  );
}
