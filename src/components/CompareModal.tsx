"use client";

import { useEffect } from "react";
import { GitCompareArrows, ShoppingBag, Trophy, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { brands } from "@/data/brands";
import { getProductById } from "@/data/products";
import { SHOW_RATINGS } from "@/data/site";
import { formatBRL } from "@/lib/format";
import { getDoses, getPricePerDose, parseNumber } from "@/lib/nutrition";
import type { Product, ProductSize } from "@/types/product";

interface Column {
  product: Product;
  size: ProductSize;
  price: number;
  doses: number | null;
  perDose: number | null;
  protein: number | null;
  carbs: number | null;
  calories: number | null;
  country: string;
}

function buildColumn(product: Product): Column | null {
  const size = product.sizes.find((s) => s.inStock) ?? product.sizes[0];
  if (!size) return null;
  const facts = product.nutritionalFacts;
  return {
    product,
    size,
    price: Math.round(product.price * size.priceMultiplier * 100) / 100,
    doses: getDoses(product, size),
    perDose: getPricePerDose(product, size),
    protein: parseNumber(facts.protein),
    carbs: parseNumber(facts.carbs),
    calories: parseNumber(facts.calories),
    country: brands.find((b) => b.id === product.brandId)?.originCountry ?? "-",
  };
}

const best = (values: (number | null)[], mode: "min" | "max"): number | null => {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return mode === "min" ? Math.min(...valid) : Math.max(...valid);
};

export default function CompareModal() {
  const { ids, isOpen, open, close, clear, remove } = useCompare();
  const { addItem } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const columns = ids
    .map((id) => getProductById(id))
    .flatMap((p) => (p ? [buildColumn(p)] : []))
    .filter((c): c is Column => c !== null);

  // Vencedor: menor preço por dose; sem dados de dose, menor preço total
  const hasPerDose = columns.some((c) => c.perDose !== null);
  const winnerId = columns.length
    ? columns.reduce((a, b) => {
        const av = hasPerDose ? (a.perDose ?? Infinity) : a.price;
        const bv = hasPerDose ? (b.perDose ?? Infinity) : b.price;
        return bv < av ? b : a;
      }).product.id
    : null;

  const bestPerDose = best(columns.map((c) => c.perDose), "min");
  const bestProtein = best(columns.map((c) => c.protein), "max");
  const bestCarbs = best(columns.map((c) => c.carbs), "min");
  const bestCalories = best(columns.map((c) => c.calories), "min");
  const bestRating = best(columns.map((c) => c.product.rating), "max");

  const addColumn = (c: Column) => {
    const flavor = c.product.flavors.find((f) => f.inStock);
    if (flavor && c.product.inStock) addItem(c.product, flavor, c.size, 1);
  };

  const rows: {
    label: string;
    render: (c: Column) => string;
    isBest?: (c: Column) => boolean;
  }[] = [
    { label: "Marca", render: (c) => c.product.brandName },
    { label: "País de origem", render: (c) => c.country },
    ...(SHOW_RATINGS
      ? [
          {
            label: "Avaliação",
            render: (c: Column) => `${c.product.rating.toFixed(1)} (${c.product.reviewCount})`,
            isBest: (c: Column) => c.product.rating === bestRating,
          },
        ]
      : []),
    { label: "Tamanho comparado", render: (c) => c.size.label },
    { label: "Preço total", render: (c) => formatBRL(c.price) },
    { label: "Doses no pote", render: (c) => (c.doses ? `${c.doses}` : "-") },
    {
      label: "Preço por dose",
      render: (c) => (c.perDose !== null ? formatBRL(c.perDose) : "-"),
      isBest: (c) => c.perDose !== null && c.perDose === bestPerDose,
    },
    { label: "Porção", render: (c) => c.product.nutritionalFacts.servingSize },
    {
      label: "Proteína por dose",
      render: (c) => c.product.nutritionalFacts.protein,
      isBest: (c) => c.protein !== null && c.protein > 0 && c.protein === bestProtein,
    },
    {
      label: "Carboidratos",
      render: (c) => c.product.nutritionalFacts.carbs,
      isBest: (c) => c.carbs !== null && c.carbs === bestCarbs,
    },
    {
      label: "Calorias",
      render: (c) => c.product.nutritionalFacts.calories,
      isBest: (c) => c.calories !== null && c.calories === bestCalories,
    },
    { label: "BCAA por dose", render: (c) => c.product.nutritionalFacts.bcaa },
  ];

  return (
    <>
      {/* Barra flutuante: aparece com 2+ produtos marcados */}
      {ids.length >= 2 && !isOpen && (
        <div
          role="region"
          aria-label="Comparador de produtos"
          className="fixed bottom-4 left-4 right-24 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-dark-card/95 px-4 py-3 shadow-xl shadow-black/50 backdrop-blur"
        >
          <p className="text-sm text-zinc-200">
            <strong className="text-[#D4AF37]">{ids.length}</strong> produtos para comparar
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clear}
              className="text-xs text-zinc-400 underline hover:text-zinc-200"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={open}
              className="flex h-9 items-center gap-2 rounded-full bg-amber-500 px-4 text-sm font-bold text-dark"
            >
              <GitCompareArrows className="h-4 w-4" aria-hidden />
              Comparar
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Comparar produtos"
          className="fixed inset-0 z-[75] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-dark-soft sm:rounded-2xl">
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
                <GitCompareArrows className="h-5 w-5 text-[#D4AF37]" aria-hidden />
                Comparar produtos
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar comparador"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:bg-[#131318]/10"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="overflow-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-36 bg-dark-soft p-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Produto
                    </th>
                    {columns.map((c) => (
                      <th
                        key={c.product.id}
                        scope="col"
                        className={`min-w-[10rem] p-3 text-left align-top ${
                          c.product.id === winnerId ? "bg-amber-500/10" : ""
                        }`}
                      >
                        {c.product.id === winnerId && (
                          <span className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#D4AF37]">
                            <Trophy className="h-3 w-3" aria-hidden /> Melhor custo-benefício
                          </span>
                        )}
                        <span className="block font-semibold text-zinc-100">{c.product.name}</span>
                        <button
                          type="button"
                          onClick={() => remove(c.product.id)}
                          className="mt-1 text-xs text-zinc-400 underline hover:text-zinc-200"
                        >
                          Remover
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-t border-white/5">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-dark-soft p-3 text-left text-xs font-medium text-zinc-400"
                      >
                        {row.label}
                      </th>
                      {columns.map((c) => (
                        <td
                          key={c.product.id}
                          className={`p-3 ${c.product.id === winnerId ? "bg-gold/5" : ""} ${
                            row.isBest?.(c) ? "font-bold text-emerald-400" : "text-zinc-200"
                          }`}
                        >
                          {row.render(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-white/10">
                    <td className="sticky left-0 z-10 bg-dark-soft p-3" />
                    {columns.map((c) => (
                      <td key={c.product.id} className="p-3">
                        <button
                          type="button"
                          onClick={() => addColumn(c)}
                          disabled={!c.product.inStock}
                          className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            c.product.id === winnerId
                              ? "bg-amber-500 text-dark hover:shadow-gold"
                              : "border border-white/15 text-zinc-200 hover:border-amber-500/60 hover:text-[#D4AF37]"
                          }`}
                        >
                          <ShoppingBag className="h-4 w-4" aria-hidden />
                          Adicionar
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
