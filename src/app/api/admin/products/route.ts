import { NextResponse } from "next/server";
import {
  errorResponse,
  isAuthorized,
  isRecord,
  readJsonBody,
  revalidateCatalog,
  unauthorized,
} from "@/lib/adminApi";
import { loadStoreConfig, updateStoreConfig } from "@/lib/storeConfig";
import type { ProductOverride } from "@/types/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const FIELDS = ["price", "originalPrice", "isFeatured", "isBestSeller", "discountPercentage"] as const;

type Entry = { id: string; patch: Record<string, unknown> };

/** Extrai entradas de payload unitário (`{ id, ...campos }`) ou em lote (`{ overrides: { id: {...} } }`). */
function parseEntries(body: unknown): Entry[] {
  if (!isRecord(body)) return [];

  if (isRecord(body.overrides)) {
    return Object.entries(body.overrides).map(([id, patch]) => ({
      id,
      patch: isRecord(patch) ? patch : {},
    }));
  }

  const id =
    typeof body.id === "string" ? body.id : typeof body.productId === "string" ? body.productId : null;
  return id ? [{ id, patch: body }] : [];
}

/** Aplica um patch sobre o override existente; `null` remove o campo (volta ao padrão). */
function mergeOverride(current: ProductOverride | undefined, patch: Record<string, unknown>): ProductOverride | null {
  const next: ProductOverride = { ...(current ?? {}) };
  for (const field of FIELDS) {
    if (!(field in patch)) continue;
    const value = patch[field];
    if (value === null) {
      delete next[field];
    } else {
      // A validação de tipo/faixa fica em parseStoreConfig (fonte única).
      (next as Record<string, unknown>)[field] = value;
    }
  }
  return Object.keys(next).length > 0 ? next : null;
}

const respond = (overrides: Record<string, ProductOverride>, updatedAt?: string) =>
  NextResponse.json({
    ok: true,
    data: { overrides, count: Object.keys(overrides).length, updatedAt: updatedAt ?? null },
    overrides,
    count: Object.keys(overrides).length,
    updatedAt: updatedAt ?? null,
  });

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) return unauthorized();
  const config = await loadStoreConfig();
  return respond(config.products, config.updatedAt);
}

async function applyPatches(request: Request) {
  if (!(await isAuthorized(request))) return unauthorized();

  const body = await readJsonBody(request);
  const entries = parseEntries(body);
  if (entries.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Envie { id, ...campos } ou { overrides: { [id]: { ...campos } } }." },
      { status: 422 },
    );
  }

  try {
    const config = await updateStoreConfig((current) => {
      const products = { ...current.products };
      for (const { id, patch } of entries) {
        const merged = mergeOverride(products[id], patch);
        if (merged) products[id] = merged;
        else delete products[id];
      }
      return { ...current, products };
    });
    revalidateCatalog();
    return respond(config.products, config.updatedAt);
  } catch (error) {
    return errorResponse(error, "falha ao atualizar overrides de produto");
  }
}

export async function PUT(request: Request) {
  return applyPatches(request);
}

export async function PATCH(request: Request) {
  return applyPatches(request);
}

/**
 * DELETE /api/admin/products?id=xxx   → remove o override de um produto
 * DELETE /api/admin/products?ids=a,b  → remove vários
 * DELETE /api/admin/products          → limpa todos os overrides
 */
export async function DELETE(request: Request) {
  if (!(await isAuthorized(request))) return unauthorized();

  const { searchParams } = new URL(request.url);
  const single = searchParams.get("id");
  const many = searchParams.get("ids");
  const ids = single
    ? [single]
    : many
      ? many
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

  try {
    const config = await updateStoreConfig((current) => {
      const products = { ...current.products };
      if (ids.length === 0) {
        for (const key of Object.keys(products)) delete products[key];
      } else {
        for (const id of ids) delete products[id];
      }
      return { ...current, products };
    });
    revalidateCatalog();
    return respond(config.products, config.updatedAt);
  } catch (error) {
    return errorResponse(error, "falha ao remover overrides de produto");
  }
}
