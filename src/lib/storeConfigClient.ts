"use client";

import type { FlashDealsConfig, HeroConfig, ProductOverride } from "@/types/store";

export interface PublicStoreConfig {
  hero: HeroConfig;
  flashDeals?: FlashDealsConfig;
  products: Record<string, ProductOverride>;
}

/**
 * GET /api/store/config com deduplicação: `StoreConfigProvider` e
 * `PromoHeroBanner` pedem ao mesmo tempo logo após a hidratação, mas apenas um
 * request sai. O resultado também fica ~1s em memória para os dois lados.
 */
let inflight: Promise<PublicStoreConfig | null> | null = null;
let last: { at: number; data: PublicStoreConfig } | null = null;

export function fetchPublicStoreConfig(): Promise<PublicStoreConfig | null> {
  if (last && Date.now() - last.at < 1_000) return Promise.resolve(last.data);
  if (inflight) return inflight;

  inflight = fetch("/api/store/config", {
    cache: "no-store",
    headers: { accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const data = (await response.json()) as Partial<PublicStoreConfig> | null;
      if (!data?.hero || !data.products) return null;
      const parsed = data as PublicStoreConfig;
      last = { at: Date.now(), data: parsed };
      return parsed;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
