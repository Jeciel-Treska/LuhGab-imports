"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronUp,
  Lock,
  Minus,
  PiggyBank,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useCart } from "@/context/CartContext";
import { getComboCandidates, getProductById } from "@/data/products";
import { buildWhatsAppUrl, PIX_DISCOUNT_PERCENT } from "@/data/site";
import { formatBRL } from "@/lib/format";
import type { ComboRole, Product } from "@/types/product";

interface Variant {
  flavorId: string;
  sizeId: string;
}

const STEPS: { role: ComboRole; title: string; short: string; subtitle: string }[] = [
  { role: "protein", title: "Proteínas", short: "Proteínas", subtitle: "Whey Isolado, Concentrado e 3W" },
  { role: "energy", title: "Energia & Força", short: "Energia", subtitle: "Creatina e Pré-Treino" },
  { role: "health", title: "Saúde & Vitalidade", short: "Saúde", subtitle: "Vitaminas, Minerais e Ômega 3" },
];

/** Desconto progressivo pelo total de itens (unidades) no combo. */
const TIERS = [
  { min: 2, pct: 10, label: "2 itens" },
  { min: 3, pct: 15, label: "3 itens" },
  { min: 4, pct: 20, label: "4+ itens · VIP" },
] as const;
const MAX_QTY = 10;

const discountFor = (count: number) =>
  TIERS.reduce((pct, tier) => (count >= tier.min ? tier.pct : pct), 0);

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function defaultVariant(product: Product): Variant | null {
  const flavor = product.flavors.find((f) => f.inStock);
  const size = product.sizes.find((s) => s.inStock);
  return flavor && size ? { flavorId: flavor.id, sizeId: size.id } : null;
}

function Stepper({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-[#0E0E12]">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label={`Diminuir quantidade de ${label}`}
        className="flex h-10 w-10 items-center justify-center rounded-l-xl text-zinc-300 transition hover:bg-white/10"
      >
        {value <= 1 ? <Trash2 className="h-4 w-4" aria-hidden /> : <Minus className="h-4 w-4" aria-hidden />}
      </button>
      <span className="w-8 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Aumentar quantidade de ${label}`}
        className="flex h-10 w-10 items-center justify-center rounded-r-xl text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

const selectCls =
  "h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0E0E12] px-2 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/10";

export default function ComboBuilder() {
  const { addCombo } = useCart();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [variants, setVariants] = useState<Record<string, Variant>>({});
  const [tab, setTab] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const variantOf = (product: Product): Variant | null => variants[product.id] ?? defaultVariant(product);

  const chosen = Object.entries(qty).flatMap(([id, quantity]) => {
    const product = getProductById(id);
    const v = product && variantOf(product);
    const flavor = product?.flavors.find((f) => f.id === v?.flavorId);
    const size = product?.sizes.find((s) => s.id === v?.sizeId);
    return product && flavor && size && quantity > 0 ? [{ quantity, product, flavor, size }] : [];
  });

  const count = chosen.reduce((sum, c) => sum + c.quantity, 0);
  const discountPct = discountFor(count);
  // Mesmo cálculo por linha do carrinho, para os totais coincidirem ao centavo.
  const unit = (c: (typeof chosen)[number]) => round2(c.product.price * c.size.priceMultiplier);
  const original = round2(chosen.reduce((sum, c) => sum + unit(c) * c.quantity, 0));
  const final = round2(
    chosen.reduce((sum, c) => sum + round2(unit(c) * (1 - discountPct / 100) * c.quantity), 0),
  );
  const pixFinal = round2(final * (1 - PIX_DISCOUNT_PERCENT / 100));
  const savings = round2(original - final);

  const nextTier = TIERS.find((t) => count < t.min);
  const missing = nextTier ? nextTier.min - count : 0;
  const nudge = !nextTier
    ? "Desconto VIP de 20% ativado!"
    : count === 0
      ? "Adicione 2 itens e ganhe 10% OFF"
      : `Falta${missing === 1 ? "" : "m"} ${missing} ${missing === 1 ? "item" : "itens"} para ${nextTier.pct}% OFF${nextTier.pct === 20 ? " VIP" : ""}`;
  const progress = Math.min(100, Math.round((count / TIERS[TIERS.length - 1].min) * 100));

  const setQuantity = (productId: string, quantity: number) =>
    setQty((prev) => {
      const next = { ...prev };
      if (quantity < 1) delete next[productId];
      else next[productId] = Math.min(MAX_QTY, quantity);
      return next;
    });

  const setVariant = (product: Product, patch: Partial<Variant>) => {
    const current = variantOf(product);
    if (current) setVariants((prev) => ({ ...prev, [product.id]: { ...current, ...patch } }));
  };

  const addToCart = () => {
    addCombo(
      chosen.map(({ quantity, product, flavor, size }) => ({ product, flavor, size, quantity })),
      discountPct,
    );
    setSheetOpen(false);
  };

  const goToTab = (i: number) => {
    setTab(i);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (tab + dir + STEPS.length) % STEPS.length;
    setTab(next);
    (tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next])?.focus();
  };

  const showSummary = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      asideRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setSheetOpen(true);
    }
  };

  const whatsappUrl = buildWhatsAppUrl(
    [
      "Olá! Quero finalizar este combo:",
      ...chosen.map(
        (c) => `• ${c.quantity}x ${c.product.name} (${c.flavor.name}, ${c.size.label}) - ${formatBRL(unit(c))}`,
      ),
      `Desconto do combo: ${discountPct}%`,
      `Total no Pix: ${formatBRL(pixFinal)}`,
      `Total no cartão: ${formatBRL(final)}`,
    ].join("\n"),
  );

  const stepCount = (role: ComboRole) =>
    chosen.filter((c) => c.product.comboRole === role).reduce((s, c) => s + c.quantity, 0);

  // ---------------------------------------------------------------- Barra de patamares
  const tierBar = (
    <div className="rounded-2xl border border-white/10 bg-[#131318] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-white" aria-live="polite">
          {nudge}
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            discountPct > 0 ? "bg-[#D4AF37] text-black" : "bg-white/5 text-zinc-400"
          }`}
        >
          {discountPct > 0 ? `${discountPct}% OFF ativo` : "Sem desconto ainda"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Progresso do desconto"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
      >
        <div className="h-full rounded-full bg-gradient-to-r from-[#B8942C] to-[#E6C768] transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {TIERS.map((t) => {
          const on = count >= t.min;
          return (
            <li
              key={t.min}
              className={`flex flex-col items-center rounded-xl border px-1 py-2 text-center transition ${
                on ? "border-[#D4AF37]/70 bg-[#D4AF37]/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span className={`flex items-center gap-1 text-base font-black ${on ? "text-[#D4AF37]" : "text-zinc-400"}`}>
                {on ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Lock className="h-3.5 w-3.5" aria-hidden />}
                {t.pct}%
              </span>
              <span className={`text-[0.6875rem] font-semibold ${on ? "text-white" : "text-zinc-400"}`}>
                {t.label}
              </span>
              <span className={`text-[0.625rem] font-bold uppercase tracking-wide ${on ? "text-[#D4AF37]" : "text-zinc-400"}`}>
                {on ? "Desbloqueado" : "Bloqueado"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  // ---------------------------------------------------------------- Resumo
  const summary = (withBar: boolean) => (
    <>
      <h2 className="font-sans text-lg font-bold text-white">Seu combo</h2>
      {withBar && <div className="mt-4">{tierBar}</div>}

      {chosen.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">Adicione produtos para montar seu combo.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {chosen.map((c) => (
            <li key={c.product.id} className="flex gap-3">
              <ProductThumb
                type={c.product.model3DConfig.type}
                color={c.product.model3DConfig.color}
                productId={c.product.id}
                imageUrl={c.product.imageUrl}
                alt=""
                sizes="56px"
                className="h-14 w-14 shrink-0 rounded-lg bg-[#1a1a20]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{c.product.name}</p>
                <p className="truncate text-xs text-zinc-400">
                  {c.flavor.name} · {c.size.label}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Stepper value={c.quantity} label={c.product.name} onChange={(n) => setQuantity(c.product.id, n)} />
                  <span className="text-sm font-semibold tabular-nums text-zinc-200">
                    {formatBRL(round2(unit(c) * c.quantity))}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
        {savings > 0 && (
          <p className="flex items-center justify-between rounded-xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white">
            <span className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" aria-hidden /> Você economiza
            </span>
            <span className="tabular-nums">{formatBRL(savings)}</span>
          </p>
        )}
        {discountPct > 0 && <p className="text-sm text-zinc-400 line-through">{formatBRL(original)}</p>}
        <p className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-400">No cartão{discountPct > 0 ? ` (${discountPct}% OFF)` : ""}</span>
          <span className="text-2xl font-black tabular-nums text-white">{formatBRL(final)}</span>
        </p>
        {count > 0 && (
          <p className="flex items-baseline justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-300">
            <span>No Pix ({PIX_DISCOUNT_PERCENT}% OFF)</span>
            <span className="text-base tabular-nums text-emerald-400">{formatBRL(pixFinal)}</span>
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={addToCart}
        disabled={count === 0}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl btn-red text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:!bg-none disabled:!bg-white/10 disabled:!text-zinc-400 disabled:!shadow-none"
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        Adicionar ao carrinho
      </button>
      <a
        href={count === 0 ? undefined : whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={count === 0}
        className={`mt-2 flex h-11 w-full items-center justify-center gap-2 press rounded-xl bg-emerald-600 text-sm font-bold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-emerald-500 ${
          count === 0 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <WhatsAppIcon className="h-4 w-4" aria-hidden />
        Finalizar pelo WhatsApp
      </a>
    </>
  );

  const step = STEPS[tab];
  const candidates = getComboCandidates(step.role);
  const isLast = tab === STEPS.length - 1;

  return (
    <section
      id="combo"
      aria-labelledby="combo-title"
      className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-10 pb-36 sm:px-6 lg:pb-10"
    >
      <header className="mb-6">
        <h1 id="combo-title" className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
          Monte seu combo
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">
          Escolha em cada etapa quantos produtos quiser. Quanto mais itens, maior o desconto: até 20% OFF.
        </p>
      </header>

      <div className="mb-6">{tierBar}</div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {/* Abas */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Etapas do combo"
            className="sticky top-0 z-20 -mx-4 grid scroll-mt-16 grid-cols-3 gap-1 border-b border-white/10 bg-[#0E0E12]/95 p-2 backdrop-blur sm:mx-0 sm:border-white/10 sm:rounded-2xl sm:border"
          >
            {STEPS.map((s, i) => {
              const active = tab === i;
              const n = stepCount(s.role);
              return (
                <button
                  key={s.role}
                  type="button"
                  role="tab"
                  id={`tab-${s.role}`}
                  aria-selected={active}
                  aria-controls={`panel-${s.role}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTab(i)}
                  onKeyDown={onTabKey}
                  className={`relative flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition ${
                    active ? "bg-red-600 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold leading-tight">
                    <span className="hidden sm:inline">{i + 1}.</span>
                    <span className="sm:hidden">{s.short}</span>
                    <span className="hidden sm:inline">{s.title}</span>
                    {n > 0 && (
                      <span
                        className="flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[0.6875rem] font-bold text-black"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> {n}
                      </span>
                    )}
                  </span>
                  <span className={`mt-0.5 hidden text-xs sm:block ${active ? "text-zinc-300" : "text-zinc-400"}`}>
                    {s.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Painel da aba */}
          <div
            role="tabpanel"
            id={`panel-${step.role}`}
            aria-labelledby={`tab-${step.role}`}
            tabIndex={0}
            className="mt-6 focus:outline-none"
          >
            <p className="mb-4 text-sm text-zinc-400 sm:hidden">{step.subtitle}</p>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {candidates.map((product) => {
                const quantity = qty[product.id] ?? 0;
                const selected = quantity > 0;
                const v = variantOf(product);
                return (
                  <li key={product.id} className="flex">
                    <article
                      className={`relative flex w-full flex-col rounded-2xl border bg-[#131318] p-4 transition ${
                        selected
                          ? "border-[#D4AF37]/50"
                          : "border-white/10 hover:border-[#D4AF37]/60"
                      }`}
                    >
                      {selected && (
                        <span className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-1 text-xs font-bold text-black shadow-sm">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> No Combo
                        </span>
                      )}
                      <ProductThumb
                        type={product.model3DConfig.type}
                        color={product.model3DConfig.color}
                        productId={product.id}
                        imageUrl={product.imageUrl}
                        alt={product.name}
                        sizes="(min-width: 1280px) 260px, (min-width: 640px) 33vw, 90vw"
                        className="aspect-square w-full rounded-2xl studio [&_img]:drop-shadow-[0_14px_16px_rgba(0,0,0,0.45)]"
                      />
                      <div className="mt-4 flex-1">
                        <span className="inline-block rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[#E8D8B5]">
                          {product.brandName}
                        </span>
                        <h3 className="mt-2 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-white">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xl font-black tabular-nums text-white">{formatBRL(product.price)}</p>
                      </div>

                      {v && (
                        <div className="mt-3 flex gap-2">
                          <select
                            aria-label={`Sabor de ${product.name}`}
                            value={v.flavorId}
                            onChange={(e) => setVariant(product, { flavorId: e.target.value })}
                            className={selectCls}
                          >
                            {product.flavors.map((f) => (
                              <option key={f.id} value={f.id} disabled={!f.inStock}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                          <select
                            aria-label={`Tamanho de ${product.name}`}
                            value={v.sizeId}
                            onChange={(e) => setVariant(product, { sizeId: e.target.value })}
                            className={selectCls}
                          >
                            {product.sizes.map((s) => (
                              <option key={s.id} value={s.id} disabled={!s.inStock}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="mt-3">
                        {selected ? (
                          <div className="flex items-center justify-between gap-2">
                            <Stepper value={quantity} label={product.name} onChange={(n) => setQuantity(product.id, n)} />
                            <button
                              type="button"
                              onClick={() => setQuantity(product.id, 0)}
                              className="h-10 rounded-lg px-2 text-xs font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => v && setQuantity(product.id, 1)}
                            disabled={!v}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-sm font-bold text-white transition-colors duration-200 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:text-zinc-400 disabled:hover:bg-transparent"
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                            {v ? "Adicionar ao Combo" : "Indisponível"}
                          </button>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              {tab > 0 ? (
                <button
                  type="button"
                  onClick={() => goToTab(tab - 1)}
                  className="h-12 rounded-xl px-4 text-sm font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={isLast ? showSummary : () => goToTab(tab + 1)}
                className="flex h-12 items-center gap-2 btn-red rounded-xl px-6 text-sm font-bold"
              >
                {isLast ? "Ver Resumo do Combo" : `Avançar para ${STEPS[tab + 1].title}`}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <aside
          ref={asideRef}
          aria-label="Resumo do combo"
          className="hidden h-fit rounded-2xl border border-white/10 bg-[#131318] p-5 lg:sticky lg:top-24 lg:block"
        >
          {summary(false)}
        </aside>
      </div>

      {/* Mobile: Smart Dock + gaveta de detalhes */}
      <div className="lg:hidden">
        <div
          aria-hidden={!sheetOpen}
          className={`fixed inset-0 z-50 flex flex-col justify-end transition-[opacity,visibility] duration-300 ${
            sheetOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <button
            type="button"
            tabIndex={sheetOpen ? 0 : -1}
            aria-label="Fechar resumo"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resumo do combo"
            className={`relative max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0E0E12] p-5 shadow-2xl transition-transform duration-300 [padding-bottom:max(1.25rem,env(safe-area-inset-bottom))] ${
              sheetOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-white/20" />
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            {summary(true)}
          </div>
        </div>

        <div
          className={`fixed inset-x-3 bottom-3 z-40 transition-[transform,opacity] duration-300 ease-out [margin-bottom:env(safe-area-inset-bottom)] ${
            count > 0 && !sheetOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0E0E12]/95 p-2.5 pl-3 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label="Ver detalhes do combo"
              tabIndex={count > 0 && !sheetOpen ? 0 : -1}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="flex shrink-0 -space-x-3">
                {chosen.slice(0, 3).map((c) => (
                  <ProductThumb
                    key={c.product.id}
                    type={c.product.model3DConfig.type}
                    color={c.product.model3DConfig.color}
                    productId={c.product.id}
                    imageUrl={c.product.imageUrl}
                    alt=""
                    sizes="44px"
                    className="h-11 w-11 rounded-full border-2 border-[#0E0E12] bg-[#1c1c22]"
                  />
                ))}
                {chosen.length > 3 && (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0E0E12] bg-[#D4AF37] text-xs font-bold text-black">
                    +{chosen.length - 3}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
                  {count} {count === 1 ? "item" : "itens"}
                  {discountPct > 0 && <span className="text-[#D4AF37]">· {discountPct}% OFF</span>}
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="block truncate text-base font-black tabular-nums text-white">
                  {formatBRL(final)}
                  {savings > 0 && (
                    <span className="ml-1.5 text-xs font-bold text-emerald-400">−{formatBRL(savings)}</span>
                  )}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={addToCart}
              tabIndex={count > 0 && !sheetOpen ? 0 : -1}
              className="flex h-12 shrink-0 items-center gap-2 btn-red rounded-xl px-4 text-sm font-bold"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
