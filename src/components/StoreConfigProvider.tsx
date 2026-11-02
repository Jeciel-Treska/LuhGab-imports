"use client";

import { createContext, useContext, type ReactNode } from "react";
import { applyStoreOverrides } from "@/data/products";
import type { HeroConfig, StoreConfig } from "@/types/store";

const HeroContext = createContext<HeroConfig>({ mode: "pinned", productId: null });

export const useHeroConfig = () => useContext(HeroContext);

/**
 * Aplica as edições do lojista ao catálogo em memória (SSR e navegador) antes de
 * qualquer filho renderizar, para que cards, carrinho e páginas mostrem os mesmos valores.
 */
export default function StoreConfigProvider({ config, children }: { config: StoreConfig; children: ReactNode }) {
  applyStoreOverrides(config.products);
  return <HeroContext.Provider value={config.hero}>{children}</HeroContext.Provider>;
}
