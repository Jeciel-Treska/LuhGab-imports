"use client";

import { useState } from "react";
import { Check, MessageCircle, PiggyBank, ShoppingBag } from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import { useCart } from "@/context/CartContext";
import { getComboCandidates, getProductById } from "@/data/products";
import { buildWhatsAppUrl, PIX_DISCOUNT_PERCENT } from "@/data/site";
import { formatBRL } from "@/lib/format";
import type { ComboRole, Product } from "@/types/product";

interface Selection {
  productId: string;
  flavorId: string;
  sizeId: string;
}

const STEPS: { role: ComboRole; title: string; hint: string }[] = [
  { role: "protein", title: "1. Proteína", hint: "Whey Concentrado, Isolado ou 3W" },
  { role: "energy", title: "2. Energia e Força", hint: "Creatina ou Pré-Treino" },
  { role: "health", title: "3. Saúde e Recuperação", hint: "Multivitamínico, Vitamina D3 ou Ômega 3" },
];

/** Desconto progressivo por quantidade de itens selecionados. */
const DISCOUNT_BY_COUNT = [0, 0, 10, 15];

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function defaultSelection(product: Product): Selection | null {
  const flavor = product.flavors.find((f) => f.inStock);
  const size = product.sizes.find((s) => s.inStock);
  return flavor && size
    ? { productId: product.id, flavorId: flavor.id, sizeId: size.id }
    : null;
}

export default function ComboBuilder() {
  const { addCombo } = useCart();
  const [selections, setSelections] = useState<Record<ComboRole, Selection | null>>({
    protein: null,
    energy: null,
    health: null,
  });

  const chosen = STEPS.flatMap(({ role }) => {
    const sel = selections[role];
    const product = sel && getProductById(sel.productId);
    if (!sel || !product) return [];
    const flavor = product.flavors.find((f) => f.id === sel.flavorId);
    const size = product.sizes.find((s) => s.id === sel.sizeId);
    return flavor && size ? [{ role, product, flavor, size }] : [];
  });

  const count = chosen.length;
  const discountPct = DISCOUNT_BY_COUNT[count];
  // Mesmo cálculo por linha do carrinho, para os totais coincidirem ao centavo.
  const unitPrices = chosen.map((c) => round2(c.product.price * c.size.priceMultiplier));
  const original = round2(unitPrices.reduce((sum, price) => sum + price, 0));
  const final = round2(
    unitPrices.reduce((sum, price) => sum + round2(price * (1 - discountPct / 100)), 0),
  );
  const pixFinal = round2(final * (1 - PIX_DISCOUNT_PERCENT / 100));
  const savings = round2(original - final);

  const toggle = (role: ComboRole, product: Product) => {
    setSelections((prev) => {
      if (prev[role]?.productId === product.id) return { ...prev, [role]: null };
      return { ...prev, [role]: defaultSelection(product) };
    });
  };

  const updateVariant = (role: ComboRole, patch: Partial<Selection>) =>
    setSelections((prev) => {
      const current = prev[role];
      return current ? { ...prev, [role]: { ...current, ...patch } } : prev;
    });

  const addToCart = () => {
    addCombo(
      chosen.map(({ product, flavor, size }) => ({ product, flavor, size, quantity: 1 })),
      discountPct,
    );
  };

  const synergy = Math.round((count / STEPS.length) * 100);

  const whatsappUrl = buildWhatsAppUrl(
    [
      "Olá! Quero finalizar este combo:",
      ...chosen.map(
        ({ product, flavor, size }) =>
          `• ${product.name} (${flavor.name}, ${size.label}) - ${formatBRL(round2(product.price * size.priceMultiplier))}`,
      ),
      `Desconto do combo: ${discountPct}%`,
      `Total no Pix: ${formatBRL(pixFinal)}`,
      `Total no cartão: ${formatBRL(final)}`,
    ].join("\n"),
  );

  return (
    <section
      id="combo"
      aria-labelledby="combo-title"
      className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6"
    >
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-amber-700">Compre junto e economize</p>
        <h1 id="combo-title" className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-4xl">
          Monte seu combo
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600">
          Escolha produtos nas 3 categorias. 2 itens = 10% OFF, 3 itens = 15% OFF, calculado em tempo real.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {STEPS.map((step, i) => {
            const candidates = getComboCandidates(step.role);
            return (
              <div key={step.role}>
                <h3 className="mb-1 flex items-center gap-3 font-mono text-sm font-bold uppercase tracking-widest">
                  <span className="text-amber-700">Passo {i + 1}</span>
                  <span className="text-zinc-900">{step.title}</span>
                  <span
                    role="img"
                    aria-label={selections[step.role] ? "Item escolhido" : "Nenhum item escolhido"}
                    className={`ml-auto h-2 w-2 rounded-full ${
                      selections[step.role]
                        ? "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]"
                        : "bg-zinc-700"
                    }`}
                  />
                </h3>
                <p className="mb-4 text-xs text-zinc-600">{step.hint}</p>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {candidates.map((product) => {
                    const selected = selections[step.role]?.productId === product.id;
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => toggle(step.role, product)}
                          aria-pressed={selected}
                          className={`relative flex w-full items-center gap-3 border bg-white p-3 text-left backdrop-blur transition duration-300 hover:border-gold/60 active:scale-[0.98] ${
                            selected ? "border-gold shadow-gold" : "border-zinc-200"
                          }`}
                        >
                          <ProductThumb
                            type={product.model3DConfig.type}
                            color={product.model3DConfig.color}
                            productId={product.id}
                            imageUrl={product.imageUrl}
                            alt=""
                            sizes="64px"
                            className="h-16 w-16 shrink-0 rounded-lg"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block font-mono text-xs uppercase tracking-wider text-amber-700">
                              {product.brandName}
                            </span>
                            <span className="block truncate text-sm font-medium text-zinc-900">
                              {product.name}
                            </span>
                            <span className="block text-sm font-semibold text-amber-700">
                              {formatBRL(product.price)}
                            </span>
                          </span>
                          {selected && (
                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-dark">
                              <Check className="h-3.5 w-3.5" aria-hidden />
                            </span>
                          )}
                        </button>
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
          className="h-fit border border-gold/30 bg-white p-5 backdrop-blur-xl lg:sticky lg:top-24"
        >
          <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-widest text-amber-700">
            Resumo do combo
          </h3>
          <div className="mb-5">
            <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              <span>Progresso do combo</span>
              <span className="text-amber-700">{synergy}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progresso do combo"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={synergy}
              className="h-2 overflow-hidden bg-zinc-200"
            >
              <div
                className="h-full bg-gradient-gold shadow-[0_0_12px_rgba(212,175,55,0.9)] transition-all duration-700"
                style={{ width: `${synergy}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              <span className={count >= 2 ? "text-amber-700" : ""}>2 itens: -10%</span>
              <span className={count === 3 ? "text-amber-700" : ""}>3 itens: -15%</span>
            </div>
          </div>

          {count === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-600">
              Selecione os produtos ao lado.
            </p>
          ) : (
            <ul className="space-y-4">
              {chosen.map(({ role, product, flavor, size }) => (
                <li key={role} className="flex gap-3">
                  <ProductThumb
                    type={product.model3DConfig.type}
                    color={product.model3DConfig.color}
                    productId={product.id}
                    imageUrl={product.imageUrl}
                    alt=""
                    sizes="56px"
                    className="h-14 w-14 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <div className="mt-1 flex gap-2">
                      <select
                        aria-label={`Sabor de ${product.name}`}
                        value={flavor.id}
                        onChange={(e) => updateVariant(role, { flavorId: e.target.value })}
                        className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-1.5 py-1 text-xs text-zinc-800"
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
                        onChange={(e) => updateVariant(role, { sizeId: e.target.value })}
                        className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-1.5 py-1 text-xs text-zinc-800"
                      >
                        {product.sizes.map((s) => (
                          <option key={s.id} value={s.id} disabled={!s.inStock}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <span className="text-sm text-zinc-700">
                    {formatBRL(round2(product.price * size.priceMultiplier))}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 space-y-1 border-t border-zinc-200 pt-4">
            {discountPct > 0 && (
              <p className="text-sm text-zinc-600 line-through">{formatBRL(original)}</p>
            )}
            <p className="flex items-baseline justify-between">
              <span className="text-sm text-zinc-600">
                Total{discountPct > 0 ? ` (${discountPct}% OFF)` : ""}
              </span>
              <span className="text-2xl font-black text-amber-700">{formatBRL(final)}</span>
            </p>
            {count > 0 && (
              <p className="flex items-baseline justify-between text-sm font-semibold text-emerald-700">
                <span>No Pix ({PIX_DISCOUNT_PERCENT}% OFF)</span>
                <span>{formatBRL(pixFinal)}</span>
              </p>
            )}
            {savings > 0 && (
              <p className="flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-bold text-amber-700">
                <PiggyBank className="h-4 w-4" aria-hidden />
                Economia: {formatBRL(savings)}
              </p>
            )}
          </div>

          <a
            href={count === 0 ? undefined : whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={count === 0}
            className={`mt-5 flex h-12 w-full items-center justify-center gap-2 bg-gradient-gold font-mono text-xs font-bold uppercase tracking-widest text-dark transition hover:shadow-gold active:scale-95 ${
              count === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Finalizar pelo WhatsApp
          </a>
          <button
            type="button"
            onClick={addToCart}
            disabled={count === 0}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 border border-zinc-300 font-mono text-xs font-bold uppercase tracking-widest text-zinc-800 transition hover:border-gold hover:text-amber-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Adicionar ao carrinho
          </button>
        </aside>
      </div>
    </section>
  );
}
