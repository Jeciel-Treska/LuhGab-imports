import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { ConfigValidationError } from "@/lib/storeConfig";

/**
 * Autorização das rotas de administração.
 *
 * - UI (/admin): cookie de sessão assinado criado por POST /api/admin/login.
 * - Automação/CLI: header `x-admin-token` quando `ADMIN_API_TOKEN` está definido.
 */
export async function isAuthorized(request: Request): Promise<boolean> {
  const token = process.env.ADMIN_API_TOKEN?.trim();
  if (token && request.headers.get("x-admin-token") === token) return true;
  return isAdminAuthenticated();
}

export const unauthorized = () =>
  NextResponse.json({ ok: false, error: "Sessão expirada. Entre novamente." }, { status: 401 });

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ConfigValidationError("Content-Type deve ser application/json.");
  }
  return request.json();
}

/** Invalida o cache das páginas que exibem catálogo/hero. */
export function revalidateCatalog(): void {
  revalidatePath("/", "layout");
  revalidatePath("/produtos");
  revalidatePath("/produto/[id]", "page");
}

/** Converte erros de domínio/parse em respostas JSON consistentes. */
export function errorResponse(error: unknown, fallback: string): NextResponse {
  if (error instanceof ConfigValidationError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 422 });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }
  console.error(`[admin/api] ${fallback}`, error);
  return NextResponse.json(
    { ok: false, error: "Não foi possível gravar no disco. Em hospedagem serverless o sistema de arquivos é somente leitura." },
    { status: 500 },
  );
}

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Aceita "fixed" (contrato externo) e "pinned" (UI) como o mesmo modo. */
export function normalizeHeroMode(value: unknown): "pinned" | "random" | undefined {
  if (value === "fixed" || value === "pinned") return "pinned";
  if (value === "random") return "random";
  return undefined;
}
