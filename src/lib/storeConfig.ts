import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getBaselineProduct, getProductById, products } from "@/data/products";
import { DEFAULT_STORE_CONFIG, type HeroMode, type StoreConfig } from "@/types/store";

/**
 * Somente servidor: lê e grava a configuração do lojista.
 *
 * Backends, por ordem de preferência:
 * 1. Upstash Redis / Vercel KV via REST (`KV_REST_API_URL` + `KV_REST_API_TOKEN`
 *    ou `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) — persistente e
 *    compartilhado entre instâncias (recomendado na Vercel).
 * 2. Arquivo JSON em disco (`data/store-config.json`, sobrescrevível por
 *    `STORE_CONFIG_PATH`) — ambiente local/VPS.
 * 3. Na Vercel sem KV: `/tmp/store-config.json` (gravável, mas efêmero e por
 *    instância) + baseline somente-leitura do deploy.
 *
 * Gravações são atômicas (tmp + rename) e serializadas por uma fila.
 */

const IS_VERCEL = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

export const STORE_CONFIG_PATH =
  process.env.STORE_CONFIG_PATH?.trim() || path.join(process.cwd(), "data", "store-config.json");

/** Diretório temporário gravável (na Vercel, sempre /tmp). */
const TMP_PATH = IS_VERCEL
  ? path.join("/tmp", "store-config.json")
  : path.join(os.tmpdir(), "luhgab-store-config.json");

interface KvBackend {
  url: string;
  token: string;
  key: string;
}

/** Sufixos aceitos — funcionam com qualquer prefixo escolhido na integração. */
const KV_URL_SUFFIX = "_REST_API_URL";
const KV_TOKEN_SUFFIX = "_REST_API_TOKEN";

/** Prefixos conhecidos, apenas para desempatar quando há mais de um par no ambiente. */
const KV_PREFERRED_PREFIXES = ["KV", "UPSTASH_REDIS", "STORAGE", "ARMAZENAR"];

/**
 * Descobre credenciais de KV/Upstash sem depender do prefixo exato da integração:
 * qualquer `*_REST_API_URL` (KV_, UPSTASH_REDIS_, STORAGE_, ARMAZENAR_, …) é
 * pareado com o `*_REST_API_TOKEN` do mesmo prefixo. Assim funciona com Vercel KV,
 * Upstash direto e integrações renomeadas.
 */
function resolveKv(): KvBackend | null {
  const env = process.env;
  const read = (key: string) => env[key]?.trim() || undefined;

  const urlKeys = Object.keys(env).filter((key) => key.endsWith(KV_URL_SUFFIX) && read(key));
  if (urlKeys.length === 0) return null;

  const prefixOf = (key: string) => key.slice(0, -KV_URL_SUFFIX.length);
  const rank = (key: string) => {
    const index = KV_PREFERRED_PREFIXES.indexOf(prefixOf(key));
    return index === -1 ? KV_PREFERRED_PREFIXES.length : index;
  };
  const ordered = [...urlKeys].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  for (const urlKey of ordered) {
    const token = read(`${prefixOf(urlKey)}${KV_TOKEN_SUFFIX}`);
    if (!token) continue;
    return {
      url: read(urlKey)!.replace(/\/+$/, ""),
      token,
      key: read("STORE_CONFIG_KV_KEY") || "luhgab_store_config",
    };
  }
  return null;
}

const KV = resolveKv();

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isMoney = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v > 0 && v < 1_000_000;

export class ConfigValidationError extends Error {}

/** Falha de persistência já traduzida para uma mensagem acionável. */
export class StoreConfigStorageError extends Error {}

/** Onde a configuração está sendo persistida neste processo. */
export type StoreConfigBackend = "kv" | "tmp" | "file";
export function getStoreConfigBackend(): StoreConfigBackend {
  if (KV) return "kv";
  return IS_VERCEL ? "tmp" : "file";
}

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

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

/** Executa um comando no REST do Upstash: ["GET", key] / ["SET", key, value]. */
async function kvCommand(command: (string | number)[]): Promise<unknown> {
  if (!KV) return null;
  const response = await fetch(KV.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Upstash respondeu HTTP ${response.status}.`);
  const payload = (await response.json()) as { result?: unknown; error?: string };
  if (payload.error) throw new Error(`Upstash: ${payload.error}`);
  return payload.result;
}

/** Ordem de leitura: KV → (na Vercel) /tmp → baseline do deploy → /tmp local. */
async function readRaw(): Promise<string | null> {
  if (KV) {
    try {
      const value = await kvCommand(["GET", KV.key]);
      if (typeof value === "string" && value.trim()) return value;
    } catch (error) {
      console.error("[storeConfig] falha ao ler do KV; usando fallback local:", error);
    }
  }

  const candidates = [
    ...new Set(IS_VERCEL ? [TMP_PATH, STORE_CONFIG_PATH] : [STORE_CONFIG_PATH, TMP_PATH]),
  ];
  for (const candidate of candidates) {
    try {
      const raw = await fs.readFile(candidate, "utf8");
      if (raw.trim()) return raw;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") {
        console.warn(`[storeConfig] não foi possível ler ${candidate} (${code ?? "erro"}).`);
      }
    }
  }
  return null;
}

/** Lê sem cache e já validando o formato (config inválida cai no padrão). */
async function readConfigFromStorage(): Promise<StoreConfig> {
  const raw = await readRaw();
  if (!raw) return DEFAULT_STORE_CONFIG;
  try {
    return parseStoreConfig(JSON.parse(raw));
  } catch (error) {
    console.error("[storeConfig] configuração inválida no storage; usando padrão:", error);
    return DEFAULT_STORE_CONFIG;
  }
}

const CACHE_TTL_MS = 10_000;
let cache: { at: number; config: StoreConfig } | null = null;

/**
 * Configuração vigente da loja. Nunca lança: se o storage falhar, devolve o
 * padrão para a vitrine continuar no ar.
 */
export async function loadStoreConfig(): Promise<StoreConfig> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.config;
  const config = await readConfigFromStorage();
  cache = { at: Date.now(), config };
  return config;
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

let writeQueue: Promise<unknown> = Promise.resolve();

/** Serializa gravações e mantém a fila viva mesmo quando um job falha. */
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const task = writeQueue.then(job);
  writeQueue = task.catch(() => undefined);
  return task;
}

async function writeJsonFile(target: string, json: string): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, target);
}

/**
 * Tenta KV primeiro e cai para arquivo/tmp em qualquer falha (EROFS, EACCES,
 * rede). Só lança `StoreConfigStorageError` quando nenhum destino funcionou,
 * com uma mensagem que diz o que configurar — nunca um EROFS cru.
 */
async function persist(config: StoreConfig): Promise<StoreConfig> {
  const payload: StoreConfig = { ...parseStoreConfig(config), updatedAt: new Date().toISOString() };
  const json = JSON.stringify(payload, null, 2);

  if (KV) {
    try {
      await kvCommand(["SET", KV.key, json]);
      cache = { at: Date.now(), config: payload };
      return payload;
    } catch (error) {
      console.error("[storeConfig] falha ao gravar no KV; tentando fallback local:", error);
    }
  }

  const targets = [
    ...new Set(IS_VERCEL ? [TMP_PATH, STORE_CONFIG_PATH] : [STORE_CONFIG_PATH, TMP_PATH]),
  ];
  for (const target of targets) {
    try {
      await writeJsonFile(target, json);
      cache = { at: Date.now(), config: payload };
      return payload;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? "erro";
      console.warn(`[storeConfig] não foi possível gravar em ${target} (${code}); tentando próximo destino.`);
    }
  }

  throw new StoreConfigStorageError(
    "Não foi possível salvar a configuração: nenhum destino gravável. Na Vercel, conecte um Upstash Redis e defina KV_REST_API_URL + KV_REST_API_TOKEN.",
  );
}

/** Substitui a configuração inteira, de forma atômica e serializada. */
export function saveStoreConfig(config: StoreConfig): Promise<StoreConfig> {
  return enqueue(() => persist(config));
}

/**
 * Lê o estado atual (sem cache), aplica a mutação, valida e grava — tudo dentro
 * da fila, para que patches concorrentes não se percam.
 */
export function updateStoreConfig(mutator: (current: StoreConfig) => StoreConfig): Promise<StoreConfig> {
  return enqueue(async () => persist(mutator(await readConfigFromStorage())));
}

/** Valores efetivos de um produto (baseline do código + override do lojista). */
export function getEffectiveProduct(id: string, config?: StoreConfig) {
  const base = getBaselineProduct(id);
  if (!base) return null;
  const override = (config ?? cache?.config ?? DEFAULT_STORE_CONFIG).products[id] ?? {};
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
