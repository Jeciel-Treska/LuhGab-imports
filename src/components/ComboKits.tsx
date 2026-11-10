"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import SectionHeader from "@/components/SectionHeader";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import { formatBRL } from "@/lib/format";
import type { Product, ProductCategory } from "@/types/product";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Whey em pó: a categoria de proteína também inclui barras e bebidas. */
const isWheyPowder = (p: Product) =>
  /whey/i.test(p.name) && !/\bbar\b|shake/i.test(p.name);

const pick = (
  category: ProductCategory,
  nth = 0,
  accepts: (p: Product) => boolean = () => true,
): Product | undefined =>
  products
    .filter((p) => p.category === category && p.inStock && accepts(p))
    .sort((a, b) => b.reviewCount - a.reviewCount)[nth];

interface Kit {
  id: string;
  title: string;
  text: string;
  discount: number;
  items: Product[];
}

const compact = (list: (Product | undefined)[]) => list.filter((p): p is Product => !!p);

const KITS: Kit[] = [
  {
    id: "massa",
    title: "Kit Hipertrofia Máxima",
    text: "Whey Protein + Creatina + Suplemento de Saúde",
    discount: 15,
    items: compact([pick("proteina", 0, isWheyPowder), pick("creatina"), pick("vitaminas")]),
  },
  {
    id: "energia",
    title: "Kit Definição & Força",
    text: "Whey Protein + Pré-Treino + Creatina",
    discount: 15,
    items: compact([pick("proteina", 1, isWheyPowder), pick("pre-treino"), pick("creatina", 1)]),
  },
  {
    id: "essencial",
    title: "Kit Dupla Essencial",
    text: "Whey Protein + Creatina",
    discount: 10,
    items: compact([pick("proteina", 2, isWheyPowder), pick("creatina", 2)]),
  },
].filter((kit) => kit.items.length >= 2);

function KitCard({ kit }: { kit: Kit }) {
  const { addCombo } = useCart();
  // Mesmo cálculo por linha do carrinho, com o primeiro tamanho em estoque.
  const unitPrices = kit.items.map((p) =>
    round2(p.price * (p.sizes.find((s) => s.inStock)?.priceMultiplier ?? 1)),
  );
  const original = round2(unitPrices.reduce((sum, price) => sum + price, 0));
  const final = round2(
    unitPrices.reduce((sum, price) => sum + round2(price * (1 - kit.discount / 100)), 0),
  );

  const buy = () => {
    const comboItems = kit.items.flatMap((product) => {
      const flavor = product.flavors.find((f) => f.inStock);
      const size = product.sizes.find((s) => s.inStock);
      return flavor && size ? [{ product, flavor, size, quantity: 1 }] : [];
    });
    addCombo(comboItems, kit.discount);
  };

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#131317] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-400">
              Economize {kit.discount}%
            </span>
            <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white">
              {kit.title}
            </h3>
            <p className="text-xs text-zinc-400 font-medium">{kit.text}</p>
          </div>
        </div>

        <ul className="my-6 flex items-center justify-center gap-3">
          {kit.items.map((product, i) => (
            <li key={product.id} className="flex items-center gap-2">
              {i > 0 && <Plus className="h-4 w-4 text-zinc-400" aria-hidden />}
              <Link
                href={`/produto/${product.slug}`}
                aria-label={product.name}
                className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#0F0F13] border border-white/[0.07] p-2 transition hover:scale-105"
              >
                <ProductThumb
                  type={product.model3DConfig.type}
                  color={product.model3DConfig.color}
                  productId={product.id}
                  imageUrl={product.imageUrl}
                  alt={product.name}
                  sizes="80px"
                  className="h-full w-full"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto border-t border-white/[0.06] pt-4">
        <p className="text-xs text-zinc-400 line-through">
          De: {formatBRL(original)}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-extrabold text-white">
            {formatBRL(final)}
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Economia de {formatBRL(round2(original - final))}
          </span>
        </div>

        <button
          type="button"
          onClick={buy}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 shadow-sm"
        >
          <span>Garantir Combo com {kit.discount}% OFF</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default function ComboKits() {
  return (
    <section aria-labelledby="kits-title" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeader
        id="kits-title"
        title="Combos Promocionais & Economia"
        href="/montar-combo"
        linkLabel="Montar seu próprio combo"
      />
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {KITS.map((kit) => (
          <li key={kit.id}>
            <KitCard kit={kit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
