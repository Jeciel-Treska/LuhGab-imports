import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Lock, Truck } from "lucide-react";
import { buildWhatsAppUrl } from "@/data/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Institucional",
    links: [
      { label: "Sobre a LuhGab", href: "/sobre" },
      { label: "Nossas Marcas", href: "/marcas" },
      { label: "Montador de Combo", href: "/montar-combo" },
      { label: "Autenticidade e Laudos", href: "/autenticidade" },
    ],
  },
  {
    title: "Categorias",
    links: [
      { label: "Whey Protein", href: "/produtos?categoria=proteina" },
      { label: "Creatina", href: "/produtos?categoria=creatina" },
      { label: "Pré-Treino", href: "/produtos?categoria=pre-treino" },
      { label: "Termogênicos", href: "/produtos?categoria=termogenicos" },
      { label: "Vitaminas & Saúde", href: "/produtos?categoria=vitaminas" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Central de Ajuda", href: "/ajuda" },
      { label: "Rastrear Pedido", href: "/rastreio" },
      { label: "Fale no WhatsApp", href: buildWhatsAppUrl(), external: true },
    ],
  },
  {
    title: "Segurança",
    links: [
      { label: "Política de Privacidade", href: "/politica-de-privacidade" },
      { label: "Termos de Uso", href: "/termos-de-uso" },
    ],
  },
];

const SECURITY = [
  { icon: Lock, label: "Conexão Segura" },
  { icon: BadgeCheck, label: "100% Originais com Laudo" },
  { icon: Truck, label: "Envio Rápido Rastreado" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#060608] text-zinc-400">
      {/* Ofertas pelo WhatsApp */}
      <section aria-labelledby="newsletter-title" className="border-b border-white/10 bg-[#0E0E12] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row">
          <div>
            <h2 id="newsletter-title" className="font-display text-2xl font-black uppercase text-white sm:text-3xl">
              Receba ofertas e novidades pelo WhatsApp
            </h2>
          </div>
          <a
            href={buildWhatsAppUrl("Olá! Quero receber as ofertas da LuhGab Imports pelo WhatsApp.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-500"
          >
            <WhatsAppIcon className="h-4 w-4" aria-hidden />
            Quero receber ofertas
          </a>
        </div>
      </section>

      {/* Grid Principal */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="flex flex-col items-start gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="LuhGab Imports - Página inicial">
            <Image
              src="/luhgab-logo-clean.png"
              alt="LuhGab Imports"
              width={160}
              height={120}
              className="h-12 w-auto rounded"
            />
            <span className="font-display text-2xl font-black uppercase text-white">
              LuhGab Imports
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
            Suplementos esportivos nacionais e importados, 100% originais, com entrega para todo o Brasil.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-200">
              {column.title}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="transition-colors duration-200 hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Selos & Copyright */}
      <div className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-400 sm:px-6 md:flex-row">
          <div className="flex flex-wrap items-center gap-6">
            {SECURITY.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-[#C9A55C]" /> {label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <p>© {new Date().getFullYear()} LuhGab Imports. Todos os direitos reservados.</p>
            <Link
              href="/admin"
              title="Painel do Lojista"
              className="inline-flex min-h-[44px] items-center gap-1.5 text-zinc-400 transition-colors duration-200 hover:text-white md:min-h-0"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden /> Área do Lojista
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
