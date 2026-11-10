"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getBrandsWithProducts, products } from "@/data/products";
import { categoryLabels, objectiveLabels, SHOW_RATINGS } from "@/data/site";
import type { Product, ProductCategory, ProductObjective } from "@/types/product";

export interface CatalogInitialFilters {
  q?: string;
  categoria?: string;
  marca?: string;
  objetivo?: string;
  ofertas?: boolean;
}

type SortId = "popular" | "price-asc" | "price-desc" | "discount" | "rating";

const SORTS: { id: SortId; label: string }[] = [
  { id: "popular", label: "Destaques" },
  { id: "price-asc", label: "Menor preço" },
  { id: "price-desc", label: "Maior preço" },
  { id: "discount", label: "Maior desconto" },
  ...(SHOW_RATINGS ? [{ id: "rating" as const, label: "Mais avaliados" }] : []),
];

const catalogBrands = getBrandsWithProducts();
const catalogCategories = Object.entries(categoryLabels).filter(([id]) =>
  products.some((p) => p.category === id),
);

const sorters: Record<SortId, (a: Product, b: Product) => number> = {
  popular: (a, b) => b.reviewCount - a.reviewCount,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  discount: (a, b) => b.discountPercentage - a.discountPercentage,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const selectClass =
  "h-11 rounded-lg border border-white/[0.07] bg-[#131318] px-3 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none";

const isCategory = (value: string | undefined): value is ProductCategory =>
  value !== undefined && Object.hasOwn(categoryLabels, value);
const isObjective = (value: string | undefined): value is ProductObjective =>
  value !== undefined && Object.hasOwn(objectiveLabels, value);

export default function ProductCatalog({ initial = {} }: { initial?: CatalogInitialFilters }) {
  const router = useRouter();
  const query = initial.q ?? "";
  const [brandId, setBrandId] = useState(
    catalogBrands.some((b) => b.id === initial.marca) ? (initial.marca as string) : "",
  );
  const [category, setCategory] = useState<ProductCategory | "">(
    isCategory(initial.categoria) ? initial.categoria : "",
  );
  const [objective, setObjective] = useState<ProductObjective | "">(
    isObjective(initial.objetivo) ? initial.objetivo : "",
  );
  const [onlyDeals, setOnlyDeals] = useState(initial.ofertas ?? false);
  const [sort, setSort] = useState<SortId>(initial.ofertas ? "discount" : "popular");

  const hasFilters =
    query !== "" || brandId !== "" || category !== "" || objective !== "" || onlyDeals;

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return products
      .filter((p) => {
        if (brandId && p.brandId !== brandId) return false;
        if (category && p.category !== category) return false;
        if (objective && p.objective !== objective) return false;
        if (onlyDeals && p.discountPercentage <= 0) return false;
        if (terms.length === 0) return true;
        const haystack = normalize(
          `${p.name} ${p.brandName} ${categoryLabels[p.category]} ${p.shortDescription}`,
        );
        return terms.every((term) => haystack.includes(term));
      })
      .sort(sorters[sort]);
  }, [query, brandId, category, objective, onlyDeals, sort]);

  const clear = () => {
    setBrandId("");
    setCategory("");
    setObjective("");
    setOnlyDeals(false);
    // A busca vem da URL: voltar ao catálogo limpo também a remove.
    router.push("/produtos");
  };

  const brandName = catalogBrands.find((b) => b.id === brandId)?.name;
  const title = query
    ? `Resultados para “${query}”`
    : category
      ? categoryLabels[category]
      : brandName
        ? brandName
        : onlyDeals
          ? "Ofertas"
          : "Todos os produtos";

  return (
    <section aria-labelledby="catalog-title" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 id="catalog-title" className="text-2xl font-bold sm:text-3xl">
        {title}
      </h1>

      <div className="mb-6 mt-4 flex flex-wrap items-center gap-2">
        <p aria-live="polite" className="mr-auto text-sm text-zinc-400">
          {visible.length} {visible.length === 1 ? "produto" : "produtos"}
        </p>
        <select
          aria-label="Marca"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas as marcas</option>
          {catalogBrands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory | "")}
          className={selectClass}
        >
          <option value="">Todas as categorias</option>
          {catalogCategories.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Objetivo"
          value={objective}
          onChange={(e) => setObjective(e.target.value as ProductObjective | "")}
          className={selectClass}
        >
          <option value="">Todos os objetivos</option>
          {Object.entries(objectiveLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Ordenar por"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortId)}
          className={selectClass}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="h-11 px-3 text-sm text-amber-400 underline-offset-4 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-white/[0.07] bg-[#131318] px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-amber-400" aria-hidden />
          <p className="text-lg font-semibold">Nenhum produto encontrado</p>
          <p className="max-w-sm text-sm text-zinc-400">
            Tente outro termo ou remova alguns filtros.
          </p>
          <button
            type="button"
            onClick={clear}
            className="min-h-[44px] rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-dark"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
