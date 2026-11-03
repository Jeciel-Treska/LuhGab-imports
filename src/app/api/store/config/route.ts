import { NextResponse } from "next/server";
import { loadStoreConfig } from "@/lib/storeConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Configuração pública (sem auth) usada pelo cliente para se ressincronizar com
 * o servidor mesmo quando a CDN ainda serve um HTML levemente antigo.
 *
 * Cache curto de propósito: 1s na CDN, com stale-while-revalidate de 5s —
 * suficiente para absorver rajadas sem atrasar a propagação de mudanças do Hero.
 */
export async function GET() {
  const config = await loadStoreConfig();
  return NextResponse.json(
    { hero: config.hero, products: config.products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1, stale-while-revalidate=5",
      },
    },
  );
}
