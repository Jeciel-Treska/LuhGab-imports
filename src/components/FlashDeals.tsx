"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
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

  const dayPct = remaining === null ? 100 : Math.max(0, Math.min(100, (remaining / 86400) * 100));
  const labels = ["h", "min", "s"];

  return (
    <div role="timer" aria-label="Tempo restante das ofertas" className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
        <span className="text-zinc-400">Termina em</span>
        {parts.map((part, i) => (
          <span key={i} className="flex items-baseline gap-0.5">
            <span className="min-w-[2.25rem] rounded-md border border-red-600 bg-black px-2 py-1 text-center font-display text-xl font-bold leading-none tabular-nums text-white">
              {part}
            </span>
            <span className="text-[0.625rem] uppercase text-zinc-400">{labels[i]}</span>
          </span>
        ))}
      </div>
      <div aria-hidden className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-red-600" style={{ width: `${dayPct}%` }} />
      </div>
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
    <section aria-labelledby="flash-title" className="stage-urgency relative">
      <div aria-hidden className="divider-red" />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
      <SectionHeader
        id="flash-title"
        title="Ofertas Relâmpago do Dia"
        href="/produtos?ofertas=1"
        linkLabel="Ver todas as ofertas"
      >
        <Countdown />
      </SectionHeader>
      <ProductCarousel products={deals} label="Ofertas Relâmpago" cta="Comprar agora" />
      </div>
    </section>
  );
}
