import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
  isSecureRequest,
  sessionCookieOptions,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

// Freio simples contra tentativas em sequência (por processo).
let failures = 0;
let blockedUntil = 0;

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Acesso do lojista não configurado. Defina ADMIN_PASSWORD (mín. 8 caracteres) no .env.local." },
      { status: 503 },
    );
  }
  if (Date.now() < blockedUntil) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns segundos." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    failures += 1;
    if (failures >= 5) {
      blockedUntil = Date.now() + 30_000;
      failures = 0;
    }
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  failures = 0;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions(isSecureRequest(request)));
  return response;
}
