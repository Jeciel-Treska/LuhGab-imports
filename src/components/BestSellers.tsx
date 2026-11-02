import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import { products } from "@/data/products";

// Produtos em destaque garantindo a presença dos produtos reais solicitados pelo usuário
const FEATURED_SLUGS = [
  "growth-creatina-monohidratada",
  "bvs-beast-kaos",
  "vitafor-whey-fort-3w",
  "demons-lab-psycho-killer",
  "adaptogen-tasty-whey-original",
  "max-femini-whey",
  "biovigor-curcumen",
  "diabo-verde-ftw-whey",
  "danone-yopro-shake-morango",
  "gecaps-magnesio-inositol",
  "im-whey-100-pure",
  "under-labz-dimethylex",
];

const featuredProducts = FEATURED_SLUGS
  .map((slug) => products.find((p) => p.slug === slug || p.id === slug))
  .filter((p): p is (typeof products)[number] => Boolean(p));

export default function BestSellers() {
  return (
    <section id="destaques" aria-labelledby="best-title" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" /> Catálogo LuhGab Imports
          </div>
          <h2 id="best-title" className="mt-2 text-2xl font-black uppercase tracking-tight text-zinc-950 sm:text-3xl">
            Destaques da Loja
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Suplementos selecionados, com laudo, lacre de procedência e envio em até 24h.
          </p>
        </div>

        <Link
          href="/produtos"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900 transition hover:text-emerald-700"
        >
          Ver todos os {products.length} produtos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
