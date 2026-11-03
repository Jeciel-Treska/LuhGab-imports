import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import { getBaselineProduct, getProductById, products } from "@/data/products";
import { DEFAULT_STORE_CONFIG, type HeroMode, type StoreConfig } from "@/types/store";

/**
 * Somente servidor: lê e grava a configuração do lojista em disco.
 *
 * Fonte da verdade: `data/store-config.json` (sobrescrevível por `STORE_CONFIG_PATH`).
 * Gravações são atômicas (tmp + rename) e serializadas por uma fila para evitar
 * corrupção quando dois requests chegam juntos.
 */
export const STORE_CONFIG_PATH =
  process.env.STORE_CONFIG_PATH?.trim() || path.join(process.cwd(), "data", "store-config.json");

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isMoney = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v > 0 && v < 1_000_000;

export class ConfigValidationError extends Error {}

/** Valida o corpo recebido e devolve só campos conhecidos e coerentes. */
export function parseStoreConfig(input: unknown): StoreConfig {
  if (!isRecord(input) || !isRecord(input.hero) || !isRecord(input.products)) {
    throw new ConfigValidationError("Formato de configuração inválido.");
  }

  const mode = input.hero.mode;
  if (mode !== "pinned" && mode !== "random") {
    throw new ConfigValidationError("Modo do Hero inválido.");
  }
  const heroId = input.hero.productId;
  if (heroId !== null && (typeof heroId !== "string" || !getProductById(heroId))) {
    throw new ConfigValidationError("Produto do Hero não existe.");
  }
  if (mode === "pinned" && heroId === null) {
    throw new ConfigValidationError("Escolha o produto a ser fixado no Hero.");
  }

  const rawLottery = input.hero.lotteryProductIds;
  let lotteryProductIds: string[] | undefined;
  if (rawLottery !== undefined && rawLottery !== null) {
    if (!Array.isArray(rawLottery)) {
      throw new ConfigValidationError("lotteryProductIds deve ser uma lista de IDs.");
    }
    const unique = [...new Set(rawLottery)];
    for (const id of unique) {
      if (typeof id !== "string" || !getProductById(id)) {
        throw new ConfigValidationError(`Produto do sorteio inexistente: ${String(id)}.`);
      }
    }
    if (unique.length > 0) lotteryProductIds = unique as string[];
  }

  const result: StoreConfig = {
    hero: { mode: mode as HeroMode, productId: heroId, lotteryProductIds },
    products: {},
  };
  if (typeof input.updatedAt === "string" && !Number.isNaN(Date.parse(input.updatedAt))) {
    result.updatedAt = input.updatedAt;
  }

  for (const [id, raw] of Object.entries(input.products)) {
    const base = getBaselineProduct(id);
    if (!base || !isRecord(raw)) throw new ConfigValidationError(`Produto desconhecido: ${id}.`);
    const out: StoreConfig["products"][string] = {};

    if (raw.price !== undefined) {
      if (!isMoney(raw.price)) throw new ConfigValidationError(`Preço inválido em ${id}.`);
      out.price = Math.round(raw.price * 100) / 100;
    }
    if (raw.originalPrice !== undefined) {
      if (!isMoney(raw.originalPrice)) throw new ConfigValidationError(`Preço original inválido em ${id}.`);
      out.originalPrice = Math.round(raw.originalPrice * 100) / 100;
    }
    const price = out.price ?? base.price;
    const original = out.originalPrice ?? base.originalPrice;
    if (original < price) {
      throw new ConfigValidationError(`Em ${id}, o preço original não pode ser menor que o preço de venda.`);
    }
    if (raw.isFeatured !== undefined) {
      if (typeof raw.isFeatured !== "boolean") throw new ConfigValidationError(`Destaque inválido em ${id}.`);
      out.isFeatured = raw.isFeatured;
    }
    if (raw.isBestSeller !== undefined) {
      if (typeof raw.isBestSeller !== "boolean") throw new ConfigValidationError(`Mais vendido inválido em ${id}.`);
      out.isBestSeller = raw.isBestSeller;
    }
    if (raw.discountPercentage !== undefined) {
      const discount = raw.discountPercentage;
      if (typeof discount !== "number" || !Number.isFinite(discount) || discount < 0 || discount > 90) {
        throw new ConfigValidationError(`Desconto inválido em ${id} (use 0–90).`);
      }
      out.discountPercentage = Math.round(discount);
    }
    if (Object.keys(out).length > 0) result.products[id] = out;
  }

  if (mode === "random" && !lotteryProductIds) {
    const featured = products.some((p) => (result.products[p.id]?.isFeatured ?? getBaselineProduct(p.id)?.isFeatured));
    if (!featured) {
      throw new ConfigValidationError(
        "Marque ao menos um produto como Destaque (ou defina lotteryProductIds) para usar o sorteio automático.",
      );
    }
  }
  return result;
}

export function loadStoreConfig(): StoreConfig {
  try {
    return parseStoreConfig(JSON.parse(readFileSync(STORE_CONFIG_PATH, "utf8")));
  } catch {
    return DEFAULT_STORE_CONFIG;
  }
}

let writeQueue: Promise<unknown> = Promise.resolve();

/** Serializa gravações e mantém a fila viva mesmo quando um job falha. */
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const task = writeQueue.then(job);
  writeQueue = task.catch(() => undefined);
  return task;
}

async function writeAtomic(config: StoreConfig): Promise<StoreConfig> {
  const payload: StoreConfig = { ...parseStoreConfig(config), updatedAt: new Date().toISOString() };
  await fs.mkdir(path.dirname(STORE_CONFIG_PATH), { recursive: true });
  const tmp = `${STORE_CONFIG_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tmp, STORE_CONFIG_PATH);
  return payload;
}

/** Substitui a configuração inteira, de forma atômica e serializada. */
export function saveStoreConfig(config: StoreConfig): Promise<StoreConfig> {
  return enqueue(() => writeAtomic(config));
}

/**
 * Lê o estado atual, aplica a mutação, valida e grava — tudo dentro da fila,
 * para que patches concorrentes não se percam.
 */
export function updateStoreConfig(mutator: (current: StoreConfig) => StoreConfig): Promise<StoreConfig> {
  return enqueue(() => writeAtomic(mutator(loadStoreConfig())));
}

/** Valores efetivos de um produto (baseline do código + override do lojista). */
export function getEffectiveProduct(id: string) {
  const base = getBaselineProduct(id);
  if (!base) return null;
  const override = loadStoreConfig().products[id] ?? {};
  const price = override.price ?? base.price;
  const originalPrice = override.originalPrice ?? base.originalPrice;
  return {
    price,
    originalPrice,
    isFeatured: override.isFeatured ?? base.isFeatured,
    isBestSeller: override.isBestSeller ?? base.isBestSeller,
    discountPercentage:
      override.discountPercentage ?? Math.max(0, Math.round((1 - price / originalPrice) * 100)),
  };
}
