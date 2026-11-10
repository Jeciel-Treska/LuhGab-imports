"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { buildWhatsAppUrl } from "@/data/site";
import { formatBRL } from "@/lib/format";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const NAV_LINKS = [
  { label: "Destaques", href: "/#destaques" },
  { label: "Whey & Proteínas", href: "/produtos?categoria=proteina" },
  { label: "Creatinas", href: "/produtos?categoria=creatina" },
  { label: "Pré-Treinos", href: "/produtos?categoria=pre-treino" },
  { label: "Combos VIP", href: "/montar-combo" },
];

export default function Navbar() {
  const router = useRouter();
  const { itemCount, total, toggleCart } = useCart();
  const { favorites } = useWishlist();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/produtos?q=${encodeURIComponent(q)}`);
    setDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08080A]/90 backdrop-blur-xl">
        <nav aria-label="Principal" className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 transition hover:opacity-90"
              aria-label="LuhGab Imports - Página inicial"
            >
              <Image
                src="/luhgab-logo-clean.png"
                alt="LuhGab Imports"
                width={200}
                height={160}
                priority
                className="h-11 w-auto rounded-md ring-1 ring-[#D4AF37]/50 shadow-[0_0_22px_-4px_rgba(212,175,55,0.5)] sm:h-12"
              />
              <span className="hidden font-display text-2xl font-black uppercase tracking-tight text-white sm:inline-block">
                LuhGab <span className="font-light text-[#D4AF37]">Imports</span>
              </span>
            </Link>

            {/* Links desktop */}
            <div className="hidden items-center gap-1 xl:gap-2 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#D4AF37] after:transition-transform after:duration-200 after:ease-out hover:text-white hover:after:scale-x-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Busca desktop */}
            <form
              role="search"
              onSubmit={submit}
              className="hidden min-w-[180px] max-w-xs flex-1 items-center rounded-full border border-white/10 bg-[#131318] px-3 py-1.5 transition focus-within:border-[#D4AF37]/70 focus-within:ring-1 focus-within:ring-[#D4AF37]/25 xl:flex"
            >
              <Search className="h-4 w-4 text-[#D4AF37]" />
              <input
                ref={inputRef}
                type="search"
                aria-label="Buscar suplementos"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar suplementos..."
                className="h-8 w-full bg-transparent px-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none"
              />
            </form>

            {/* Ações */}
            <div className="flex items-center gap-2">
              <Link
                href="/favoritos"
                aria-label={`Favoritos (${favorites.length})`}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <a
                href={buildWhatsAppUrl("Olá! Gostaria de tirar uma dúvida sobre suplementos importados.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-[#E8D8B5]/25 sm:flex lg:hidden"
              >
                <WhatsAppIcon className="h-4 w-4 text-emerald-500" />
                <span>WhatsApp VIP</span>
              </a>

              <button
                type="button"
                onClick={toggleCart}
                aria-label={`Carrinho com ${itemCount} itens`}
                className="relative flex h-11 items-center gap-2 btn-red rounded-full px-4 text-xs font-bold uppercase tracking-wider"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">{formatBRL(total)}</span>
                {itemCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold tabular-nums text-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Busca mobile */}
          <form role="search" onSubmit={submit} className="flex pb-3 xl:hidden">
            <input
              type="search"
              aria-label="Buscar suplementos"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você procura hoje? Ex: Whey, Creatina..."
              className="h-11 w-full rounded-l-xl border border-white/10 bg-[#131318] px-4 text-sm text-white placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex h-11 w-12 items-center justify-center btn-gold rounded-r-xl"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </nav>
      </header>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu de Navegação"
            className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r border-white/10 bg-[#0E0E12] p-6 shadow-2xl transition-transform"
          >
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-display text-2xl font-black uppercase text-white">
                LuhGab Imports
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex flex-1 flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/5 hover:text-[#E8D8B5]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-6">
              <a
                href={buildWhatsAppUrl("Olá! Vim pelo menu do site.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-emerald-500"
              >
                <WhatsAppIcon className="h-5 w-5 text-white" />
                Falar no WhatsApp
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
