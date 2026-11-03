"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { applyStoreOverrides } from "@/data/products";
import { fetchPublicStoreConfig } from "@/lib/storeConfigClient";
import type { FlashDealsConfig, HeroConfig, StoreConfig } from "@/types/store";

const HeroContext = createContext<HeroConfig>({ mode: "pinned", productId: null });

export const useHeroConfig = () => useContext(HeroContext);

const DEFAULT_FLASH_DEALS: FlashDealsConfig = { mode: "auto", productIds: [] };
const FlashDealsContext = createContext<FlashDealsConfig>(DEFAULT_FLASH_DEALS);

export const useFlashDealsConfig = () => useContext(FlashDealsContext);

// Muda de identidade sempre que o lojista altera preços/destaques: componentes
// cliente que leem `products` (mutado em memória) assinam aqui para re-renderizar.
const OverridesContext = createContext<StoreConfig["products"]>({});

export const useStoreOverrides = () => useContext(OverridesContext);

const sameHero = (a: HeroConfig, b: HeroConfig) =>
  a.mode === b.mode &&
  a.productId === b.productId &&
  (a.lotteryProductIds ?? []).join(",") === (b.lotteryProductIds ?? []).join(",");

const sameConfig = (a: StoreConfig, b: StoreConfig) =>
  sameHero(a.hero, b.hero) &&
  JSON.stringify(a.flashDeals ?? null) === JSON.stringify(b.flashDeals ?? null) && JSON.stringify(a.products) === JSON.stringify(b.products);

/** Evita laço de router.refresh() em navegações rápidas. */
const REFRESH_THROTTLE_MS = 30_000;
const RESYNC_INTERVAL_MS = 60_000;

/**
 * Aplica as edições do lojista ao catálogo em memória (SSR e navegador) antes de
 * qualquer filho renderizar, para que cards, carrinho e páginas mostrem os mesmos valores.
 *
 * Além do valor vindo do SSR, busca `/api/store/config` no cliente: se a CDN ou o
 * router ainda estiverem com um HTML alguns segundos atrasado, o Hero e os preços
 * se corrigem sem reload. Quando há divergência real, um `router.refresh()` suave
 * alinha o restante da árvore server-rendered.
 */
export default function StoreConfigProvider({
  config,
  children,
}: {
  config: StoreConfig;
  children: ReactNode;
}) {
  const [current, setCurrent] = useState(config);
  const applied = useRef<StoreConfig>(config);
  const lastRefresh = useRef(0);
  const router = useRouter();

  applyStoreOverrides(current.products);

  // Um router.refresh() (ou navegação) entrega nova config do servidor: vira a base.
  useEffect(() => {
    applied.current = config;
    setCurrent(config);
  }, [config]);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const data = await fetchPublicStoreConfig();
      if (!active || !data) return;

      const next: StoreConfig = { hero: data.hero, flashDeals: data.flashDeals, products: data.products };
      if (sameConfig(applied.current, next)) return;

      applied.current = next;
      applyStoreOverrides(next.products);
      setCurrent(next);

      const now = Date.now();
      if (now - lastRefresh.current > REFRESH_THROTTLE_MS) {
        lastRefresh.current = now;
        router.refresh();
      }
    };

    void sync();

    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(() => void sync(), RESYNC_INTERVAL_MS);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [router]);

  return (
    <HeroContext.Provider value={current.hero}>
      <FlashDealsContext.Provider value={current.flashDeals ?? DEFAULT_FLASH_DEALS}>
        <OverridesContext.Provider value={current.products}>{children}</OverridesContext.Provider>
      </FlashDealsContext.Provider>
    </HeroContext.Provider>
  );
}
