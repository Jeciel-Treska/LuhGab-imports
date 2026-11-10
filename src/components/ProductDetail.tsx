"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  GitCompareArrows,
  Heart,
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
import { brands } from "@/data/brands";
import { formatBRL } from "@/lib/format";
import { getAminogram, getDoses } from "@/lib/nutrition";
import type { Product } from "@/types/product";
import WhatsAppIcon from "@/components/WhatsAppIcon";

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
  const imported = (brands.find((b) => b.id === product.brandId)?.originCountry ?? "Brasil") !== "Brasil";

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
        <div className="card-dark relative aspect-square w-full overflow-hidden rounded-2xl p-2 hover:translate-y-0 hover:filter-none">
          {/* Badge de Destaque / Desconto */}
          <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-1.5">
            {product.discountPercentage > 0 && (
              <span className="rounded bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-900/50">
                -{product.discountPercentage}% OFF
              </span>
            )}
            {product.price >= FREE_SHIPPING_THRESHOLD && (
              <span className="rounded border border-[#D4AF37]/50 bg-black/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#E8D8B5]">
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
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur transition hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                favorite ? "fill-red-500 text-red-500" : "text-zinc-300 hover:text-[#E8D8B5]"
              }`}
            />
          </button>

          {/* Foto Oficial */}
          <div className="studio flex h-full w-full items-center justify-center rounded-xl p-6">
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
                  className={`relative block h-16 w-16 overflow-hidden rounded-xl border bg-[#131318] p-1 transition sm:h-20 sm:w-20 ${
                    i === photoIndex
                      ? "border-[#D4AF37]/70"
                      : "border-white/10 hover:border-[#E8D8B5]/25"
                  }`}
                >
                  <Image src={src} alt="" width={160} height={160} className="h-full w-full object-contain" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {product.flavors.length > 1 && (
          <p className="text-center text-xs text-zinc-400">
            A imagem mostra um sabor de referência. Você recebe o sabor selecionado.
          </p>
        )}

        {/* Selos de Confiança LuhGab */}
        <ul
          aria-label="Garantias LuhGab Imports"
          className="card-dark mt-2 grid grid-cols-1 divide-y divide-white/10 rounded-2xl hover:translate-y-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {[
            { icon: ShieldCheck, title: "100% Original", text: "Lacrado, com nota fiscal", tone: "text-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-white/10" },
            { icon: BadgeCheck, title: "Laudo Certificado", text: "Autenticidade comprovada", tone: "text-[#D4AF37] bg-[#D4AF37]/10 ring-1 ring-white/10" },
            { icon: Zap, title: `Pix ${PIX_DISCOUNT_PERCENT}% OFF`, text: "Aprovação instantânea", tone: "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30" },
          ].map(({ icon: Icon, title, text, tone }) => (
            <li key={title} className="flex items-center gap-3 px-4 py-3.5 sm:flex-col sm:gap-2 sm:py-4 sm:text-center">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="min-w-0 leading-tight">
                <span className={`block text-xs font-bold uppercase tracking-wide ${tone.includes("emerald") ? "text-emerald-400" : "text-white"}`}>
                  {title}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-400">{text}</span>
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
            <span className="rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E8D8B5]">
              {product.brandName}
            </span>
            {imported && (
              <span className="rounded bg-[#D4AF37] px-2 py-1 text-xs font-bold text-black">
                Importado
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <BadgeCheck className="h-4 w-4" /> Produto Verificado
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white sm:text-5xl">
            {product.name}
          </h1>

          {SHOW_RATINGS && (
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
              <div className="flex items-center text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating)
                        ? "fill-[#D4AF37] text-[#D4AF37]"
                        : "fill-white/10 text-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
              <span>•</span>
              <span>{product.reviewCount} avaliações</span>
            </div>
          )}

          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {product.shortDescription || product.fullDescription}
          </p>
        </div>

        {/* Box de Preço Principal */}
        <div className="card-dark rounded-2xl p-5 hover:translate-y-0 hover:filter-none">
          {product.discountPercentage > 0 && (
            <p className="text-xs text-zinc-400 line-through">
              De {formatBRL(originalTotal)} por
            </p>
          )}

          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl font-black tabular-nums text-white sm:text-5xl">
              {formatBRL(pixTotal)}
            </span>
            <span className="rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-extrabold uppercase text-emerald-400">
              no Pix ({PIX_DISCOUNT_PERCENT}% OFF)
            </span>
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            Ou <strong>{formatBRL(total)}</strong> em até <strong>{product.installments}x</strong> de{" "}
            <strong>{formatBRL(installment)}</strong> sem juros no cartão
          </p>

          {doses && (
            <p className="mt-2 inline-block rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300">
              Rendimento: {doses} porções por embalagem
            </p>
          )}
        </div>

        {/* Seleção de Sabor */}
        <fieldset>
          <legend className="mb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
            Sabor selecionado: <span className="font-extrabold text-[#E8D8B5]">{flavor.name}</span>
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
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                    !f.inStock
                      ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-zinc-500 line-through"
                      : active
                        ? "border-[#D4AF37]/70 bg-[#D4AF37]/10 text-white"
                        : "border-white/10 bg-[#131318] text-zinc-200 hover:border-[#E8D8B5]/25"
                  }`}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-white/20"
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
          <legend className="mb-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
            Opção de Tamanho: <span className="font-extrabold text-[#E8D8B5]">{size.label}</span>
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
                  className={`min-h-[44px] rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                    !s.inStock
                      ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-zinc-500 line-through"
                      : active
                        ? "border-[#D4AF37]/70 bg-[#D4AF37]/10 text-white"
                        : "border-white/10 bg-[#131318] text-zinc-200 hover:border-[#E8D8B5]/25"
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
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Quantidade:</span>
            <div className="flex items-center rounded-xl border border-white/15 bg-[#131318]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-zinc-300 hover:text-[#E8D8B5]"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold tabular-nums text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="flex h-11 w-11 items-center justify-center text-zinc-300 hover:text-[#E8D8B5]"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="ml-auto text-right">
              <span className="text-xs text-zinc-400">Subtotal no Pix:</span>
              <p className="text-base font-extrabold text-emerald-400">{formatBRL(pixTotal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!available}
              onClick={handleAddToCart}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                !available
                  ? "cursor-not-allowed bg-white/5 text-zinc-500"
                  : added
                    ? "bg-emerald-600 text-white"
                    : "btn-red"
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
              className="press flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-500"
            >
              <WhatsAppIcon className="h-4 w-4" aria-hidden />
              Pedir pelo WhatsApp VIP
            </a>
          </div>

          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            aria-pressed={comparing}
            className={`flex min-h-[44px] w-fit items-center gap-2 text-xs font-semibold transition ${
              comparing ? "text-emerald-400" : "text-zinc-400 hover:text-[#E8D8B5]"
            }`}
          >
            <GitCompareArrows className="h-4 w-4" aria-hidden />
            {comparing ? "Adicionado à comparação" : "Comparar com outro produto"}
          </button>
        </div>

        {/* Simulador de Frete */}
        <div className="rounded-2xl border border-white/10 bg-[#0E0E12] p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <Truck className="h-4 w-4 text-[#D4AF37]" /> Consultar Prazo e Frete
          </p>
          <p className="mt-1.5 text-xs text-zinc-400">
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
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-[#131318] px-3 text-xs font-medium text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-white/20"
            />
            <a
              href={cepComplete ? freightUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!cepComplete}
              className={`flex h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-500 ${
                cepComplete ? "" : "pointer-events-none opacity-40"
              }`}
            >
              <WhatsAppIcon className="h-4 w-4" aria-hidden />
              Consultar
            </a>
          </div>
        </div>

        {/* Acordeões de Informações Técnicas e Nutricionais */}
        <div className="space-y-3">
          {/* Benefícios */}
          {product.benefits && product.benefits.length > 0 && (
            <details open className="card-dark group rounded-2xl p-4 hover:translate-y-0 hover:filter-none">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
                <span>Principais Benefícios</span>
                <ChevronDown className="h-4 w-4 text-[#D4AF37] transition-transform group-open:rotate-180" />
              </summary>
              <ul className="mt-3 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Sugestão de Uso */}
          {product.suggestedUse && (
            <details className="card-dark group rounded-2xl p-4 hover:translate-y-0 hover:filter-none">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
                <span>Como Tomar / Sugestão de Uso</span>
                <ChevronDown className="h-4 w-4 text-[#D4AF37] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                {product.suggestedUse}
              </p>
            </details>
          )}

          {/* Tabela Nutricional */}
          {product.nutritionalFacts && product.nutritionalFacts.table && (
            <details className="card-dark group rounded-2xl p-4 hover:translate-y-0 hover:filter-none">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
                <span>Tabela Nutricional</span>
                <ChevronDown className="h-4 w-4 text-[#D4AF37] transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 overflow-x-auto">
                <p className="mb-2 text-xs text-zinc-400">
                  Porção recomendada: <strong>{product.nutritionalFacts.servingSize}</strong>
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/30 text-left text-[#D4AF37]">
                      <th className="py-1.5 font-bold">Nutriente</th>
                      <th className="py-1.5 font-bold">Qtd. por porção</th>
                      <th className="py-1.5 text-right font-bold">%VD*</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {product.nutritionalFacts.table.map((row) => (
                      <tr key={row.nutrient} className="text-zinc-300">
                        <td className="py-1.5 font-medium">{row.nutrient}</td>
                        <td className="py-1.5 font-semibold text-white">{row.amount}</td>
                        <td className="py-1.5 text-right text-zinc-400">{row.dailyValue}</td>
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
