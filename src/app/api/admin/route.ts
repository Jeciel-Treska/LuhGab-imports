import { NextResponse } from "next/server";
import {
  errorResponse,
  isAuthorized,
  isRecord,
  readJsonBody,
  revalidateCatalog,
  unauthorized,
} from "@/lib/adminApi";
import { products } from "@/data/products";
import {
  getEffectiveProduct,
  getStoreConfigBackend,
  loadStoreConfig,
  saveStoreConfig,
} from "@/lib/storeConfig";
import type { StoreConfig } from "@/types/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Estado completo para o painel /admin:
 * hero + overrides + catálogo com os valores efetivos já aplicados.
 */
export async function GET(request: Request) {
  if (!(await isAuthorized(request))) return unauthorized();

  const config = await loadStoreConfig();
  const heroMode = config.hero.mode === "pinned" ? "fixed" : "random";

  const catalog = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brandName,
    category: product.category,
    inStock: product.inStock,
    imageUrl: product.imageUrl ?? null,
    ...getEffectiveProduct(product.id, config),
  }));

  return NextResponse.json({
    ok: true,
    data: {
      heroMode,
      mode: config.hero.mode,
      featuredProductId: config.hero.productId,
      productId: config.hero.productId,
      hero: {
        heroMode,
        mode: config.hero.mode,
        featuredProductId: config.hero.productId,
        productId: config.hero.productId,
      },
      updatedAt: config.updatedAt ?? null,
      storage: getStoreConfigBackend(),
      overrides: config.products,
      overrideCount: Object.keys(config.products).length,
      products: catalog,
    },
  });
}

/** Substitui a configuração inteira no formato do store ({ hero, products }). */
export async function PUT(request: Request) {
  if (!(await isAuthorized(request))) return unauthorized();
  try {
    const body = await readJsonBody(request);
    if (!isRecord(body) || !isRecord(body.hero) || !isRecord(body.products)) {
      return NextResponse.json(
        { ok: false, error: "Envie { hero: { mode, productId }, products: { [id]: {...} } }." },
        { status: 422 },
      );
    }
    const saved = await saveStoreConfig(body as unknown as StoreConfig);
    revalidateCatalog();
    return NextResponse.json({ ok: true, data: saved });
  } catch (error) {
    return errorResponse(error, "falha ao substituir a configuração");
  }
}
