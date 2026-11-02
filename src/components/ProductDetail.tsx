"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  GitCompareArrows,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  buildWhatsAppUrl,
  FREE_SHIPPING_THRESHOLD,
  PIX_DISCOUNT_PERCENT,
  SHOW_RATINGS,
} from "@/data/site";
import { formatBRL } from "@/lib/format";
import { getAminogram, getDoses } from "@/lib/nutrition";
import type { Product } from "@/types/product";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const maskCep = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { isSelected, toggle: toggleCompare } = useCompare();
  const comparing = isSelected(product.id);
  const [flavorId, setFlavorId] = useState(
    () => (product.flavors.find((f) => f.inStock) ?? product.flavors[0]).id,
  );
  const [sizeId, setSizeId] = useState(
    () => (product.sizes.find((s) => s.inStock) ?? product.sizes[0]).id,
  );
  const [quantity, setQuantity] = useState(1);
  const [photoIndex, setPhotoIndex] = useState(0);
  const gallery = [product.imageUrl, ...(product.images ?? [])].filter((s): s is string => Boolean(s));
  const [cep, setCep] = useState("");
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const flavor = product.flavors.find((f) => f.id === flavorId) ?? product.flavors[0];
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[0];

  const unitPrice = round2(product.price * size.priceMultiplier);
  const originalTotal = round2(product.originalPrice * size.priceMultiplier * quantity);
  const total = round2(unitPrice * quantity);
  const pixTotal = round2(total * (1 - PIX_DISCOUNT_PERCENT / 100));
  const installment = round2(total / product.installments);
  const doses = getDoses(product, size);
  const aminogram = useMemo(() => getAminogram(product), [product]);
  const available = product.inStock && flavor.inStock && size.inStock;
  const favorite = isFavorite(product.id);

  const whatsappUrl = buildWhatsAppUrl(
    `Olá! Tenho interesse no ${product.name} (${product.brandName}) - Sabor: ${flavor.name}, Tamanho: ${size.label}. Poderia me atender?`,
  );

  const handleAddToCart = () => {
    if (!available) return;
    addItem(product, flavor, size, quantity);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  const cepComplete = cep.replace(/\D/g, "").length === 8;
  const freightUrl = buildWhatsAppUrl(
    `Olá! Gostaria de saber o prazo e o frete do ${product.name} (${size.label}, ${quantity}x) para o CEP ${cep}.`,
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
      {/* Coluna Visual (Esquerda - 6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Card Principal da Imagem */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm">
          {/* Badge de Destaque / Desconto */}
          <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-1.5">
            {product.discountPercentage > 0 && (
              <span className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-black tracking-wider text-white shadow-sm uppercase">
                -{product.discountPercentage}% OFF
              </span>
            )}
            {product.price >= FREE_SHIPPING_THRESHOLD && (
              <span className="rounded-lg bg-zinc-950 px-2.5 py-1 text-xs font-bold tracking-wider text-white uppercase">
                Frete Grátis
              </span>
            )}
          </div>

          {/* Botão de Favorito */}
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={favorite}
            aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/90 shadow-sm transition hover:scale-110 active:scale-95"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                favorite ? "fill-rose-500 text-rose-500" : "text-zinc-400 hover:text-zinc-600"
              }`}
            />
          </button>

          {/* Foto Oficial */}
          <div className="flex h-full w-full items-center justify-center">
            <ProductThumb
              type={product.model3DConfig.type}
              color={flavor.hexColor ?? product.model3DConfig.color}
              productId={product.id}
              imageUrl={gallery[photoIndex]}
              alt={`${product.name} - foto ${photoIndex + 1} de ${gallery.length}`}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full"
            />
          </div>
        </div>

        {gallery.length > 1 && (
          <ul aria-label="Fotos do produto" className="flex flex-wrap justify-center gap-2">
            {gallery.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  aria-label={`Ver foto ${i + 1} de ${gallery.length}`}
                  aria-current={i === photoIndex}
                  className={`relative block h-16 w-16 overflow-hidden rounded-xl border bg-white p-1 transition active:scale-95 sm:h-20 sm:w-20 ${
                    i === photoIndex
                      ? "border-zinc-950 ring-1 ring-zinc-950"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  <Image src={src} alt="" width={160} height={160} className="h-full w-full object-contain" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {product.flavors.length > 1 && (
          <p className="text-center text-xs text-zinc-500">
            A imagem mostra um sabor de referência. Você recebe o sabor selecionado.
          </p>
        )}

        {/* Selos de Confiança LuhGab */}
        <ul
          aria-label="Garantias LuhGab Imports"
          className="mt-2 grid grid-cols-1 divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {[
            { icon: ShieldCheck, title: "100% Original", text: "Lacrado, com nota fiscal", tone: "text-zinc-900 bg-zinc-100" },
            { icon: BadgeCheck, title: "Laudo Certificado", text: "Autenticidade comprovada", tone: "text-zinc-900 bg-zinc-100" },
            { icon: Zap, title: `Pix ${PIX_DISCOUNT_PERCENT}% OFF`, text: "Aprovação instantânea", tone: "text-emerald-700 bg-emerald-50" },
          ].map(({ icon: Icon, title, text, tone }) => (
            <li key={title} className="flex items-center gap-3 px-4 py-3.5 sm:flex-col sm:gap-2 sm:py-4 sm:text-center">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="min-w-0 leading-tight">
                <span className={`block text-xs font-bold uppercase tracking-wide ${tone.includes("emerald") ? "text-emerald-700" : "text-zinc-900"}`}>
                  {title}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">{text}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Coluna de Compra e Detalhes (Direita - 6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        {/* Cabeçalho do Produto */}
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-700">
              {product.brandName}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <BadgeCheck className="h-4 w-4" /> Produto Verificado
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-zinc-950 leading-tight">
            {product.name}
          </h1>

          {SHOW_RATINGS && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-zinc-800">{product.rating.toFixed(1)}</span>
              <span>•</span>
              <span>{product.reviewCount} avaliações</span>
            </div>
          )}

          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            {product.shortDescription || product.fullDescription}
          </p>
        </div>

        {/* Box de Preço Principal */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          {product.discountPercentage > 0 && (
            <p className="text-xs text-zinc-500 line-through">
              De {formatBRL(originalTotal)} por
            </p>
          )}

          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl sm:text-5xl font-black text-zinc-950">
              {formatBRL(pixTotal)}
            </span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-extrabold uppercase text-emerald-800">
              no Pix ({PIX_DISCOUNT_PERCENT}% OFF)
            </span>
          </div>

          <p className="mt-2 text-xs text-zinc-600">
            Ou <strong>{formatBRL(total)}</strong> em até <strong>{product.installments}x</strong> de{" "}
            <strong>{formatBRL(installment)}</strong> sem juros no cartão
          </p>

          {doses && (
            <p className="mt-2 inline-block rounded bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
              Rendimento: {doses} porções por embalagem
            </p>
          )}
        </div>

        {/* Seleção de Sabor */}
        <fieldset>
          <legend className="mb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700">
            Sabor selecionado: <span className="font-extrabold text-zinc-950">{flavor.name}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.flavors.map((f) => {
              const active = f.id === flavorId;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={!f.inStock}
                  onClick={() => setFlavorId(f.id)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition active:scale-95 ${
                    !f.inStock
                      ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400 line-through"
                      : active
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: f.hexColor ?? "#A1A1AA" }}
                  />
                  {f.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Seleção de Tamanho */}
        <fieldset>
          <legend className="mb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700">
            Opção de Tamanho: <span className="font-extrabold text-zinc-950">{size.label}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const active = s.id === sizeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!s.inStock}
                  onClick={() => setSizeId(s.id)}
                  className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-semibold transition active:scale-95 ${
                    !s.inStock
                      ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400 line-through"
                      : active
                        ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Quantidade e CTAs */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">Quantidade:</span>
            <div className="flex items-center rounded-xl border border-zinc-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-zinc-600 hover:text-zinc-950 active:scale-90"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-zinc-950 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="flex h-11 w-11 items-center justify-center text-zinc-600 hover:text-zinc-950 active:scale-90"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="ml-auto text-right">
              <span className="text-xs text-zinc-500">Subtotal no Pix:</span>
              <p className="text-base font-extrabold text-zinc-950">{formatBRL(pixTotal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!available}
              onClick={handleAddToCart}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition active:scale-95 ${
                !available
                  ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                  : added
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-950 text-white hover:bg-zinc-800"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Adicionado ao Carrinho!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Adicionar ao Carrinho
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-600 active:scale-95"
            >
              Pedir pelo WhatsApp VIP
            </a>
          </div>

          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            aria-pressed={comparing}
            className={`flex min-h-[44px] w-fit items-center gap-2 text-xs font-semibold transition ${
              comparing ? "text-emerald-700" : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <GitCompareArrows className="h-4 w-4" aria-hidden />
            {comparing ? "Adicionado à comparação" : "Comparar com outro produto"}
          </button>
        </div>

        {/* Simulador de Frete */}
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
            <Truck className="h-4 w-4 text-zinc-900" /> Consultar Prazo e Frete
          </p>
          <p className="mt-1.5 text-xs text-zinc-600">
            {total >= FREE_SHIPPING_THRESHOLD
              ? "Este pedido tem frete grátis. Informe o CEP para consultar o prazo."
              : `Frete grátis acima de ${formatBRL(FREE_SHIPPING_THRESHOLD)}. Abaixo disso, o valor é informado no atendimento.`}
          </p>
          <div className="mt-2.5 flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              aria-label="CEP para consulta de frete"
              value={cep}
              onChange={(e) => setCep(maskCep(e.target.value))}
              placeholder="Digite seu CEP (00000-000)"
              className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            />
            <a
              href={cepComplete ? freightUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!cepComplete}
              className={`flex h-11 items-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white transition hover:bg-zinc-800 active:scale-95 ${
                cepComplete ? "" : "pointer-events-none opacity-40"
              }`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Consultar
            </a>
          </div>
        </div>

        {/* Acordeões de Informações Técnicas e Nutricionais */}
        <div className="space-y-3">
          {/* Benefícios */}
          {product.benefits && product.benefits.length > 0 && (
            <details open className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900">
                <span>Principais Benefícios</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="mt-3 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Sugestão de Uso */}
          {product.suggestedUse && (
            <details className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900">
                <span>Como Tomar / Sugestão de Uso</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                {product.suggestedUse}
              </p>
            </details>
          )}

          {/* Tabela Nutricional */}
          {product.nutritionalFacts && product.nutritionalFacts.table && (
            <details className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900">
                <span>Tabela Nutricional</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 overflow-x-auto">
                <p className="text-xs text-zinc-500 mb-2">
                  Porção recomendada: <strong>{product.nutritionalFacts.servingSize}</strong>
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-zinc-500">
                      <th className="py-1.5 font-bold">Nutriente</th>
                      <th className="py-1.5 font-bold">Qtd. por porção</th>
                      <th className="py-1.5 text-right font-bold">%VD*</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {product.nutritionalFacts.table.map((row) => (
                      <tr key={row.nutrient} className="text-zinc-700">
                        <td className="py-1.5 font-medium">{row.nutrient}</td>
                        <td className="py-1.5 text-zinc-900 font-semibold">{row.amount}</td>
                        <td className="py-1.5 text-right text-zinc-500">{row.dailyValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
