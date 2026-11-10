import type { Metadata } from "next";
import Link from "next/link";
import { getBrandsWithProducts, getProductsByBrand } from "@/data/products";

export const metadata: Metadata = {
  title: "Marcas Oficiais",
  description: "Conheça as marcas importadas e nacionais vendidas na LuhGab Imports.",
  alternates: { canonical: "/marcas" },
};

export default function BrandsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Marcas Oficiais</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getBrandsWithProducts().map((brand) => {
          const count = getProductsByBrand(brand.id).length;
          return (
          <li key={brand.id}>
            <Link
              href={`/produtos?marca=${brand.id}`}
              className="flex h-full flex-col gap-2 rounded-xl border border-white/[0.07] bg-[#131318] p-5 transition hover:border-[#E8D8B5]/25"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                {brand.badgeText} • {brand.originCountry}
              </span>
              <span className="text-xl font-black uppercase">{brand.name}</span>
              <span className="text-sm text-zinc-400">{brand.description}</span>
              <span className="mt-auto pt-3 text-sm font-semibold text-amber-400">
                Ver {count} {count === 1 ? "produto" : "produtos"} &rarr;
              </span>
            </Link>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
