import { NextResponse } from "next/server";
import {
  errorResponse,
  isAuthorized,
  isRecord,
  normalizeHeroMode,
  readJsonBody,
  revalidateCatalog,
  unauthorized,
} from "@/lib/adminApi";
import { loadStoreConfig, updateStoreConfig } from "@/lib/storeConfig";
import type { StoreConfig } from "@/types/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Projeção pública do Hero: usa "fixed" (contrato externo) e "pinned" (UI). */
function present(config: StoreConfig) {
  const mode = config.hero.mode;
  const productId = config.hero.productId;
  const lotteryProductIds = config.hero.lotteryProductIds ?? [];
  const heroMode = mode === "pinned" ? "fixed" : "random";
  return {
    heroMode,
    mode,
    featuredProductId: productId,
    productId,
    lotteryProductIds,
    hero: { heroMode, mode, featuredProductId: productId, productId, lotteryProductIds },
    updatedAt: config.updatedAt ?? null,
  };
}

const respond = (config: StoreConfig, status = 200) => {
  const view = present(config);
  return NextResponse.json({ ok: true, data: view, ...view }, { status });
};

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) return unauthorized();
  return respond(loadStoreConfig());
}

async function applyPatch(request: Request) {
  if (!(await isAuthorized(request))) return unauthorized();

  const body = await readJsonBody(request);
  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "Corpo da requisição inválido." }, { status: 422 });
  }

  const hero = isRecord(body.hero) ? body.hero : {};
  const rawMode = hero.heroMode ?? hero.mode ?? body.heroMode ?? body.mode;
  const rawFeatured =
    hero.featuredProductId !== undefined
      ? hero.featuredProductId
      : hero.productId !== undefined
        ? hero.productId
        : body.featuredProductId !== undefined
          ? body.featuredProductId
          : body.productId;

  const nextMode = rawMode === undefined ? undefined : normalizeHeroMode(rawMode);
  if (rawMode !== undefined && nextMode === undefined) {
    return NextResponse.json(
      { ok: false, error: "heroMode deve ser 'fixed' (ou 'pinned') ou 'random'." },
      { status: 422 },
    );
  }
  if (rawFeatured !== undefined && rawFeatured !== null && typeof rawFeatured !== "string") {
    return NextResponse.json({ ok: false, error: "featuredProductId deve ser string ou null." }, { status: 422 });
  }

  const rawLottery =
    hero.lotteryProductIds !== undefined ? hero.lotteryProductIds : body.lotteryProductIds;
  if (
    rawLottery !== undefined &&
    rawLottery !== null &&
    (!Array.isArray(rawLottery) || rawLottery.some((id) => typeof id !== "string"))
  ) {
    return NextResponse.json(
      { ok: false, error: "lotteryProductIds deve ser uma lista de IDs ou null." },
      { status: 422 },
    );
  }

  if (nextMode === undefined && rawFeatured === undefined && rawLottery === undefined) {
    return NextResponse.json(
      { ok: false, error: "Nenhum campo válido enviado (heroMode/featuredProductId/lotteryProductIds)." },
      { status: 422 },
    );
  }

  try {
    const config = await updateStoreConfig((current) => {
      const mode = nextMode ?? current.hero.mode;
      const productId =
        rawFeatured === null
          ? null
          : ((rawFeatured as string | undefined) ?? current.hero.productId);
      const lotteryProductIds =
        rawLottery === undefined
          ? current.hero.lotteryProductIds
          : rawLottery === null
            ? undefined
            : (rawLottery as string[]);
      return { ...current, hero: { ...current.hero, mode, productId, lotteryProductIds } };
    });
    revalidateCatalog();
    return respond(config);
  } catch (error) {
    return errorResponse(error, "falha ao atualizar o Hero");
  }
}

export async function PUT(request: Request) {
  return applyPatch(request);
}

export async function PATCH(request: Request) {
  return applyPatch(request);
}
