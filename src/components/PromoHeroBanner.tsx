"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, CreditCard, ShieldCheck, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductById, products } from "@/data/products";
import { PIX_DISCOUNT_PERCENT, SHOW_RATINGS, buildWhatsAppUrl } from "@/data/site";
import { formatBRL } from "@/lib/format";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useHeroConfig } from "@/components/StoreConfigProvider";

const HERO_PICK_KEY = "lg-hero-pick";

const buildSeals = (installments: number) => [
  { icon: ShieldCheck, label: "100% Original", desc: "Com laudo e lacre de procedência" },
  { icon: Truck, label: "Envio em até 24h", desc: "Rastreio no WhatsApp" },
  { icon: CreditCard, label: `${installments}x Sem Juros`, desc: "No cartão de crédito" },
  { icon: Zap, label: `${PIX_DISCOUNT_PERCENT}% OFF no Pix`, desc: "Desconto imediato" },
];

export default function PromoHeroBanner() {
  const hero = useHeroConfig();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [randomPick, setRandomPick] = useState<string | null>(null);
  const lotteryKey = (hero.lotteryProductIds ?? []).join(",");

  // Sorteio do Hero: feito no navegador e mantido durante a sessão para não
  // trocar a cada navegação. A lista explícita do admin (`lotteryProductIds`)
  // tem prioridade; sem ela, sorteia entre os destaques.
  useEffect(() => {
    if (hero.mode !== "random") return;
    const explicit = lotteryKey
      .split(",")
      .map((id) => id.trim())
      .filter((id) => Boolean(getProductById(id)));
    const ids =
      explicit.length > 0 ? explicit : products.filter((p) => p.isFeatured).map((p) => p.id);
    if (ids.length === 0) return;
    let pick: string | undefined;
    try {
      const saved = sessionStorage.getItem(HERO_PICK_KEY);
      if (saved && ids.includes(saved)) pick = saved;
    } catch {}
    if (!pick) {
      pick = ids[Math.floor(Math.random() * ids.length)];
      try {
        sessionStorage.setItem(HERO_PICK_KEY, pick);
      } catch {}
    }
    setRandomPick(pick);
  }, [hero.mode, lotteryKey]);

  const firstFeatured = products.find((p) => p.isFeatured);
  const product =
    hero.mode === "pinned"
      ? getProductById(hero.productId ?? "") ?? firstFeatured ?? products[0]
      : getProductById(randomPick ?? "") ?? firstFeatured ?? products[0];

  if (!product) return null;
  const flavor = product.flavors[0];
  const size = product.sizes[0];
  const pixPrice = product.price * (1 - PIX_DISCOUNT_PERCENT / 100);

  const buy = () => {
    if (!flavor || !size) return;
    addItem(product, flavor, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="stage-hero relative overflow-hidden py-12 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Coluna Texto & Compra */}
        <div className="rise flex flex-col items-start gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">{product.brandName}</p>
            <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl xl:text-7xl">
              {product.name}
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-zinc-300 sm:text-lg">
              {product.shortDescription}
            </p>
          </div>

          {/* Preço de Conversão */}
          <div className="card-dark w-full max-w-md rounded-2xl p-5 hover:!translate-y-0 hover:!filter-none">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E8D8B5]">
                Condição Especial
              </span>
              {product.discountPercentage > 0 && (
                <span className="rounded bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-lg shadow-red-900/40">
                  -{product.discountPercentage}% OFF
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              {product.discountPercentage > 0 && (
                <span className="text-sm text-zinc-400 line-through">{formatBRL(product.originalPrice)}</span>
              )}
              <span className="font-display text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
                {formatBRL(product.price)}
              </span>
            </div>

            <p className="mt-1 text-xs font-medium text-zinc-400">
              Ou {product.installments}x de {formatBRL(product.price / product.installments)} sem juros no cartão
            </p>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-300">
              <span>Pix à vista ({PIX_DISCOUNT_PERCENT}% OFF)</span>
              <span className="text-sm font-black text-emerald-400">{formatBRL(pixPrice)}</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={buy}
              className="btn-red flex h-14 items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold uppercase tracking-wider"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" /> Adicionado ao Carrinho
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> Comprar Agora
                </>
              )}
            </button>

            <a
              href={buildWhatsAppUrl(`Olá! Quero pedir o ${product.name} por ${formatBRL(product.price)}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-emerald-500"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Pedir pelo WhatsApp
            </a>
          </div>
          <p className="text-xs font-medium text-emerald-400">
            Pague no Pix e economize {formatBRL(product.price - pixPrice)}
          </p>

          {/* Selos de Confiança */}
          <div className="grid w-full max-w-xl grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
            {buildSeals(product.installments).map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col">
                <Icon className="h-5 w-5 text-[#D4AF37]" />
                <span className="mt-1 text-xs font-bold text-white">{label}</span>
                <span className="text-xs text-zinc-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Fotografia do Produto */}
        <div className="rise rise-2 relative mx-auto flex w-full max-w-md items-center justify-center lg:max-w-none">
          <div className="card-dark relative aspect-[4/5] w-full max-w-lg rounded-2xl p-2 hover:!translate-y-0 hover:!filter-none">
            <div className="studio relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl p-8">
              {/* feixe de luz de estúdio, vindo do alto */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-[70%] w-[70%] -translate-x-1/2 bg-gradient-to-b from-[#E8D8B5]/20 to-transparent [clip-path:polygon(34%_0,66%_0,100%_100%,0_100%)]"
              />
              {/* piso do estúdio + sombra de contato */}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/60 to-transparent" />
              <span aria-hidden className="absolute bottom-[9%] left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-[50%] bg-black/80 blur-xl" />
              <Image
                src={product.imageUrl ?? "/products/under-labz-dimethylex.png"}
                alt={product.name}
                width={420}
                height={560}
                priority
                className="relative h-full w-auto object-contain drop-shadow-[0_16px_16px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/* Selos legítimos sobre a foto */}
            <div className="absolute left-5 top-5 flex flex-col items-start gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded border border-[#D4AF37]/60 bg-black/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E8D8B5] backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden /> 100% Original
              </span>
              {SHOW_RATINGS && (
                <span className="inline-flex items-center gap-1.5 rounded bg-black/70 px-2.5 py-1 text-xs backdrop-blur">
                  <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" aria-hidden />
                  <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
                  <span className="text-zinc-400">({product.reviewCount})</span>
                </span>
              )}
            </div>
            {product.discountPercentage > 0 && (
              <span className="absolute right-5 top-5 rounded bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-red-900/50">
                -{product.discountPercentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
