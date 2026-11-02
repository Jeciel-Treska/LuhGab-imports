"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
  LogOut,
  Pin,
  RotateCcw,
  Search,
  Shuffle,
  X,
} from "lucide-react";
import Switch from "@/components/admin/Switch";
import ProductThumb from "@/components/ProductThumb";
import { formatBRL } from "@/lib/format";
import type { HeroMode, ProductOverride, StoreConfig } from "@/types/store";

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl?: string;
  color: string;
  type: "whey-tub" | "creatine-jar" | "capsule-bottle" | "cutout";
  inStock: boolean;
  /** Valores originais do código, antes de qualquer edição. */
  base: { price: number; originalPrice: number; isFeatured: boolean; isBestSeller: boolean };
}

type Filter = "all" | "featured" | "bestseller" | "edited";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "featured", label: "Destaques" },
  { id: "bestseller", label: "Mais vendidos" },
  { id: "edited", label: "Alterados" },
];

const normalize = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const fmt = (n: number) => n.toFixed(2).replace(".", ",");

function parseMoney(text: string): number | null {
  const clean = text.replace(/[^\d.,]/g, "");
  if (!clean) return null;
  const n = Number(clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean);
  return Number.isFinite(n) && n > 0 && n < 1_000_000 ? Math.round(n * 100) / 100 : null;
}

const stable = (c: StoreConfig) =>
  JSON.stringify({
    hero: c.hero,
    products: Object.fromEntries(Object.entries(c.products).sort(([a], [b]) => a.localeCompare(b))),
  });

function effective(p: AdminProduct, draft: StoreConfig) {
  const o = draft.products[p.id] ?? {};
  const price = o.price ?? p.base.price;
  const originalPrice = o.originalPrice ?? p.base.originalPrice;
  return {
    price,
    originalPrice,
    isFeatured: o.isFeatured ?? p.base.isFeatured,
    isBestSeller: o.isBestSeller ?? p.base.isBestSeller,
    discount: Math.max(0, Math.round((1 - price / originalPrice) * 100)),
  };
}

// ---------------------------------------------------------------------------
// Campo de preço (aceita "89,90"; confirma ao sair do campo)
// ---------------------------------------------------------------------------

function PriceInput({
  id,
  label,
  value,
  invalid,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  invalid?: boolean;
  onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(fmt(value));
  const [bad, setBad] = useState(false);

  useEffect(() => {
    setText(fmt(value));
    setBad(false);
  }, [value]);

  const commit = () => {
    const n = parseMoney(text);
    if (n === null) {
      setBad(true);
      return;
    }
    setBad(false);
    setText(fmt(n));
    if (n !== value) onCommit(n);
  };

  const hasError = bad || invalid;
  return (
    <div>
      <label htmlFor={id} className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <div
        className={`mt-1 flex h-11 items-center rounded-lg border bg-white px-3 transition focus-within:ring-2 ${
          hasError
            ? "border-red-400 focus-within:ring-red-500/20"
            : "border-zinc-300 focus-within:border-emerald-600 focus-within:ring-emerald-600/20"
        }`}
      >
        <span className="mr-1.5 text-sm text-zinc-400">R$</span>
        <input
          id={id}
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          aria-invalid={hasError}
          className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold tabular-nums text-zinc-950 focus:outline-none"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prévia do Hero
// ---------------------------------------------------------------------------

function HeroPreviewCard({
  product,
  draft,
  mode,
  big,
}: {
  product: AdminProduct;
  draft: StoreConfig;
  mode: HeroMode;
  big?: boolean;
}) {
  const e = effective(product, draft);
  return (
    <div
      className={`flex gap-4 rounded-2xl border border-zinc-200 bg-white ${big ? "flex-col p-5 sm:flex-row sm:items-center" : "items-center p-3"}`}
    >
      <ProductThumb
        type={product.type}
        color={product.color}
        productId={product.id}
        imageUrl={product.imageUrl}
        alt={product.name}
        sizes="200px"
        className={`shrink-0 rounded-xl bg-zinc-50 ${big ? "h-44 w-full sm:w-44" : "h-16 w-16"}`}
      />
      <div className="min-w-0">
        {big && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {mode === "pinned" ? "No topo da loja agora" : "Possível no topo (sorteio)"}
          </span>
        )}
        <p className={`${big ? "mt-2 text-lg" : "text-sm"} truncate font-semibold text-zinc-950`}>{product.name}</p>
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.brandName}</p>
        {big && (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="text-2xl font-bold tabular-nums text-zinc-950">{formatBRL(e.price)}</span>
            {e.discount > 0 && (
              <>
                <span className="text-sm text-zinc-400 line-through">{formatBRL(e.originalPrice)}</span>
                <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">-{e.discount}%</span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------

export default function AdminDashboard({
  catalog,
  initialConfig,
}: {
  catalog: AdminProduct[];
  initialConfig: StoreConfig;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialConfig);
  const [draft, setDraft] = useState(initialConfig);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const statusTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(statusTimer.current), []);

  const byId = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);
  const dirty = stable(draft) !== stable(saved);

  // Aviso ao sair com alterações não publicadas
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setProduct = (id: string, patch: Partial<ProductOverride>) =>
    setDraft((cur) => {
      const base = byId.get(id)?.base;
      if (!base) return cur;
      const next: ProductOverride = { ...cur.products[id], ...patch };
      // Guarda só o que difere do original, para "restaurar" ser um simples descarte.
      (Object.keys(next) as (keyof ProductOverride)[]).forEach((k) => {
        if (k in base && next[k] === (base as Record<string, unknown>)[k]) delete next[k];
      });
      const products = { ...cur.products };
      if (Object.keys(next).length) products[id] = next;
      else delete products[id];
      return { ...cur, products };
    });

  const setHero = (patch: Partial<StoreConfig["hero"]>) =>
    setDraft((cur) => ({ ...cur, hero: { ...cur.hero, ...patch } }));

  // Validações (espelham as do servidor)
  const rowErrors = useMemo(() => {
    const out = new Map<string, string>();
    for (const p of catalog) {
      const e = effective(p, draft);
      if (e.originalPrice < e.price) out.set(p.id, "O preço original não pode ser menor que o preço de venda.");
    }
    return out;
  }, [catalog, draft]);

  const featuredPool = useMemo(() => catalog.filter((p) => effective(p, draft).isFeatured), [catalog, draft]);

  let heroError = "";
  if (draft.hero.mode === "pinned" && !draft.hero.productId) heroError = "Escolha o produto a ser fixado no Hero.";
  if (draft.hero.mode === "random" && featuredPool.length === 0)
    heroError = "Marque ao menos um produto como Destaque para usar o sorteio.";

  const canSave = dirty && !saving && rowErrors.size === 0 && !heroError;

  const flash = (type: "ok" | "error", message: string) => {
    clearTimeout(statusTimer.current);
    setStatus({ type, message });
    if (type === "ok") statusTimer.current = setTimeout(() => setStatus(null), 4000);
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        flash("error", (data as { error?: string }).error ?? "Não foi possível salvar.");
      } else {
        setSaved(data as StoreConfig);
        setDraft(data as StoreConfig);
        flash("ok", "Alterações publicadas na loja.");
        router.refresh();
      }
    } catch {
      flash("error", "Sem conexão. Tente novamente.");
    }
    setSaving(false);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  };

  // Lista filtrada
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return catalog.filter((p) => {
      const e = effective(p, draft);
      if (filter === "featured" && !e.isFeatured) return false;
      if (filter === "bestseller" && !e.isBestSeller) return false;
      if (filter === "edited" && !draft.products[p.id]) return false;
      return !q || normalize(`${p.name} ${p.brandName} ${p.id}`).includes(q);
    });
  }, [catalog, draft, query, filter]);

  const heroProduct =
    draft.hero.mode === "pinned" && draft.hero.productId ? byId.get(draft.hero.productId) : undefined;

  const segment = (mode: HeroMode, label: string, Icon: typeof Pin) => {
    const active = draft.hero.mode === mode;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={() => setHero({ mode })}
        className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
          active ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-950"
        }`}
      >
        <Icon className="h-4 w-4" aria-hidden /> {label}
      </button>
    );
  };

  return (
    <div className="bg-white pb-32 text-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Cabeçalho */}
        <header className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h1 className="font-sans text-2xl font-bold tracking-tight sm:text-3xl">Painel da loja</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {catalog.length} produtos · edite preços, destaques e o produto do topo da loja.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex h-11 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
          >
            Ver loja <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Sair
          </button>
        </header>

        {/* Hero */}
        <section aria-labelledby="hero-title" className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6">
          <h2 id="hero-title" className="font-sans text-lg font-bold">
            Produto do topo da loja (Hero)
          </h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <div role="radiogroup" aria-label="Modo do Hero" className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1">
                {segment("pinned", "Fixar produto", Pin)}
                {segment("random", "Sorteio", Shuffle)}
              </div>

              {draft.hero.mode === "pinned" ? (
                <div className="mt-4">
                  <label htmlFor="hero-product" className="block text-[0.6875rem] font-semibold uppercase tracking-wide text-zinc-500">
                    Produto fixado
                  </label>
                  <select
                    id="hero-product"
                    value={draft.hero.productId ?? ""}
                    onChange={(e) => setHero({ productId: e.target.value || null })}
                    className="mt-1 h-12 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  >
                    <option value="">Selecione um produto…</option>
                    {catalog.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.brandName}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-zinc-500">O mesmo produto aparece para todos os visitantes.</p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                  A cada visita, a loja sorteia um dos produtos marcados como <strong>Destaque</strong>. Ative ou
                  desative o Destaque na lista abaixo para controlar o grupo sorteado.
                </p>
              )}

              {heroError && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {heroError}
                </p>
              )}
            </div>

            <div aria-live="polite">
              {draft.hero.mode === "pinned" ? (
                heroProduct ? (
                  <HeroPreviewCard product={heroProduct} draft={draft} mode="pinned" big />
                ) : (
                  <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
                    Nenhum produto selecionado.
                  </div>
                )
              ) : (
                <div>
                  <p className="mb-2 text-sm font-semibold text-zinc-700">
                    Grupo do sorteio · {featuredPool.length} {featuredPool.length === 1 ? "produto" : "produtos"}
                  </p>
                  <ul className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                    {featuredPool.map((p) => (
                      <li key={p.id}>
                        <HeroPreviewCard product={p} draft={draft} mode="random" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Produtos */}
        <section aria-labelledby="products-title" className="mt-10">
          <h2 id="products-title" className="font-sans text-lg font-bold">
            Produtos
          </h2>

          <div className="sticky top-0 z-20 -mx-4 mt-3 bg-white/95 px-4 pb-3 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden />
              <label htmlFor="admin-search" className="sr-only">
                Buscar produto
              </label>
              <input
                id="admin-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome ou marca…"
                className="h-12 w-full rounded-xl border border-zinc-300 bg-white pl-11 pr-11 text-base focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                    filter === f.id
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-950"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto shrink-0 pl-2 text-xs text-zinc-500" aria-live="polite">
                {visible.length} de {catalog.length}
              </span>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
              Nenhum produto encontrado{query ? ` para "${query}"` : ""}.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {visible.map((p) => {
                const e = effective(p, draft);
                const edited = Boolean(draft.products[p.id]);
                const isHero = draft.hero.mode === "pinned" && draft.hero.productId === p.id;
                const error = rowErrors.get(p.id);
                return (
                  <li key={p.id}>
                    <article className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <ProductThumb
                          type={p.type}
                          color={p.color}
                          productId={p.id}
                          imageUrl={p.imageUrl}
                          alt={p.name}
                          sizes="96px"
                          className="h-16 w-16 shrink-0 rounded-xl bg-zinc-50 sm:h-20 sm:w-20"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-sans text-[0.9375rem] font-semibold leading-snug">{p.name}</h3>
                          <p className="text-xs uppercase tracking-wide text-zinc-500">{p.brandName}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {isHero && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-bold text-emerald-700">
                                No Hero
                              </span>
                            )}
                            {e.discount > 0 && (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.6875rem] font-bold text-red-700">
                                -{e.discount}% OFF
                              </span>
                            )}
                            {edited && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-700">
                                Alterado
                              </span>
                            )}
                            {!p.inStock && (
                              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[0.6875rem] font-bold text-zinc-600">
                                Sem estoque
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
                        <PriceInput
                          id={`price-${p.id}`}
                          label="Preço"
                          value={e.price}
                          invalid={Boolean(error)}
                          onCommit={(n) => setProduct(p.id, { price: n })}
                        />
                        <PriceInput
                          id={`orig-${p.id}`}
                          label="Preço original"
                          value={e.originalPrice}
                          invalid={Boolean(error)}
                          onCommit={(n) => setProduct(p.id, { originalPrice: n })}
                        />
                      </div>
                      {error && (
                        <p role="alert" className="mt-2 text-sm text-red-600">
                          {error}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-zinc-100 pt-3">
                        <Switch label="Destaque" checked={e.isFeatured} onChange={(v) => setProduct(p.id, { isFeatured: v })} />
                        <Switch label="Mais vendido" checked={e.isBestSeller} onChange={(v) => setProduct(p.id, { isBestSeller: v })} />
                        <div className="ml-auto flex items-center gap-1">
                          {!isHero && (
                            <button
                              type="button"
                              onClick={() => setHero({ mode: "pinned", productId: p.id })}
                              className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                            >
                              <Pin className="h-4 w-4" aria-hidden /> Usar no Hero
                            </button>
                          )}
                          {edited && (
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((cur) => {
                                  const products = { ...cur.products };
                                  delete products[p.id];
                                  return { ...cur, products };
                                })
                              }
                              className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden /> Restaurar
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Barra de publicação */}
      {(dirty || status) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
            <p
              role={status?.type === "error" ? "alert" : "status"}
              className={`mr-auto flex items-center gap-2 text-sm font-medium ${
                status?.type === "error" ? "text-red-600" : status ? "text-emerald-700" : "text-zinc-600"
              }`}
            >
              {status?.type === "ok" ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              ) : status?.type === "error" ? (
                <AlertCircle className="h-5 w-5" aria-hidden />
              ) : null}
              {status?.message ?? "Você tem alterações não publicadas."}
            </p>
            {dirty && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(saved);
                    setStatus(null);
                  }}
                  disabled={saving}
                  className="h-12 rounded-lg px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSave}
                  className="flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />}
                  Publicar na loja
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
