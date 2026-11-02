import type { Product, ProductSize } from "@/types/product";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Primeiro número de um texto ("24 g" -> 24, "1,8kg" -> 1.8). */
export function parseNumber(text: string): number | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(",", ".")) : null;
}

interface Quantity {
  amount: number;
  family: "g" | "unit";
}

/** Lê "30 g (1 scoop)", "1,8kg", "60 cápsulas" em uma quantidade comparável. */
function parseQuantity(text: string): Quantity | null {
  const match = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .match(/(\d+(?:[.,]\d+)?)\s*(kg|g|capsula|comprimido)/);
  if (!match) return null;
  const amount = parseFloat(match[1].replace(",", "."));
  if (match[2] === "kg") return { amount: amount * 1000, family: "g" };
  if (match[2] === "g") return { amount, family: "g" };
  return { amount, family: "unit" };
}

/** Número de doses de um tamanho, ou null se não for possível calcular. */
export function getDoses(product: Product, size: ProductSize): number | null {
  const serving = parseQuantity(product.nutritionalFacts.servingSize);
  const pack = parseQuantity(size.label);
  if (!serving || !pack || serving.family !== pack.family || serving.amount <= 0) {
    return null;
  }
  return Math.floor(pack.amount / serving.amount);
}

export function getPricePerDose(product: Product, size: ProductSize): number | null {
  const doses = getDoses(product, size);
  return doses ? round2((product.price * size.priceMultiplier) / doses) : null;
}

/** Perfil típico de aminoácidos por 100 g de proteína de soro (referência estimada). */
const AMINO_PROFILE: [string, number][] = [
  ["Leucina", 0.105],
  ["Isoleucina", 0.063],
  ["Valina", 0.058],
  ["Lisina", 0.093],
  ["Treonina", 0.07],
  ["Fenilalanina", 0.03],
  ["Metionina", 0.022],
  ["Triptofano", 0.017],
  ["Ácido glutâmico", 0.165],
];

export function getAminogram(product: Product): { name: string; grams: number }[] {
  const protein = parseNumber(product.nutritionalFacts.protein) ?? 0;
  if (protein <= 0) return [];
  return AMINO_PROFILE.map(([name, fraction]) => ({
    name,
    grams: round2(protein * fraction),
  }));
}
