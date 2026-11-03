import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  ConfigValidationError,
  loadStoreConfig,
  parseStoreConfig,
  saveStoreConfig,
  StoreConfigStorageError,
} from "@/lib/storeConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  return NextResponse.json(await loadStoreConfig());
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type inválido." }, { status: 415 });
  }

  try {
    const config = parseStoreConfig(await request.json());
    await saveStoreConfig(config);
    // Re-renderiza o site (layout + páginas estáticas) com os novos preços e destaques.
    revalidatePath("/", "layout");
    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }
    if (error instanceof StoreConfigStorageError) {
      console.error("Falha de persistência da configuração da loja", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Falha ao salvar a configuração da loja", error);
    return NextResponse.json(
      { error: "Não foi possível salvar a configuração. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
