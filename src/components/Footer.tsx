import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Lock, MessageCircle, Truck } from "lucide-react";
import { buildWhatsAppUrl } from "@/data/site";

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
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      {/* Ofertas pelo WhatsApp */}
      <section aria-labelledby="newsletter-title" className="border-b border-zinc-800 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:flex-row">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Clube LuhGab VIP
            </span>
            <h2 id="newsletter-title" className="mt-1 font-display text-2xl font-black uppercase text-white sm:text-3xl">
              Receba ofertas e novidades pelo WhatsApp
            </h2>
          </div>
          <a
            href={buildWhatsAppUrl("Olá! Quero receber as ofertas da LuhGab Imports pelo WhatsApp.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
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
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
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
                      className="transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="transition hover:text-white">
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
      <div className="border-t border-zinc-900 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-400 sm:px-6 md:flex-row">
          <div className="flex flex-wrap items-center gap-6">
            {SECURITY.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-emerald-400" /> {label}
              </span>
            ))}
          </div>
          <p>© {new Date().getFullYear()} LuhGab Imports. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
