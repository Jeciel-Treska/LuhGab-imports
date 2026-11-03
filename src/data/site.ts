/**
 * Número do WhatsApp de vendas, com DDI e DDD, só dígitos.
 * Pode ser sobrescrito por NEXT_PUBLIC_WHATSAPP_NUMBER no ambiente.
 */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5541995609501"
).replace(/\D/g, "");

/**
 * Exibe notas e contagens de avaliações. Mantenha desligado até existirem
 * avaliações reais: os valores atuais em products.ts são ilustrativos.
 */
export const SHOW_RATINGS: boolean = false;

/** Razão social e CNPJ exibidos nas páginas legais quando preenchidos. */
export const COMPANY_LEGAL_NAME = "";
export const COMPANY_CNPJ = "";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da LuhGab Imports e gostaria de ajuda para escolher meu suplemento.";

export function buildWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** URL pública do site (definir NEXT_PUBLIC_SITE_URL em produção). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://luhgabimports.com.br"
).replace(/\/$/, "");
export const SITE_NAME = "LuhGab Imports";

/** Meta de frete grátis (R$) e desconto no Pix (%) */
export const FREE_SHIPPING_THRESHOLD = 299;
export const PIX_DISCOUNT_PERCENT = 10;

export const categoryLabels = {
  proteina: "Whey Protein",
  creatina: "Creatina",
  "pre-treino": "Pré-Treino",
  aminoacidos: "Aminoácidos",
  vitaminas: "Vitaminas & Ômega 3",
  emagrecimento: "Emagrecimento",
  termogenicos: "Termogênicos",
} as const;

export const objectiveLabels = {
  hipertrofia: "Hipertrofia",
  emagrecimento: "Emagrecimento",
  "energia-forca": "Energia e Força",
  "saude-imunidade": "Saúde e Imunidade",
  resistencia: "Resistência",
} as const;
