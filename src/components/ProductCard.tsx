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
    <article className="card-dark group flex h-full flex-col overflow-hidden rounded-2xl p-4 sm:p-5">
      {/* Imagem do Produto */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#18181d] p-2 ring-1 ring-white/5">
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
            <span className="rounded-md bg-red-700 px-2 py-0.5 text-xs font-black text-white">
              -{product.discountPercentage}% OFF
            </span>
          )}
          {product.price >= FREE_SHIPPING_THRESHOLD && (
            <span className="rounded-md border border-white/10 bg-black/60 px-2 py-0.5 text-xs font-semibold text-[#C9A55C]">
              Frete Grátis
            </span>
          )}
        </div>

        {rank !== undefined && (
          <span
            aria-label={`${rank}º mais vendido`}
            className="absolute bottom-2.5 left-2.5 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-black text-black"
          >
            {rank}º Mais Vendido
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={favorite}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur transition hover:scale-110 active:scale-90"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              favorite ? "fill-energy-red-500 text-energy-red-500" : "text-zinc-300 hover:text-white"
            }`}
          />
        </button>
      </div>

      {/* Detalhes & Preço */}
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs font-bold uppercase tracking-wider text-[#C9A55C]">
          {product.brandName}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-white">
          <Link href={`/produto/${product.slug}`} className="transition hover:text-[#C9A55C]">
            {product.name}
          </Link>
        </h3>

        {SHOW_RATINGS && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleCompare(product.id)}
          aria-pressed={comparing}
          className={`mb-3 mt-2 flex min-h-[32px] w-fit items-center gap-1.5 text-xs font-semibold transition ${
            comparing ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <GitCompareArrows className="h-4 w-4" aria-hidden />
          {comparing ? "Comparando" : "Comparar"}
        </button>

        <div className="mt-auto border-t border-white/10 pt-4">
          {hasDiscount && (
            <p className="text-xs text-zinc-400 line-through">
              {formatBRL(product.originalPrice)}
            </p>
          )}

          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-white">
              {formatBRL(pixPrice)}
            </span>
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-bold uppercase text-emerald-400">
              no Pix
            </span>
          </div>

          <p className="mt-1 text-xs text-zinc-400">
            Ou {formatBRL(product.price)} em até {product.installments}x de {formatBRL(installment)} sem juros
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!available}
          className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
            !available
              ? "cursor-not-allowed bg-white/5 text-zinc-500"
              : added
                ? "bg-emerald-600 text-white"
                : "btn-red"
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
