"use client";

import { useState } from "react";
import { Check, ChevronUp, Minus, PiggyBank, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useCart } from "@/context/CartContext";
import { getComboCandidates, getProductById } from "@/data/products";
import { buildWhatsAppUrl, PIX_DISCOUNT_PERCENT } from "@/data/site";
import { formatBRL } from "@/lib/format";
import type { ComboRole, Product } from "@/types/product";

/** Uma linha do combo: um produto com sabor, tamanho e quantidade. */
interface Line {
  productId: string;
  flavorId: string;
  sizeId: string;
  quantity: number;
}

const STEPS: { role: ComboRole; title: string; hint: string }[] = [
  { role: "protein", title: "Proteína", hint: "Whey Concentrado, Isolado ou 3W" },
  { role: "energy", title: "Energia e Força", hint: "Creatina ou Pré-Treino" },
  { role: "health", title: "Saúde e Recuperação", hint: "Multivitamínico, Vitamina D3 ou Ômega 3" },
];

/** Desconto progressivo pelo total de itens (unidades) no combo. */
const TIERS = [
  { min: 2, pct: 10 },
  { min: 3, pct: 15 },
  { min: 4, pct: 20 },
] as const;
const MAX_QTY = 10;

const discountFor = (count: number) =>
  TIERS.reduce((pct, tier) => (count >= tier.min ? tier.pct : pct), 0);

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function defaultLine(product: Product): Line | null {
  const flavor = product.flavors.find((f) => f.inStock);
  const size = product.sizes.find((s) => s.inStock);
  return flavor && size
    ? { productId: product.id, flavorId: flavor.id, sizeId: size.id, quantity: 1 }
    : null;
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
    <div className="inline-flex h-9 items-center rounded-lg border border-zinc-300 bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label={`Diminuir quantidade de ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-zinc-700 transition hover:bg-zinc-100"
      >
        {value <= 1 ? <Trash2 className="h-4 w-4" aria-hidden /> : <Minus className="h-4 w-4" aria-hidden />}
      </button>
      <span className="w-7 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Aumentar quantidade de ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export default function ComboBuilder() {
  const { addCombo } = useCart();
  const [lines, setLines] = useState<Line[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const chosen = lines.flatMap((line) => {
    const product = getProductById(line.productId);
    const flavor = product?.flavors.find((f) => f.id === line.flavorId);
    const size = product?.sizes.find((s) => s.id === line.sizeId);
    return product && flavor && size ? [{ line, product, flavor, size }] : [];
  });

  const count = chosen.reduce((sum, c) => sum + c.line.quantity, 0);
  const discountPct = discountFor(count);
  // Mesmo cálculo por linha do carrinho, para os totais coincidirem ao centavo.
  const unit = (c: (typeof chosen)[number]) => round2(c.product.price * c.size.priceMultiplier);
  const original = round2(chosen.reduce((sum, c) => sum + unit(c) * c.line.quantity, 0));
  const final = round2(
    chosen.reduce((sum, c) => sum + round2(unit(c) * (1 - discountPct / 100) * c.line.quantity), 0),
  );
  const pixFinal = round2(final * (1 - PIX_DISCOUNT_PERCENT / 100));
  const savings = round2(original - final);

  const nextTier = TIERS.find((t) => count < t.min);
  const missing = nextTier ? nextTier.min - count : 0;
  const nudge = !nextTier
    ? "Desconto máximo de 20% OFF liberado!"
    : count === 0
      ? "Adicione 2 itens para ganhar 10% OFF"
      : nextTier.pct === 20
        ? `Mais ${missing} para o desconto VIP de 20% OFF!`
        : `Adicione mais ${missing} ${missing === 1 ? "item" : "itens"} para ${nextTier.pct}% OFF`;
  const progress = Math.min(100, Math.round((count / TIERS[TIERS.length - 1].min) * 100));

  const patchLine = (productId: string, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l)));

  const add = (product: Product) =>
    setLines((prev) => {
      if (prev.some((l) => l.productId === product.id)) return prev;
      const line = defaultLine(product);
      return line ? [...prev, line] : prev;
    });

  const setQty = (productId: string, quantity: number) =>
    setLines((prev) =>
      quantity < 1
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
    );

  const addToCart = () => {
    addCombo(
      chosen.map(({ line, product, flavor, size }) => ({ product, flavor, size, quantity: line.quantity })),
      discountPct,
    );
    setSheetOpen(false);
  };

  const whatsappUrl = buildWhatsAppUrl(
    [
      "Olá! Quero finalizar este combo:",
      ...chosen.map(
        ({ line, product, flavor, size }) =>
          `• ${line.quantity}x ${product.name} (${flavor.name}, ${size.label}) - ${formatBRL(unit({ line, product, flavor, size }))}`,
      ),
      `Desconto do combo: ${discountPct}%`,
      `Total no Pix: ${formatBRL(pixFinal)}`,
      `Total no cartão: ${formatBRL(final)}`,
    ].join("\n"),
  );

  const selectCls =
    "min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-1.5 py-1.5 text-xs text-zinc-800 focus:border-emerald-600 focus:outline-none";

  const progressBar = (
    <div>
      <p className="text-sm font-bold text-zinc-950">{nudge}</p>
      <div
        role="progressbar"
        aria-label="Progresso do desconto"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200"
      >
        <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[0.6875rem] font-semibold">
        {TIERS.map((t) => (
          <span
            key={t.min}
            className={`rounded-md px-1 py-1 ${count >= t.min ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-500"}`}
          >
            {t.min}
            {t.min === 4 ? "+" : ""} itens · {t.pct}%
          </span>
        ))}
      </div>
    </div>
  );

  const summary = (
    <>
      <h2 className="font-sans text-lg font-bold text-zinc-950">Resumo do combo</h2>
      <div className="mt-4">{progressBar}</div>

      {chosen.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">Adicione produtos para montar seu combo.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {chosen.map(({ line, product, flavor, size }) => (
            <li key={product.id} className="flex gap-3">
              <ProductThumb
                type={product.model3DConfig.type}
                color={product.model3DConfig.color}
                productId={product.id}
                imageUrl={product.imageUrl}
                alt=""
                sizes="56px"
                className="h-14 w-14 shrink-0 rounded-lg bg-zinc-50"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p>
                <div className="mt-1 flex gap-2">
                  <select
                    aria-label={`Sabor de ${product.name}`}
                    value={flavor.id}
                    onChange={(e) => patchLine(product.id, { flavorId: e.target.value })}
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
                    value={size.id}
                    onChange={(e) => patchLine(product.id, { sizeId: e.target.value })}
                    className={selectCls}
                  >
                    {product.sizes.map((s) => (
                      <option key={s.id} value={s.id} disabled={!s.inStock}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Stepper value={line.quantity} label={product.name} onChange={(n) => setQty(product.id, n)} />
                  <span className="text-sm font-semibold tabular-nums text-zinc-800">
                    {formatBRL(round2(unit({ line, product, flavor, size }) * line.quantity))}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4">
        {discountPct > 0 && (
          <p className="text-sm text-zinc-500 line-through">{formatBRL(original)}</p>
        )}
        <p className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-600">
            No cartão{discountPct > 0 ? ` (${discountPct}% OFF)` : ""}
          </span>
          <span className="text-2xl font-black tabular-nums text-zinc-950">{formatBRL(final)}</span>
        </p>
        {count > 0 && (
          <p className="flex items-baseline justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
            <span>No Pix ({PIX_DISCOUNT_PERCENT}% OFF)</span>
            <span className="text-base tabular-nums text-emerald-700">{formatBRL(pixFinal)}</span>
          </p>
        )}
        {savings > 0 && (
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <PiggyBank className="h-4 w-4" aria-hidden />
            Você economiza {formatBRL(savings)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={addToCart}
        disabled={count === 0}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        Adicionar ao carrinho
      </button>
      <a
        href={count === 0 ? undefined : whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={count === 0}
        className={`mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 text-sm font-bold uppercase tracking-wider text-zinc-800 transition hover:border-zinc-950 active:scale-[0.98] ${
          count === 0 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <WhatsAppIcon className="h-4 w-4 text-emerald-600" aria-hidden />
        Finalizar pelo WhatsApp
      </a>
    </>
  );

  return (
    <section
      id="combo"
      aria-labelledby="combo-title"
      className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-10 pb-32 sm:px-6 lg:pb-10"
    >
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Compre junto e economize</p>
        <h1 id="combo-title" className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-zinc-950 sm:text-5xl">
          Monte seu combo
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600">
          Adicione quantos produtos quiser em cada etapa. 2 itens = 10% OFF, 3 itens = 15% OFF e 4 ou mais = 20% OFF,
          calculado em tempo real.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {STEPS.map((step, i) => {
            const candidates = getComboCandidates(step.role);
            const inStep = chosen.filter((c) => c.product.comboRole === step.role);
            const stepQty = inStep.reduce((s, c) => s + c.line.quantity, 0);
            return (
              <div key={step.role}>
                <h2 className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-xs text-white">
                    {i + 1}
                  </span>
                  <span className="text-zinc-950">{step.title}</span>
                  {stepQty > 0 && (
                    <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      {stepQty} {stepQty === 1 ? "item" : "itens"}
                    </span>
                  )}
                </h2>
                <p className="mb-4 mt-1 pl-10 text-xs text-zinc-500">{step.hint}</p>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {candidates.map((product) => {
                    const line = lines.find((l) => l.productId === product.id);
                    const selected = Boolean(line);
                    return (
                      <li key={product.id} className="flex">
                        <article
                          className={`relative flex w-full flex-col rounded-2xl border bg-white p-3 shadow-sm transition ${
                            selected ? "border-emerald-600 ring-1 ring-emerald-600/30" : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          {selected && (
                            <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[0.6875rem] font-bold text-white">
                              <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> No combo
                            </span>
                          )}
                          <ProductThumb
                            type={product.model3DConfig.type}
                            color={product.model3DConfig.color}
                            productId={product.id}
                            imageUrl={product.imageUrl}
                            alt={product.name}
                            sizes="(min-width: 1280px) 220px, (min-width: 640px) 33vw, 90vw"
                            className="aspect-square w-full rounded-xl bg-zinc-50"
                          />
                          <div className="mt-3 flex-1">
                            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-zinc-500">
                              {product.brandName}
                            </p>
                            <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-zinc-950">
                              {product.name}
                            </h3>
                            <p className="mt-1 text-lg font-black tabular-nums text-zinc-950">
                              {formatBRL(product.price)}
                            </p>
                          </div>
                          <div className="mt-3">
                            {line ? (
                              <div className="flex items-center justify-between gap-2">
                                <Stepper value={line.quantity} label={product.name} onChange={(n) => setQty(product.id, n)} />
                                <button
                                  type="button"
                                  onClick={() => setQty(product.id, 0)}
                                  className="h-9 rounded-lg px-2 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                                >
                                  Remover
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => add(product)}
                                disabled={!defaultLine(product)}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                              >
                                <Plus className="h-4 w-4" aria-hidden />
                                {defaultLine(product) ? "Adicionar ao Combo" : "Indisponível"}
                              </button>
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <aside
          aria-label="Resumo do combo"
          className="hidden h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block"
        >
          {summary}
        </aside>
      </div>

      {/* Mobile: barra fixa + resumo expansível */}
      <div className="lg:hidden">
        {sheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Resumo do combo">
            <button
              type="button"
              aria-label="Fechar resumo"
              onClick={() => setSheetOpen(false)}
              className="absolute inset-0 bg-zinc-950/50"
            />
            <div className="relative max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl [padding-bottom:max(1.25rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Fechar"
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              {summary}
            </div>
          </div>
        )}
        {!sheetOpen && count > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-label="Ver resumo do combo"
                className="min-w-0 flex-1 text-left"
              >
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-500">
                  {count} {count === 1 ? "item" : "itens"}
                  {discountPct > 0 && <span className="text-emerald-700">· {discountPct}% OFF</span>}
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-lg font-black tabular-nums text-zinc-950">{formatBRL(final)}</span>
                  {savings > 0 && (
                    <span className="text-xs font-bold text-emerald-700">Economia {formatBRL(savings)}</span>
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={addToCart}
                className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Adicionar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
