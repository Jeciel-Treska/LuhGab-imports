/** Configuração editável pelo lojista em /admin, persistida em data/store-config.json. */

export type HeroMode = "pinned" | "random";

export interface HeroConfig {
  mode: HeroMode;
  /** Produto fixado no Hero quando `mode` é "pinned". */
  productId: string | null;
  /**
   * Lista explícita de produtos que podem ser sorteados quando `mode` é "random".
   * Se vazia/ausente, o sorteio cai nos produtos marcados como `isFeatured`.
   */
  lotteryProductIds?: string[];
}

/** Campos do produto que o lojista pode sobrescrever. */
export interface ProductOverride {
  price?: number;
  originalPrice?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  /**
   * Badge de desconto (0–90). Quando omitido, é recalculado a partir de
   * `price` e `originalPrice`.
   */
  discountPercentage?: number;
}

export interface StoreConfig {
  hero: HeroConfig;
  products: Record<string, ProductOverride>;
  /** ISO da última gravação — gerenciado pelo servidor, ignorado se inválido. */
  updatedAt?: string;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  hero: { mode: "pinned", productId: "under-labz-dimethylex" },
  products: {},
};
