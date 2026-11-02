"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, GitCompareArrows, Heart, ShoppingBag, Star } from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useWishlist } from "@/context/WishlistContext";
import { FREE_SHIPPING_THRESHOLD, PIX_DISCOUNT_PERCENT, SHOW_RATINGS } from "@/data/site";
import { formatBRL } from "@/lib/format";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  cta?: string;
  rank?: number;
}

export default function ProductCard({ product, cta = "Comprar", rank }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { isSelected, toggle: toggleCompare } = useCompare();
  const comparing = isSelected(product.id);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const favorite = isFavorite(product.id);
  const flavor = product.flavors.find((f) => f.inStock);
  const size = product.sizes.find((s) => s.inStock);
  const available = product.inStock && flavor && size;

  const handleAdd = () => {
    if (!flavor || !size) return;
    addItem(product, flavor, size, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  const pixPrice = product.price * (1 - PIX_DISCOUNT_PERCENT / 100);
  const installment = product.price / product.installments;
  const hasDiscount = product.discountPercentage > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-400 hover:shadow-xl sm:p-5">
      {/* Imagem do Produto */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-50 p-2">
        <Link
          href={`/produto/${product.slug}`}
          aria-label={`Ver detalhes de ${product.name}`}
          className="flex h-full w-full items-center justify-center"
        >
          <ProductThumb
            type={product.model3DConfig.type}
            color={product.model3DConfig.color}
            productId={product.id}
            imageUrl={product.imageUrl}
            alt={product.name}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="h-full w-full"
          />
        </Link>

        {/* Badges de Desconto e Frete */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {hasDiscount && (
            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
              -{product.discountPercentage}% OFF
            </span>
          )}
          {product.price >= FREE_SHIPPING_THRESHOLD && (
            <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white">
              Frete Grátis
            </span>
          )}
        </div>

        {rank !== undefined && (
          <span
            aria-label={`${rank}º mais vendido`}
            className="absolute bottom-2.5 left-2.5 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-black text-white"
          >
            {rank}º Mais Vendido
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={favorite}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 active:scale-90"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              favorite ? "fill-rose-500 text-rose-500" : "text-zinc-400 hover:text-zinc-600"
            }`}
          />
        </button>
      </div>

      {/* Detalhes & Preço */}
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {product.brandName}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-zinc-900">
          <Link href={`/produto/${product.slug}`} className="hover:text-zinc-600 transition">
            {product.name}
          </Link>
        </h3>

        {SHOW_RATINGS && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-zinc-800">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleCompare(product.id)}
          aria-pressed={comparing}
          className={`mb-3 mt-2 flex min-h-[32px] w-fit items-center gap-1.5 text-xs font-semibold transition ${
            comparing ? "text-emerald-700" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <GitCompareArrows className="h-4 w-4" aria-hidden />
          {comparing ? "Comparando" : "Comparar"}
        </button>

        <div className="mt-auto pt-4 border-t border-zinc-100">
          {hasDiscount && (
            <p className="text-xs text-zinc-500 line-through">
              {formatBRL(product.originalPrice)}
            </p>
          )}

          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-zinc-950">
              {formatBRL(pixPrice)}
            </span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold uppercase text-emerald-800">
              no Pix
            </span>
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            Ou {formatBRL(product.price)} em até {product.installments}x de {formatBRL(installment)} sem juros
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!available}
          className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
            !available
              ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
              : added
                ? "bg-emerald-600 text-white"
                : "bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm"
          }`}
        >
          {!available ? (
            "Indisponível"
          ) : added ? (
            <>
              <Check className="h-4 w-4" /> Adicionado
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> {cta}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
