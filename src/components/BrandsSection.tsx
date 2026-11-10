import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { brands } from "@/data/brands";

export default function BrandsSection() {
  return (
    <section aria-labelledby="brands-title" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <SectionHeader id="brands-title" title="Marcas Oficiais" href="/marcas" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/produtos?marca=${brand.id}`}
              className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-dark-card px-3 text-center transition hover:border-[#E8D8B5]/25"
            >
              <span className="text-sm font-black uppercase leading-tight tracking-wide text-zinc-100">
                {brand.name}
              </span>
              <span className="text-xs text-zinc-400">{brand.originCountry}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
