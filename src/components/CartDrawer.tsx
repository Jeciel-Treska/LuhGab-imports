"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/data/products";
import { FREE_SHIPPING_THRESHOLD, PIX_DISCOUNT_PERCENT } from "@/data/site";
import { formatBRL } from "@/lib/format";
import { buildOrderUrl, lineTotal } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    toggleCart,
    subtotal,
    totalDiscount,
    total,
    pixTotal,
    activeCoupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [code, setCode] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isCartOpen) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleCart();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [isCartOpen, toggleCart]);

  const itemsNet = round2(items.reduce((sum, item) => sum + lineTotal(item), 0));
  const couponValue = activeCoupon ? round2((itemsNet * activeCoupon.percentage) / 100) : 0;
  const otherDiscounts = round2(totalDiscount - couponValue);

  const remaining = round2(FREE_SHIPPING_THRESHOLD - total);
  const freeShipping = remaining <= 0;
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  const onCoupon = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (applyCoupon(code)) setCode("");
  };

  const orderUrl = buildOrderUrl({
    items,
    subtotal,
    totalDiscount,
    total,
    pixTotal,
    coupon: activeCoupon,
    couponValue,
    freeShipping,
  });

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={toggleCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0E0E12] transition-transform duration-300 ease-out"
      >
        <header className="flex items-center justify-between relative border-b border-white/10 px-6 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-black uppercase tracking-tight text-white">
            <ShoppingBag className="h-5 w-5 text-zinc-300" aria-hidden />
            Seu Carrinho ({items.reduce((acc, i) => acc + i.quantity, 0)})
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={toggleCart}
            aria-label="Fechar carrinho"
            className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <p className="font-bold text-white">Seu carrinho está vazio</p>
              <p className="mt-1 text-xs text-zinc-400">Explore nossa linha de suplementos importados e nacionais.</p>
            </div>
            <button
              type="button"
              onClick={toggleCart}
              className="btn-red mt-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            {/* Barra de Frete Grátis */}
            <div className="border-b border-white/10 bg-[#0E0E12] px-6 py-3.5">
              <p className="mb-2 text-xs font-semibold text-zinc-300">
                {freeShipping ? (
                  <span className="font-bold text-emerald-400">
                    Parabéns! Você ganhou Frete Grátis!
                  </span>
                ) : (
                  <>
                    Faltam apenas{" "}
                    <strong className="font-bold text-white">{formatBRL(remaining)}</strong> para
                    Frete Grátis!
                  </>
                )}
              </p>
              <div
                role="progressbar"
                aria-label="Progresso do frete grátis"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                className="h-2 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${
                    freeShipping ? "bg-emerald-500" : "bg-red-600"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Lista de Itens */}
            <ul className="flex-1 divide-y divide-white/10 overflow-y-auto px-6">
              {items.map((item) => {
                const prod = getProductById(item.productId);
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="h-16 w-16 shrink-0 flex items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1F] p-1">
                      <ProductThumb
                        type={prod?.model3DConfig.type ?? "whey-tub"}
                        color={prod?.model3DConfig.color ?? "#000000"}
                        productId={item.productId}
                        imageUrl={prod?.imageUrl}
                        alt={item.name}
                        sizes="64px"
                        className="h-full w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{item.name}</p>
                      <p className="text-xs text-zinc-400">
                        {item.flavor.name} · {item.size.label}
                        {item.comboDiscount > 0 && (
                          <span className="ml-2 rounded bg-red-600/15 px-1.5 py-0.5 text-xs font-bold text-red-400">
                            Combo -{item.comboDiscount}%
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-zinc-300">
                        {formatBRL(item.unitPrice)} un.
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-white/15 bg-[#131318]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Diminuir quantidade de ${item.name}`}
                            className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Aumentar quantidade de ${item.name}`}
                            className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-black text-white">
                          {formatBRL(lineTotal(item))}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remover ${item.name}`}
                      className="h-11 w-11 shrink-0 self-start text-zinc-400 transition hover:text-red-500"
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer do Carrinho */}
            <div className="space-y-3 border-t border-white/10 bg-[#0E0E12] p-6">
              {activeCoupon ? (
                <p className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" aria-hidden />
                    {activeCoupon.code}: -{formatBRL(couponValue)}
                  </span>
                  <button type="button" onClick={removeCoupon} className="text-xs text-red-400 underline">
                    Remover
                  </button>
                </p>
              ) : (
                <form onSubmit={onCoupon} className="flex gap-2">
                  <input
                    id="coupon"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-label="Cupom de desconto"
                    placeholder="Cupom de desconto"
                    autoCapitalize="characters"
                    className="h-9 min-w-0 flex-1 rounded-xl border border-white/15 bg-[#131318] px-3 text-xs uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-500 focus:border-zinc-500"
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-xl border border-white/20 px-3.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-white hover:text-black"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              <dl className="space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-white">{formatBRL(subtotal)}</dd>
                </div>
                {otherDiscounts > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-400">
                    <dt>Descontos</dt>
                    <dd>-{formatBRL(otherDiscounts)}</dd>
                  </div>
                )}
                {couponValue > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-400">
                    <dt>Cupom de Desconto</dt>
                    <dd>-{formatBRL(couponValue)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <dt>Total no cartão</dt>
                  <dd className="font-semibold text-white">{formatBRL(total)}</dd>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-base font-black text-emerald-300">
                  <dt>Total no Pix ({PIX_DISCOUNT_PERCENT}% OFF)</dt>
                  <dd className="text-emerald-400">{formatBRL(pixTotal)}</dd>
                </div>
              </dl>

              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="press flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-500"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Finalizar Pedido pelo WhatsApp
              </a>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
