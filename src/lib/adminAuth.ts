import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Autenticação simples de lojista: senha única em ADMIN_PASSWORD + cookie assinado. */
export const ADMIN_COOKIE = "lg_admin";
const SESSION_SECONDS = 60 * 60 * 12;

const password = () => process.env.ADMIN_PASSWORD ?? "";
const secret = () => process.env.ADMIN_SESSION_SECRET || `lg:${password()}`;

export const isAdminConfigured = () => password().length >= 8;

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(candidate: string): boolean {
  return isAdminConfigured() && safeEqual(sign(candidate), sign(password()));
}

export function createSessionToken(): string {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${sign(expires)}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isAdminConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;
  return Number(expires) > Math.floor(Date.now() / 1000);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

/**
 * Atributos do cookie de sessão. `secure` só é ligado quando a requisição veio
 * por HTTPS — assim o /admin também funciona em `next start` local via http.
 */
export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

/** Detecta HTTPS considerando proxy reverso (x-forwarded-proto). */
export function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}
