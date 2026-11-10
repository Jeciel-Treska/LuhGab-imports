import Link from "next/link";
import { ArrowUpRight, Dumbbell, Flame, Sparkles, Zap } from "lucide-react";

const CATEGORIES = [
  {
    title: "TERMOGÊNICOS",
    subtitle: "Definição corporal & Queima acelerada",
    tag: "Alta Procura",
    href: "/produtos?categoria=termogenicos",
    icon: Flame,
    color: "bg-energy-red-600/15 text-energy-red-400",
  },
  {
    title: "WHEY & PROTEÍNAS",
    subtitle: "Isolados, Hidrolisados e Concentrados",
    tag: "Mais Vendidos",
    href: "/produtos?categoria=proteina",
    icon: Dumbbell,
    color: "bg-amber-500/10 text-[#D4AF37]",
  },
  {
    title: "CREATINAS PURAS",
    subtitle: "100% Monohidratadas e Creapure®",
    tag: "Força & Volume",
    href: "/produtos?categoria=creatina",
    icon: Zap,
    color: "bg-amber-500/10 text-[#D4AF37]",
  },
  {
    title: "PRÉ-TREINOS",
    subtitle: "Energia explosiva e foco máximo",
    tag: "Performance",
    href: "/produtos?categoria=pre-treino",
    icon: Sparkles,
    color: "bg-energy-red-600/15 text-energy-red-400",
  },
];

export default function CategoryGrid() {
  return (
    <section aria-labelledby="cat-title" className="stage-raised relative">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="cat-title" className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
            Navegue por Objetivo
          </h2>
        </div>
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] transition-colors duration-200 hover:text-[#E8D8B5]"
        >
          Ver todo o estoque <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.href}
              href={cat.href}
              className="card-dark group relative flex flex-col justify-between rounded-2xl p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-0.5 text-xs font-bold text-[#E8D8B5]">
                    {cat.tag}
                  </span>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.color} transition group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white transition-colors duration-200">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    {cat.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] transition-colors duration-200 group-hover:text-[#E8D8B5]">
                <span>Ver produtos</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
      </div>
    </section>
  );
}
