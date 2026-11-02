import type {
  ComboRole,
  Model3DConfig,
  NutritionalFacts,
  Product,
  ProductCategory,
  ProductFlavor,
  ProductObjective,
  ProductSize,
} from "@/types/product";
import type { StoreConfig } from "@/types/store";
import { brands, getBrandById } from "./brands";

/** Embalagens que não são potes: o 3D usa a foto recortada do produto. */
const CUTOUT_PRODUCT_IDS = new Set([
  "vitafor-whey-protein-wpc",
  "diabo-verde-ftw-whey",
  "uevo-uevolucao-proteina",
  "max-super-gainers",
  "max-super-whey",
  "im-whey-100-pure",
  "vitamin-horse-anabolic-mass",
  "nutrata-protobar",
  "nutrata-yopro-plus",
  "probiotica-whey-bar",
  "danone-yopro-shake-morango",
  "italac-pro-play",
  "vigor-viv-chocolate",
  "demons-lab-psycho-killer",
]);

// ---------------------------------------------------------------------------
// Helpers de construção
// ---------------------------------------------------------------------------

const flavor = (
  name: string,
  hexColor: string,
  inStock = true,
): ProductFlavor => ({
  id: name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  name,
  hexColor,
  inStock,
});

const size = (
  label: string,
  priceMultiplier: number,
  inStock = true,
): ProductSize => ({
  id: label.toLowerCase().replace(/[^a-z0-9]+/g, ""),
  label,
  priceMultiplier,
  inStock,
});

const row = (nutrient: string, amount: string, dailyValue = "**") => ({
  nutrient,
  amount,
  dailyValue,
});

interface ProductSeed {
  imageUrl?: string;
  images?: string[];
  id: string;
  slug: string;
  name: string;
  brandId: string;
  category: ProductCategory;
  objective: ProductObjective;
  /** Preço base (menor tamanho) */
  price: number;
  originalPrice: number;
  installments?: number;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  flavors: ProductFlavor[];
  sizes: ProductSize[];
  nutritionalFacts: NutritionalFacts;
  model3DConfig: Model3DConfig;
  comboRole: ComboRole | null;
  shortDescription: string;
  fullDescription: string;
  suggestedUse: string;
  benefits: string[];
}

function defineProduct(seed: ProductSeed): Product {
  const brand = getBrandById(seed.brandId);
  if (!brand) throw new Error(`Marca desconhecida: ${seed.brandId}`);
  const discountPercentage = Math.round(
    (1 - seed.price / seed.originalPrice) * 100,
  );
  const texturePath = `/products/textures/${seed.id}-label.png`;
  const isCutout = CUTOUT_PRODUCT_IDS.has(seed.id) && Boolean(seed.imageUrl);
  return {
    ...seed,
    brandName: brand.name,
    discountPercentage,
    installments: seed.installments ?? 6,
    isBestSeller: seed.isBestSeller ?? false,
    isFeatured: seed.isFeatured ?? false,
    inStock: seed.inStock ?? true,
    model3DConfig: isCutout
      ? { ...seed.model3DConfig, type: "cutout", labelTexture: seed.imageUrl }
      : {
          ...seed.model3DConfig,
          labelTexture: seed.model3DConfig.labelTexture ?? texturePath,
        },
  };
}

// Sabores e tamanhos reutilizáveis
const WHEY_FLAVORS = [
  flavor("Chocolate", "#5C3A21"),
  flavor("Baunilha", "#F3E5AB"),
  flavor("Morango", "#E0556B"),
  flavor("Cookies & Cream", "#C9B8A6"),
];
const WHEY_SIZES = [
  size("900g", 1),
  size("1,8kg", 1.85),
  size("2,27kg", 2.3),
];
const CREATINE_SIZES = [size("150g", 1), size("300g", 1.8), size("1kg", 4.8)];
const CAPS_SIZES = [size("60 cápsulas", 1), size("120 cápsulas", 1.8)];

const wheyFacts = (
  serving: string,
  protein: string,
  carbs: string,
  bcaa: string,
  calories: string,
  fat: string,
): NutritionalFacts => ({
  servingSize: serving,
  protein,
  carbs,
  bcaa,
  calories,
  table: [
    row("Valor energético", calories, "6%"),
    row("Carboidratos", carbs, "1%"),
    row("Proteínas", protein, "41%"),
    row("Gorduras totais", fat, "1%"),
    row("Gorduras saturadas", "0,5 g", "2%"),
    row("Sódio", "130 mg", "5%"),
    row("BCAA", bcaa),
    row("Glutamina", "4 g"),
  ],
});

const noMacroFacts = (
  serving: string,
  table: NutritionalFacts["table"],
  calories = "0 kcal",
): NutritionalFacts => {
  // Lê os macros da tabela do produto; sem o dado, "-" em vez de afirmar zero.
  const fromTable = (pattern: RegExp) =>
    table.find((r) => pattern.test(r.nutrient) && /\d/.test(r.amount))?.amount ?? "-";
  return {
    servingSize: serving,
    protein: fromTable(/prote[ií]na/i),
    carbs: fromTable(/carboidrato/i),
    bcaa: fromTable(/bcaa/i),
    calories,
    table,
  };
};

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

const RAW_SEEDS: ProductSeed[] = [
  {
    id: "under-labz-dimethylex",
    imageUrl: "/products/under-labz-dimethylex.png",
    slug: "under-labz-dimethylex",
    name: "Dimethylex Thermogenic Fat Burner",
    brandId: "under-labz",
    category: "termogenicos",
    objective: "emagrecimento",
    price: 89.9,
    originalPrice: 149.9,
    installments: 10,
    rating: 4.9,
    reviewCount: 860,
    isBestSeller: true,
    isFeatured: true,
    flavors: [flavor("Sem sabor", "#DC2626")],
    sizes: [size("60 cápsulas", 1)],
    nutritionalFacts: noMacroFacts(
      "2 cápsulas",
      [
        row("Morosil", "Conforme rótulo"),
        row("SynePlus+", "Conforme rótulo"),
      ],
      "0 kcal",
    ),
    model3DConfig: { type: "capsule-bottle", color: "#DC2626" },
    comboRole: "energy",
    shortDescription: "Termogênico em cápsulas com Morosil e SynePlus+ para foco, energia e definição.",
    fullDescription:
      "Termogênico Under Labz com Morosil, que auxilia na redução de gordura abdominal, e SynePlus+, que potencializa o efeito termogênico. Foco, energia e disposição para os treinos. Contém 60 cápsulas.",
    suggestedUse: "Tomar 2 cápsulas ao dia. Produto proibido para menores de 19 anos. Mantenha fora do alcance de crianças.",
    benefits: [
      "Acelera o metabolismo",
      "Auxilia na queima de gordura",
      "Mais energia e disposição",
      "Foco e concentração",
      "Mais performance e resistência",
    ],
  },

  {
    id: "dux-creatina-creapure",
    imageUrl: "/products/dux-creatina-creapure-300g.png",
    images: [
      "/products/dux-creatina-creapure-300g-2.png",
      "/products/dux-creatina-creapure-300g-3.png",
      "/products/dux-creatina-creapure-300g-tabela.png",
    ],
    slug: "dux-creatina-creapure",
    name: "Creatina Creapure®",
    brandId: "dux-nutrition",
    category: "creatina",
    objective: "energia-forca",
    price: 129.9,
    originalPrice: 159.9,
    rating: 4.9,
    reviewCount: 356,
    isBestSeller: true,
    flavors: [flavor("Sem sabor", "#E5E7EB")],
    sizes: [size("150g", 1), size("300g", 1.8)],
    nutritionalFacts: noMacroFacts("3 g (1 dose)", [
      row("Creatina monohidratada Creapure®", "3 g"),
      row("Valor energético", "0 kcal", "0%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#0F766E" },
    comboRole: "energy",
    shortDescription: "Creatina alemã Creapure®, pureza superior a 99,9%.",
    fullDescription:
      "Matéria-prima alemã com selo Creapure®, livre de contaminantes e com controle rigoroso de pureza. Para quem não abre mão de qualidade.",
    suggestedUse: "3 g ao dia, diluídos em água ou suco, todos os dias, inclusive nos de descanso.",
    benefits: ["Pureza acima de 99,9%", "Mais força e explosão", "Sem aditivos"],
  },

  {
    id: "max-creatina-100",
    imageUrl: "/products/max-creatina-300g.png",
    slug: "max-titanium-creatina-100-pura",
    name: "Creatina 100% Pura",
    brandId: "max-titanium",
    category: "creatina",
    objective: "energia-forca",
    price: 79.9,
    originalPrice: 99.9,
    rating: 4.8,
    reviewCount: 1820,
    flavors: [flavor("Sem sabor", "#E5E7EB")],
    sizes: [size("100g", 1), size("300g", 2.5), size("1kg", 6.5)],
    nutritionalFacts: noMacroFacts("3 g (1 colher)", [
      row("Creatina monohidratada", "3 g"),
      row("Valor energético", "0 kcal", "0%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#DC2626" },
    comboRole: "energy",
    shortDescription: "Creatina monohidratada 100% pura, sem enchimento.",
    fullDescription: "Creatina pura para ganho de força, potência e volume muscular, com excelente custo-benefício.",
    suggestedUse: "3 g ao dia diluídos em água ou suco.",
    benefits: ["100% pura", "Mais força e explosão", "Melhor desempenho nos treinos"],
  },

  {
    id: "adaptogen-tasty-whey-original",
    imageUrl: "/products/adaptogen-tasty-whey-original.png",
    slug: "adaptogen-tasty-whey-original",
    name: "Tasty Whey Original",
    brandId: "adaptogen-science",
    category: "proteina",
    objective: "hipertrofia",
    price: 189.9,
    originalPrice: 249.9,
    rating: 4.9,
    reviewCount: 2420,
    isBestSeller: true,
    isFeatured: true,
    flavors: [
      flavor("Original", "#F5F0E8"),
      flavor("Vanilla Cream", "#F7E8C0"),
      flavor("Chocolate", "#5C3A21"),
      flavor("Morango", "#E0556B"),
    ],
    sizes: [size("900g", 1), size("912g (2 lbs)", 1.05)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "24 g", "3 g", "5,3 g", "120 kcal", "2 g"),
    model3DConfig: { type: "whey-tub", color: "#D4A017" },
    comboRole: "protein",
    shortDescription: "Sabor único de leite em pó, com 24g de proteína por dose.",
    fullDescription:
      "Tasty Whey da Adaptogen Science é a proteína americana que conquistou o Brasil pelo sabor único de leite em pó. Fórmula com 24g de proteína, 5,3g de BCAA e 2,3g de leucina. Sem corantes artificiais, sem açúcares adicionados e sem glúten.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, 1 a 2 vezes ao dia, preferencialmente após o treino.",
    benefits: [
      "24g de proteína por dose",
      "5,3g de BCAA naturais",
      "Sabor de leite em pó",
      "Sem corantes artificiais",
      "Fácil dissolução",
    ],
  },

  {
    id: "vitafor-whey-fort-3w",
    imageUrl: "/products/vitafor-whey-fort-3w-baunilha.png",
    images: [
      "/products/vitafor-whey-fort-3w-baunilha-2.png",
      "/products/vitafor-whey-fort-3w-baunilha-3.png",
    ],
    slug: "vitafor-whey-fort-3w",
    name: "Whey Fort 3W",
    brandId: "vitafor",
    category: "proteina",
    objective: "hipertrofia",
    price: 190.0,
    originalPrice: 240.0,
    rating: 4.7,
    reviewCount: 876,
    isFeatured: true,
    flavors: [
      flavor("Baunilha", "#F3E5AB"),
      flavor("Mochaccino", "#6F4E37"),
      flavor("Chocolate", "#5C3A21"),
    ],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "24 g", "2 g", "5 g", "118 kcal", "1,5 g"),
    model3DConfig: { type: "whey-tub", color: "#C0392B" },
    comboRole: "protein",
    shortDescription: "Blend 3W (isolado, concentrado e hidrolisado) com 24g de proteína e 5g de BCAA.",
    fullDescription:
      "Whey Fort 3W da Vitafor combina três fontes de whey protein para uma absorção rápida e sustentada. Com 24g de proteína por dose, 5g de BCAAs, 5g de L-Glutamina e baixo teor de gorduras e carboidratos. Auxilia na formação dos músculos e ossos.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, 1 a 2 vezes ao dia, preferencialmente após o treino.",
    benefits: [
      "3 fontes de whey (isolado, concentrado, hidrolisado)",
      "24g de proteína por dose",
      "5g de L-Glutamina",
      "5g de BCAAs e 12g de EAAs",
      "Sem açúcar adicionado",
    ],
  },

  {
    id: "vitafor-whey-protein-wpc",
    imageUrl: "/products/vitafor-whey-protein-wpc.png",
    slug: "vitafor-whey-protein-wpc",
    name: "Whey Protein WPC",
    brandId: "vitafor",
    category: "proteina",
    objective: "hipertrofia",
    price: 149.9,
    originalPrice: 189.9,
    rating: 4.6,
    reviewCount: 432,
    flavors: [
      flavor("Baunilha", "#F3E5AB"),
      flavor("Chocolate", "#5C3A21"),
    ],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "21 g", "3 g", "4,5 g", "125 kcal", "2 g"),
    model3DConfig: { type: "whey-tub", color: "#E8D5B0" },
    comboRole: "protein",
    shortDescription: "Whey concentrado com 21g de proteína, BCAAs e EAAs por porção.",
    fullDescription:
      "Vitafor Whey Protein WPC é um concentrado de alta qualidade com 21g de proteína por porção, fonte de L-Glutamina, BCAAs e EAAs. Auxilia na formação dos músculos e ossos e na recuperação muscular.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "21g de proteína por dose",
      "Fonte de L-Glutamina",
      "Fonte de BCAAs e EAAs",
      "Auxilia na recuperação muscular",
    ],
  },

  {
    id: "vitafor-creafort",
    imageUrl: "/products/vitafor-creafort.png",
    slug: "vitafor-creafort",
    name: "Creafort Creapure®",
    brandId: "vitafor",
    category: "creatina",
    objective: "energia-forca",
    price: 109.9,
    originalPrice: 139.9,
    rating: 4.8,
    reviewCount: 312,
    flavors: [flavor("Sem sabor", "#E5E7EB")],
    sizes: [size("300g", 1)],
    nutritionalFacts: noMacroFacts("3 g (1 colher)", [
      row("Creatina monohidratada Creapure®", "3 g"),
      row("Valor energético", "0 kcal", "0%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#8B0000" },
    comboRole: "energy",
    shortDescription: "Creatina 100% pura Creapure®, produto vegano, zero açúcares.",
    fullDescription:
      "Creafort da Vitafor utiliza a creatina monohidratada alemã Creapure®, com pureza superior a 99,9%. Produto vegano, zero açúcares, não contém glúten. Auxilia no aumento do desempenho físico.",
    suggestedUse: "3 g ao dia diluídos em água ou suco, todos os dias, inclusive nos de descanso.",
    benefits: [
      "Creatina Creapure® alemã",
      "100% pura e vegana",
      "Zero açúcares",
      "Não contém glúten",
      "Aumenta força e desempenho",
    ],
  },

  {
    id: "vitafor-creatina",
    imageUrl: "/products/vitafor-creatina-300g.png",
    slug: "vitafor-creatina",
    name: "Vitafor Creatine",
    brandId: "vitafor",
    category: "creatina",
    objective: "energia-forca",
    price: 99.9,
    originalPrice: 129.9,
    rating: 4.7,
    reviewCount: 245,
    flavors: [flavor("Sem sabor", "#E5E7EB")],
    sizes: [size("300g", 1)],
    nutritionalFacts: noMacroFacts("3 g (1 colher)", [
      row("Creatina monohidratada", "3.000 mg"),
      row("Valor energético", "0 kcal", "0%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#B22222" },
    comboRole: "energy",
    shortDescription: "Creatina monohidratada 100% pura, zero açúcar, não contém glúten.",
    fullDescription:
      "Vitafor Creatine é uma creatina monohidratada de alta pureza que auxilia no aumento do desempenho físico. Zero açúcar, sem corantes artificiais, não contém glúten.",
    suggestedUse: "3 g ao dia diluídos em água ou suco.",
    benefits: [
      "3.000 mg de creatina monohidratada",
      "Zero açúcar",
      "Sem corantes artificiais",
      "Auxilia no desempenho físico",
    ],
  },

  {
    id: "growth-creatina-monohidratada",
    imageUrl: "/products/growth-creatina-monohidratada-500g.png",
    slug: "growth-creatina-monohidratada",
    name: "Creatina Monohidratada 500g",
    brandId: "growth-supplements",
    category: "creatina",
    objective: "energia-forca",
    price: 89.9,
    originalPrice: 119.9,
    rating: 4.7,
    reviewCount: 1420,
    isBestSeller: true,
    flavors: [flavor("Sem sabor", "#7BB661")],
    sizes: [size("500g", 1)],
    nutritionalFacts: noMacroFacts("3 g (1 colher)", [
      row("Creatina monohidratada", "3 g"),
      row("Valor energético", "0 kcal", "0%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#1C3D1C" },
    comboRole: "energy",
    shortDescription: "Creatina monohidratada 100% pura, 500g de pura qualidade.",
    fullDescription:
      "Growth Supplements Creatina Monohidratada é um suplemento de creatina pura em pó para aumentar força, potência e desempenho nos treinos. Qualidade comprovada, 100% monohidratada, suplemento original.",
    suggestedUse: "3 g ao dia diluídos em água ou suco. Consuma todos os dias, inclusive nos de descanso.",
    benefits: [
      "Aumenta a força",
      "Melhora o desempenho",
      "Mais disposição",
      "Auxilia no ganho de massa muscular",
      "Recuperação muscular mais rápida",
    ],
  },

  {
    id: "growth-creatina-creapure",
    imageUrl: "/products/growth-creatina-creapure-250g.png",
    slug: "growth-creatina-creapure-250g",
    name: "Creatina Creapure® 250g",
    brandId: "growth-supplements",
    category: "creatina",
    objective: "energia-forca",
    price: 119.9,
    originalPrice: 149.9,
    rating: 4.8,
    reviewCount: 890,
    flavors: [flavor("Sem sabor", "#7C4FA8")],
    sizes: [size("250g", 1)],
    nutritionalFacts: noMacroFacts("3 g (1 comprimido)", [
      row("Creatina monohidratada Creapure®", "3 g"),
      row("Valor energético", "0 kcal", "0%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#5B2D8E" },
    comboRole: "energy",
    shortDescription: "Creatina Creapure® alemã, 100% autêntica, em comprimidos.",
    fullDescription:
      "Growth Supplements Creatina Creapure® é a creatina alemã de máxima pureza e qualidade. 100% Creapure® made in Germany. Auxilia na recuperação muscular e aumenta a força e resistência nos treinos.",
    suggestedUse: "Tome conforme orientação do rótulo. Consuma com água ou suco.",
    benefits: [
      "100% Creapure® Made in Germany",
      "Máxima pureza e qualidade",
      "Ganho de força e resistência",
      "Recuperação muscular",
      "Hipertrofia muscular",
    ],
  },

  {
    id: "growth-arginine-powder",
    imageUrl: "/products/growth-arginine-powder.png",
    slug: "growth-arginine-powder",
    name: "Arginine Powder",
    brandId: "growth-supplements",
    category: "aminoacidos",
    objective: "energia-forca",
    price: 89.9,
    originalPrice: 119.9,
    rating: 4.6,
    reviewCount: 312,
    flavors: [flavor("Maçã Verde", "#65A30D"), flavor("Frutas Vermelhas", "#B91C1C")],
    sizes: [size("250g", 1)],
    nutritionalFacts: noMacroFacts("8 g (1 colher)", [
      row("L-Arginina", "4 g"),
      row("Valor energético", "10 kcal", "1%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#1E3A5F" },
    comboRole: "energy",
    shortDescription: "L-Arginina em pó para vasodilatação, pump e melhor circulação.",
    fullDescription:
      "Growth Supplements Arginine Powder é um suplemento de L-Arginina pura que aumenta a vasodilatação, melhora o pump muscular e auxilia na circulação sanguínea. Ideal para ganho de massa muscular e melhor performance.",
    suggestedUse: "1 colher (8 g) diluída em 250 ml de água, antes do treino.",
    benefits: [
      "Aumenta a vasodilatação e o pump",
      "Mais resistência nos treinos",
      "Melhora a performance e disposição",
      "Óxido nítrico e melhor circulação",
      "Auxilia na recuperação muscular",
    ],
  },

  {
    id: "bvs-beast-kaos",
    imageUrl: "/products/bvs-beast-kaos.png",
    slug: "bvs-beast-kaos",
    name: "Beast Kaos Pré-Treino",
    brandId: "bvs-lab",
    category: "pre-treino",
    objective: "energia-forca",
    price: 149.9,
    originalPrice: 189.9,
    rating: 4.8,
    reviewCount: 512,
    isFeatured: true,
    flavors: [flavor("Uva", "#7C3AED"), flavor("Melancia", "#F43F5E")],
    sizes: [size("300g", 1)],
    nutritionalFacts: noMacroFacts("10 g (1 scoop)", [
      row("L-Arginina", "2.000 mg"),
      row("Taurina", "1.000 mg"),
      row("L-Tirosina", "1.000 mg"),
      row("Cafeína anidra", "400 mg"),
      row("L-Citrulina", "Conforme rótulo"),
    ], "10 kcal"),
    model3DConfig: { type: "creatine-jar", color: "#1A0033" },
    comboRole: "energy",
    shortDescription: "Underground Series: foco intenso, energia e pump com 400mg de cafeína.",
    fullDescription:
      "Beast Kaos da BVS Lab é um pré-treino da Underground Series. Com 400mg de cafeína, 2.000mg de L-Arginina, 1.000mg de Taurina e L-Citrulina para foco, energia e pump muscular em treinos de alta intensidade.",
    suggestedUse: "1 scoop diluído em 250 ml de água, 20 a 30 minutos antes do treino. Não exceder a dose recomendada.",
    benefits: [
      "Foco e energia extremos",
      "Pump muscular intenso",
      "Vasodilatação e óxido nítrico",
      "Mais força e desempenho",
      "Concentração extrema",
    ],
  },

  {
    id: "demons-lab-psycho-killer",
    imageUrl: "/products/demons-lab-psycho-killer.png",
    slug: "demons-lab-psycho-killer",
    name: "Psycho Killer Pré-Treino",
    brandId: "demons-lab",
    category: "pre-treino",
    objective: "energia-forca",
    price: 169.9,
    originalPrice: 219.9,
    rating: 4.9,
    reviewCount: 340,
    isFeatured: true,
    flavors: [flavor("Frutas Vermelhas", "#B91C1C"), flavor("Guaraná", "#7F1D1D")],
    sizes: [size("500ml (líquido)", 1)],
    nutritionalFacts: noMacroFacts("conforme rótulo", [
      row("Cafeína", "Alto teor"),
      row("Citrulina", "Conforme rótulo"),
      row("Beta-Alanina", "Conforme rótulo"),
    ]),
    model3DConfig: { type: "capsule-bottle", color: "#1A0000" },
    comboRole: "energy",
    shortDescription: "Pré-treino líquido com energia, foco e pump, para uso avançado.",
    fullDescription:
      "Psycho Killer da Demons Lab é um pré-treino líquido concentrado, com alto teor de cafeína, citrulina, beta-alanina e ativos de performance para foco, energia e pump. Produto de uso avançado.",
    suggestedUse: "Consumir conforme orientação do rótulo. Produto de uso avançado. Não combine com outras fontes de estimulantes.",
    benefits: [
      "Explosão de energia",
      "Foco absoluto",
      "Mais disposição",
      "Alto desempenho",
      "Concentração extrema",
    ],
  },

  {
    id: "diabo-verde-ftw-whey",
    imageUrl: "/products/diabo-verde-ftw-whey.png",
    slug: "diabo-verde-ftw-100-whey",
    name: "100% Whey Protein",
    brandId: "diabo-verde",
    category: "proteina",
    objective: "hipertrofia",
    price: 159.9,
    originalPrice: 209.9,
    rating: 4.6,
    reviewCount: 298,
    flavors: [
      flavor("Baunilha", "#F3E5AB"),
      flavor("Chocolate", "#5C3A21"),
      flavor("Morango", "#E0556B"),
    ],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "24 g", "3 g", "4,8 g", "120 kcal", "1,5 g"),
    model3DConfig: { type: "whey-tub", color: "#1A2E00" },
    comboRole: "protein",
    shortDescription: "Proteína concentrada importada com 24g por dose, sem corantes artificiais.",
    fullDescription:
      "Diabo Verde 100% Whey Protein FTW é uma proteína concentrada de alta qualidade com 24g de proteína por porção, 11g de EAAs e fonte de L-Glutamina e BCAAs. Sem corantes artificiais e com ótimo custo-benefício.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "24g de proteína por dose",
      "11g de EAAs",
      "Fonte de L-Glutamina e BCAAs",
      "Sem corantes artificiais",
      "Ótimo custo-benefício",
    ],
  },

  {
    id: "vitamin-horse-anabolic-mass",
    imageUrl: "/products/vitamin-horse-mass-3kg.png",
    slug: "vitamin-horse-anabolic-nitro-mass",
    name: "Anabolic Nitro Mass 3kg",
    brandId: "vitamin-horse",
    category: "proteina",
    objective: "hipertrofia",
    price: 299.9,
    originalPrice: 379.9,
    rating: 4.7,
    reviewCount: 198,
    flavors: [flavor("Baunilha", "#F3E5AB"), flavor("Chocolate", "#5C3A21")],
    sizes: [size("3kg", 1)],
    nutritionalFacts: wheyFacts("60 g (2 scoops)", "35 g", "4 g", "7 g", "250 kcal", "3 g"),
    model3DConfig: { type: "whey-tub", color: "#2D1200" },
    comboRole: "protein",
    shortDescription: "Hipercalórico premium com 35g de proteína, creatina e glutamina por porção.",
    fullDescription:
      "Vitamin Horse Anabolic Nitro Mass é o hipercalórico para quem quer ganho de massa muscular sério. 35g de proteína, 5g de creatina, 5g de glutamina, 2g de arginina, Waxy Maize, vitaminas e minerais por porção. Kit Massa completo.",
    suggestedUse: "2 scoops (60 g) em 300-400 ml de leite integral. Consumir 1 a 2 vezes ao dia.",
    benefits: [
      "35g de proteína por dose",
      "Creatina e glutamina incluídas",
      "Waxy Maize de alto desempenho",
      "Vitaminas e minerais",
      "Ganho de massa muscular acelerado",
    ],
  },

  {
    id: "nutrata-protobar",
    imageUrl: "/products/nutrata-protobar-avela.png",
    slug: "nutrata-protobar-avela-whey",
    name: "Protobar Avelã + Whey",
    brandId: "nutrata",
    category: "proteina",
    objective: "hipertrofia",
    price: 149.9,
    originalPrice: 179.9,
    rating: 4.8,
    reviewCount: 434,
    isBestSeller: true,
    flavors: [flavor("Creme de Avelã", "#8B4513"), flavor("Chocolate", "#5C3A21")],
    sizes: [size("Caixa c/ 9 barras (630g)", 1), size("Unidade (70g)", 0.18)],
    nutritionalFacts: noMacroFacts("1 barra (70 g)", [
      row("Proteínas", "19 g"),
      row("Carboidratos", "24 g"),
      row("Gorduras totais", "9 g"),
      row("Valor energético", "248 kcal", "12%"),
      row("Sódio", "180 mg", "7%"),
    ], "248 kcal"),
    model3DConfig: { type: "capsule-bottle", color: "#7B3F00" },
    comboRole: "protein",
    shortDescription: "Barra proteica com 19g de proteína e irresistível sabor de creme de avelã.",
    fullDescription:
      "Nutrata Protobar Avelã + Whey é a barra proteica com Whey Protein e delicioso creme de avelã. 19g de proteína por barra, baixo teor de açúcar. A caixa contém 9 unidades de 70g.",
    suggestedUse: "Consumir 1 barra por dia como complemento alimentar.",
    benefits: [
      "19g de proteína por barra",
      "Com Whey Protein",
      "Baixo teor de açúcar",
      "Sabor irresistível",
      "Prático para o dia a dia",
    ],
  },

  {
    id: "nutrata-yopro-plus",
    imageUrl: "/products/nutrata-yopro-plus.png",
    slug: "nutrata-yopro-plus-cappuccino",
    name: "YoPRO+ Energy Boost",
    brandId: "nutrata",
    category: "proteina",
    objective: "resistencia",
    price: 139.9,
    originalPrice: 169.9,
    rating: 4.7,
    reviewCount: 287,
    flavors: [flavor("Cappuccino c/ Nibs de Cacau", "#6F4E37")],
    sizes: [size("Caixa c/ 12 unidades (660g)", 1)],
    nutritionalFacts: noMacroFacts("1 barra (55 g)", [
      row("Proteínas", "15 g"),
      row("Cafeína", "75 mg"),
      row("Carboidratos", "20 g"),
      row("Valor energético", "210 kcal", "10%"),
    ], "210 kcal"),
    model3DConfig: { type: "capsule-bottle", color: "#3D1C00" },
    comboRole: null,
    shortDescription: "Barra proteica com 15g de proteína e 75mg de cafeína para energia no dia a dia.",
    fullDescription:
      "Nutrata YoPRO+ Energy Boost é a barra proteica com 15g de proteína e 75mg de cafeína (equivalente a 1 expresso). Auxilia na recuperação muscular, mais foco e disposição. Sabor cappuccino irresistível.",
    suggestedUse: "Consumir 1 barra por dia como complemento alimentar.",
    benefits: [
      "15g de proteína por barra",
      "75mg de cafeína (1 expresso)",
      "Mais foco e disposição",
      "Auxilia na recuperação muscular",
      "Ideal para o dia a dia",
    ],
  },

  {
    id: "probiotica-iso-protein-blend",
    imageUrl: "/products/probiotica-iso-protein-blend.png",
    slug: "probiotica-iso-protein-blend",
    name: "ISO Protein Blend",
    brandId: "probiotica",
    category: "proteina",
    objective: "hipertrofia",
    price: 229.9,
    originalPrice: 279.9,
    rating: 4.7,
    reviewCount: 567,
    isFeatured: true,
    flavors: [
      flavor("Baunilha", "#F3E5AB"),
      flavor("Chocolate", "#5C3A21"),
      flavor("Morango", "#E0556B"),
    ],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "25 g", "2 g", "4.743 mg", "115 kcal", "1 g"),
    model3DConfig: { type: "whey-tub", color: "#1A3A6E" },
    comboRole: "protein",
    shortDescription: "Blend proteico com 25g por dose, probióticos e sem açúcares.",
    fullDescription:
      "Probiótica ISO Protein Blend combina Whey Protein de alta qualidade com 25g de proteína, 4.743mg de BCAA e probióticos para auxílio na digestão. Rico em vitaminas e minerais, sem açúcares e sem glúten.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "25g de proteína por dose",
      "4.743mg de BCAA",
      "Com probióticos para digestão",
      "Sem açúcares",
      "Sem glúten",
    ],
  },

  {
    id: "probiotica-whey-bar",
    imageUrl: "/products/probiotica-whey-bar.png",
    slug: "probiotica-whey-bar",
    name: "Whey Bar Cookies & Cream",
    brandId: "probiotica",
    category: "proteina",
    objective: "hipertrofia",
    price: 9.9,
    originalPrice: 12.9,
    rating: 4.6,
    reviewCount: 1120,
    isBestSeller: true,
    flavors: [flavor("Cookies & Cream", "#C9B8A6"), flavor("Chocolate", "#5C3A21")],
    sizes: [size("Unidade (40g)", 1), size("Caixa c/ 24 un.", 22)],
    nutritionalFacts: noMacroFacts("1 barra (40 g)", [
      row("Proteínas", "15 g"),
      row("BCAAs", "Conforme rótulo"),
      row("Carboidratos", "15 g"),
      row("Valor energético", "175 kcal", "9%"),
    ], "175 kcal"),
    model3DConfig: { type: "capsule-bottle", color: "#2D2D2D" },
    comboRole: null,
    shortDescription: "Barra proteica low carb com 15g de proteína e BCAAs. Sem glúten.",
    fullDescription:
      "Probiótica Whey Bar é a barra proteica com 15g de proteína e BCAAs para recuperação muscular. Low carb, sem glúten e com sabor irresistível de Cookies & Cream. Prática para o dia a dia.",
    suggestedUse: "Consumir 1 barra por dia como complemento alimentar.",
    benefits: [
      "15g de proteína por barra",
      "BCAAs para recuperação",
      "Low carb",
      "Sem glúten",
      "Prática para o dia a dia",
    ],
  },

  {
    id: "uevo-uevolucao-proteina",
    imageUrl: "/products/uevo-uevolucao-proteina.png",
    slug: "uevo-uevolucao-da-proteina",
    name: "Uêvolução da Proteína",
    brandId: "uevo",
    category: "proteina",
    objective: "hipertrofia",
    price: 199.9,
    originalPrice: 249.9,
    rating: 4.8,
    reviewCount: 312,
    isFeatured: true,
    flavors: [
      flavor("Explosão de Chocolate", "#3D1C00"),
      flavor("Baunilha", "#F3E5AB"),
    ],
    sizes: [size("1kg", 1)],
    nutritionalFacts: wheyFacts("28 g (1 scoop)", "21 g", "2 g", "5 g", "110 kcal", "1 g"),
    model3DConfig: { type: "whey-tub", color: "#D4A017" },
    comboRole: "protein",
    shortDescription: "Zero lactose, zero glúten e 21g de proteína por dose.",
    fullDescription:
      "Uêvo Uêvolução da Proteína é a proteína perfeita para intolerantes à lactose e ao glúten. Com 21g de proteína por porção de 28g, zero lactose e zero glúten. Sabor incrível e dissolução fácil.",
    suggestedUse: "1 scoop (28 g) em 200 ml de água ou leite vegetal, após o treino.",
    benefits: [
      "21g de proteína por dose",
      "Zero lactose",
      "Zero glúten",
      "Mais energia para o dia",
      "Auxilia na recuperação muscular",
    ],
  },

  {
    id: "max-super-gainers",
    imageUrl: "/products/max-super-gainers.png",
    slug: "max-titanium-super-gainers",
    name: "Super Gainers Anticatabolic",
    brandId: "max-titanium",
    category: "proteina",
    objective: "hipertrofia",
    price: 259.9,
    originalPrice: 329.9,
    rating: 4.7,
    reviewCount: 980,
    isBestSeller: true,
    flavors: [flavor("Baunilha", "#F3E5AB"), flavor("Chocolate", "#5C3A21")],
    sizes: [size("3kg", 1)],
    nutritionalFacts: wheyFacts("40 g (1 scoop)", "16 g", "8 g", "3 g", "165 kcal", "1 g"),
    model3DConfig: { type: "whey-tub", color: "#8B0000" },
    comboRole: "protein",
    shortDescription: "Hipercalórico com 16g de proteína, 3g de creatina e Waxy Maize. 3kg.",
    fullDescription:
      "Max Titanium Super Gainers é o hipercalórico anticatabólico para ganho de massa muscular. Cada porção conta com 16g de proteína, 3.000mg de creatina, 3g de BCAA e carboidratos complexos Waxy Maize. Sem glúten.",
    suggestedUse: "1 scoop (40 g) em 200-300 ml de leite ou água, 1 a 3 vezes ao dia.",
    benefits: [
      "16g de proteína por dose",
      "3g de creatina por dose",
      "Waxy Maize de alto desempenho",
      "Sem glúten",
      "Ganho de massa muscular",
    ],
  },

  {
    id: "max-horus-elite",
    imageUrl: "/products/max-horus-elite.png",
    slug: "max-titanium-horus-elite",
    name: "Horus Elite Pré-Treino",
    brandId: "max-titanium",
    category: "pre-treino",
    objective: "energia-forca",
    price: 159.9,
    originalPrice: 199.9,
    rating: 4.8,
    reviewCount: 756,
    isFeatured: true,
    flavors: [flavor("Red Explosion", "#B91C1C"), flavor("Limão", "#84CC16")],
    sizes: [size("390g", 1)],
    nutritionalFacts: noMacroFacts("13 g (1 scoop)", [
      row("Beta-Alanina", "2 g"),
      row("Cafeína anidra", "400 mg"),
      row("Taurina", "2.000 mg"),
      row("L-Arginina", "2.000 mg"),
      row("L-Citrulina-L-Arginina", "4 mg"),
    ], "10 kcal"),
    model3DConfig: { type: "creatine-jar", color: "#5C0000" },
    comboRole: "energy",
    shortDescription: "Pré-treino de alta intensidade com 400mg de cafeína, taurina e arginina.",
    fullDescription:
      "Max Titanium Horus Elite é um pré-treino de alta intensidade. Com 400mg de cafeína, 2.000mg de taurina, 2.000mg de arginina e beta-alanina para energia, foco e pump em treinos intensos.",
    suggestedUse: "1 scoop diluído em 250 ml de água, 20 a 30 minutos antes do treino. Alto teor de cafeína.",
    benefits: [
      "400mg de cafeína",
      "Energia e foco extremos",
      "2.000mg de taurina",
      "Pump muscular intenso",
      "Mais força e resistência",
    ],
  },

  {
    id: "max-whey-pro",
    imageUrl: "/products/max-whey-pro-1kg.png",
    slug: "max-titanium-whey-pro",
    name: "Whey Pro",
    brandId: "max-titanium",
    category: "proteina",
    objective: "hipertrofia",
    price: 149.9,
    originalPrice: 189.9,
    rating: 4.6,
    reviewCount: 645,
    flavors: [flavor("Baunilha", "#F3E5AB"), flavor("Chocolate", "#5C3A21")],
    sizes: [size("1kg", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "15 g", "4 g", "3,4 g", "130 kcal", "2 g"),
    model3DConfig: { type: "whey-tub", color: "#1E3A8A" },
    comboRole: "protein",
    shortDescription: "Whey proteico com 15g de proteína e 3,4g de BCAA por porção.",
    fullDescription:
      "Max Titanium Whey Pro é um suplemento proteico de alta qualidade com 15g de proteína por porção. Auxilia na formação dos músculos e ossos. Sem glúten e de fácil digestão.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "15g de proteína por dose",
      "3,4g de BCAA",
      "Alto teor de proteínas",
      "Sem glúten",
      "Fácil digestão",
    ],
  },

  {
    id: "max-100-whey-double-tasty",
    imageUrl: "/products/max-100-whey-double-tasty.png",
    slug: "max-titanium-100-whey-double-tasty",
    name: "100% Whey Double Tasty",
    brandId: "max-titanium",
    category: "proteina",
    objective: "hipertrofia",
    price: 169.9,
    originalPrice: 219.9,
    rating: 4.8,
    reviewCount: 892,
    isBestSeller: true,
    flavors: [
      flavor("Baunilha", "#F3E5AB"),
      flavor("Caramelo Macchiato", "#C68E4B"),
      flavor("Chocolate", "#5C3A21"),
    ],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "20 g", "2 g", "4.515 mg", "125 kcal", "1,5 g"),
    model3DConfig: { type: "whey-tub", color: "#1A1A2E" },
    comboRole: "protein",
    shortDescription: "100% Whey com 20g de proteína, Dino Series. Sem glúten.",
    fullDescription:
      "Max Titanium 100% Whey Double Tasty é a proteína da Dino Series com 20g de proteína e 4.515mg de BCAA por porção. Matéria-prima de alta qualidade e sem glúten.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "20g de proteína por dose",
      "4.515mg de BCAA",
      "Sem glúten",
      "Matéria-prima de alta qualidade",
      "Sabor marcante",
    ],
  },

  {
    id: "max-femini-whey",
    imageUrl: "/products/max-femini-whey.png",
    slug: "max-titanium-femini-whey",
    name: "Femini Whey",
    brandId: "max-titanium",
    category: "proteina",
    objective: "emagrecimento",
    price: 189.9,
    originalPrice: 239.9,
    rating: 4.8,
    reviewCount: 743,
    isFeatured: true,
    flavors: [flavor("Baunilha", "#F3E5AB"), flavor("Morango", "#E0556B")],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "27 g", "1 g", "7 g", "115 kcal", "0,5 g"),
    model3DConfig: { type: "whey-tub", color: "#BE185D" },
    comboRole: "protein",
    shortDescription: "Whey feminino com 27g de proteína, colágeno hidrolisado e vitaminas.",
    fullDescription:
      "Max Titanium Femini Whey é formulado especialmente para mulheres, com 27g de proteína, 7g de BCAA e colágeno hidrolisado. Auxilia no ganho de massa muscular, saúde da pele, cabelos e unhas, e no metabolismo e definição corporal.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "27g de proteína por dose",
      "7g de BCAA",
      "Com colágeno hidrolisado",
      "Vitaminas e minerais",
      "Auxilia na definição corporal",
    ],
  },

  {
    id: "max-super-whey",
    imageUrl: "/products/max-super-whey.png",
    slug: "max-titanium-super-whey",
    name: "Super Whey",
    brandId: "max-titanium",
    category: "proteina",
    objective: "hipertrofia",
    price: 179.9,
    originalPrice: 229.9,
    rating: 4.7,
    reviewCount: 534,
    flavors: [flavor("Baunilha", "#F3E5AB"), flavor("Chocolate", "#5C3A21")],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "30 g", "2 g", "6.220 mg", "130 kcal", "1 g"),
    model3DConfig: { type: "whey-tub", color: "#1E40AF" },
    comboRole: "protein",
    shortDescription: "Super Whey com 30g de proteína e 6.220mg de BCAA por dose. Nova fórmula.",
    fullDescription:
      "Max Titanium Super Whey Nova Fórmula com 30g de proteína e 6.220mg de BCAA por porção. Blend proteico de alta qualidade com probióticos para digestão e rico em vitaminas e minerais.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "30g de proteína por dose",
      "6.220mg de BCAA",
      "Com probióticos",
      "Rico em vitaminas e minerais",
      "Fácil dissolução",
    ],
  },

  {
    id: "im-whey-100-pure",
    imageUrl: "/products/im-whey-100-pure.png",
    slug: "integralmedica-whey-100-puro",
    name: "Whey 100% Pure",
    brandId: "integralmedica",
    category: "proteina",
    objective: "hipertrofia",
    price: 179.9,
    originalPrice: 229.9,
    rating: 4.7,
    reviewCount: 1234,
    isBestSeller: true,
    flavors: [
      flavor("Baunilha", "#F3E5AB"),
      flavor("Chocolate", "#5C3A21"),
      flavor("Morango", "#E0556B"),
    ],
    sizes: [size("900g", 1)],
    nutritionalFacts: wheyFacts("30 g (1 scoop)", "21 g", "3 g", "4 g", "120 kcal", "2 g"),
    model3DConfig: { type: "whey-tub", color: "#DC2626" },
    comboRole: "protein",
    shortDescription: "Concentrado com 21g de proteína e 9g de EAA por dose.",
    fullDescription:
      "IntegralMedica Whey 100% Pure é um concentrado de alta qualidade. de alta qualidade com 21g de proteína, 9g de EAA e 4g de BCAA por porção. Alta concentração de proteína, fácil dissolução e excelente sabor.",
    suggestedUse: "1 scoop (30 g) em 200 ml de água ou leite, após o treino.",
    benefits: [
      "21g de proteína por dose",
      "9g de EAA",
      "4g de BCAA",
      "Fácil dissolução",
      "Excelente sabor",
    ],
  },

  {
    id: "im-creatina-hardcore",
    imageUrl: "/products/im-creatina-hardcore-300g.png",
    slug: "integralmedica-creatina-hardcore",
    name: "Creatina Hardcore 100% Pura",
    brandId: "integralmedica",
    category: "creatina",
    objective: "energia-forca",
    price: 99.9,
    originalPrice: 129.9,
    rating: 4.7,
    reviewCount: 876,
    flavors: [flavor("Sem sabor", "#E5E7EB")],
    sizes: [size("300g", 1)],
    nutritionalFacts: noMacroFacts("3 g (1 colher)", [
      row("Creatina monohidratada", "3 g"),
      row("Valor energético", "0 kcal", "0%"),
    ]),
    model3DConfig: { type: "creatine-jar", color: "#DC2626" },
    comboRole: "energy",
    shortDescription: "Creatina 100% pura sem aditivos e sem sabor, qualidade e procedência garantidas.",
    fullDescription:
      "IntegralMedica Creatina Hardcore é 100% pura, sem aditivos e sem sabor. Aumenta força e desempenho, melhora resistência, auxilia no ganho de massa muscular e acelera a recuperação muscular.",
    suggestedUse: "3 g ao dia diluídos em água ou suco, todos os dias.",
    benefits: [
      "100% pura",
      "Sem aditivos e sem sabor",
      "Aumenta força e desempenho",
      "Qualidade e procedência garantidas",
      "Acelera a recuperação muscular",
    ],
  },

  {
    id: "danone-yopro-shake-morango",
    imageUrl: "/products/danone-yopro-shake-morango.png",
    slug: "danone-yopro-shake-morango",
    name: "YoPRO Shake Morango",
    brandId: "danone-yopro",
    category: "proteina",
    objective: "resistencia",
    price: 7.9,
    originalPrice: 9.9,
    rating: 4.8,
    reviewCount: 2340,
    isBestSeller: true,
    isFeatured: true,
    flavors: [flavor("Morango", "#E0556B"), flavor("Chocolate", "#5C3A21"), flavor("Baunilha", "#F3E5AB")],
    sizes: [size("Unidade 250ml", 1), size("Caixa c/ 12 un.", 11)],
    nutritionalFacts: noMacroFacts("1 unidade (250 ml)", [
      row("Proteínas", "15 g"),
      row("Carboidratos", "10 g"),
      row("Gorduras totais", "0,5 g"),
      row("Valor energético", "95 kcal", "5%"),
    ], "95 kcal"),
    model3DConfig: { type: "capsule-bottle", color: "#1C1C1C" },
    comboRole: "protein",
    shortDescription: "Shake proteico com 15g de proteína, zero adição de açúcares. Prático e delicioso.",
    fullDescription:
      "Danone YoPRO Shake é o shake proteico pronto para beber com 15g de proteína por caixinha, zero adição de açúcares e baixo teor de gorduras. Ajuda a recuperar e fortalecer os músculos.",
    suggestedUse: "Agite antes de beber. Consuma gelado. Ideal para pós-treino ou lanche.",
    benefits: [
      "15g de proteína por caixinha",
      "Zero adição de açúcares",
      "Baixo teor de gorduras",
      "Pronto para beber",
      "Auxilia na recuperação muscular",
    ],
  },

  {
    id: "italac-pro-play",
    imageUrl: "/products/italac-pro-play.png",
    slug: "italac-pro-play-baunilha",
    name: "Italac Pro Play",
    brandId: "italac",
    category: "proteina",
    objective: "resistencia",
    price: 8.9,
    originalPrice: 11.9,
    rating: 4.7,
    reviewCount: 1120,
    isBestSeller: true,
    flavors: [flavor("Baunilha", "#F3E5AB"), flavor("Chocolate", "#5C3A21")],
    sizes: [size("Unidade 250ml", 1), size("Caixa c/ 12 un.", 10)],
    nutritionalFacts: noMacroFacts("1 unidade (250 ml)", [
      row("Proteínas", "15 g"),
      row("Carboidratos", "8 g"),
      row("Gorduras totais", "0,5 g"),
      row("Valor energético", "90 kcal", "4%"),
    ], "90 kcal"),
    model3DConfig: { type: "capsule-bottle", color: "#1A1A1A" },
    comboRole: "protein",
    shortDescription: "Bebida láctea UHT zero lactose com 15g de proteína por caixinha.",
    fullDescription:
      "Italac Pro Play é uma bebida láctea UHT sabor baunilha para dietas com restrição de lactose. Com 15g de proteína por caixinha (250ml), zero lactose e zero adição de açúcares. Ajuda na recuperação e fortalecimento muscular.",
    suggestedUse: "Consumir gelado. Ideal para pós-treino ou lanche protéico.",
    benefits: [
      "15g de proteína por caixinha",
      "Zero lactose",
      "Zero adição de açúcares",
      "Baixo teor de gorduras",
      "Prático e saboroso",
    ],
  },

  {
    id: "vigor-viv-chocolate",
    imageUrl: "/products/vigor-viv-chocolate.png",
    slug: "vigor-viv-chocolate",
    name: "Vigor Viv Chocolate",
    brandId: "vigor",
    category: "proteina",
    objective: "resistencia",
    price: 7.9,
    originalPrice: 9.9,
    rating: 4.6,
    reviewCount: 876,
    flavors: [flavor("Chocolate", "#5C3A21"), flavor("Baunilha", "#F3E5AB")],
    sizes: [size("Unidade 250ml", 1), size("Caixa c/ 12 un.", 10)],
    nutritionalFacts: noMacroFacts("1 unidade (250 ml)", [
      row("Proteínas", "15 g"),
      row("Carboidratos", "9 g"),
      row("Gorduras totais", "0,5 g"),
      row("Valor energético", "92 kcal", "5%"),
    ], "92 kcal"),
    model3DConfig: { type: "capsule-bottle", color: "#3D1C00" },
    comboRole: "protein",
    shortDescription: "Bebida láctea com 15g de proteína, sem lactose e sem adição de açúcares.",
    fullDescription:
      "Vigor Viv é a bebida láctea proteica para o dia a dia. Com 15g de proteínas, sem lactose e sem adição de açúcares. Sabor chocolate irresistível. Rica em proteínas para recuperação e fortalecimento muscular.",
    suggestedUse: "Agite antes de beber. Consumir gelado. Ideal para pós-treino.",
    benefits: [
      "15g de proteína por caixinha",
      "Sem lactose",
      "Sem adição de açúcares",
      "Rico em proteínas",
      "Prático para o dia a dia",
    ],
  },

  {
    id: "biovigor-curcumen",
    imageUrl: "/products/biovigor-curcumen.png",
    slug: "biovigor-curcumen",
    name: "Curcumen",
    brandId: "biovigor",
    category: "vitaminas",
    objective: "saude-imunidade",
    price: 69.9,
    originalPrice: 89.9,
    rating: 4.7,
    reviewCount: 234,
    flavors: [flavor("Sem sabor", "#D97706")],
    sizes: [size("60 cápsulas", 1)],
    nutritionalFacts: noMacroFacts("2 cápsulas", [
      row("Extrato de cúrcuma (curcumina)", "Conforme rótulo"),
      row("Piperina", "Conforme rótulo"),
      row("Valor energético", "5 kcal", "0%"),
    ], "5 kcal"),
    model3DConfig: { type: "capsule-bottle", color: "#D97706" },
    comboRole: "health",
    shortDescription: "Curcumina premium com ação anti-inflamatória, antioxidante e suporte imunológico.",
    fullDescription:
      "BioVigor Curcumen é a fórmula premium com extrato de cúrcuma e piperina para máxima absorção. Ação anti-inflamatória, antioxidante, saúde cardiovascular, saúde do cérebro e imunidade.",
    suggestedUse: "2 cápsulas ao dia junto a uma refeição.",
    benefits: [
      "Ação anti-inflamatória",
      "Mais energia e disposição",
      "Fortalece a imunidade",
      "Saúde do coração",
      "Alta absorção",
    ],
  },

  {
    id: "gecaps-magnesio-inositol",
    imageUrl: "/products/gecaps-magnesio-inositol.png",
    slug: "gecaps-magnesio-inositol",
    name: "Magnésio & Inositol",
    brandId: "gecaps-latam",
    category: "vitaminas",
    objective: "saude-imunidade",
    price: 89.9,
    originalPrice: 119.9,
    rating: 4.8,
    reviewCount: 178,
    flavors: [flavor("Maracujá", "#FACC15")],
    sizes: [size("300g", 1)],
    nutritionalFacts: noMacroFacts("10 g (1 colher)", [
      row("Magnésio", "350 mg"),
      row("Inositol", "2 g"),
      row("Taurina", "200 mg"),
      row("Melatonina", "0,21 mg"),
    ], "10 kcal"),
    model3DConfig: { type: "creatine-jar", color: "#D4AF37" },
    comboRole: "health",
    shortDescription: "Magnésio, Inositol, Taurina e Melatonina para sono, foco e equilíbrio.",
    fullDescription:
      "Gecaps Latam Magnésio & Inositol combina 350mg de Magnésio, 2g de Inositol, 200mg de Taurina e 0,21mg de Melatonina para melhorar a qualidade do sono, reduzir estresse e ansiedade, mais foco e bem-estar.",
    suggestedUse: "1 colher (10 g) diluída em 200 ml de água, preferencialmente à noite.",
    benefits: [
      "Sono de qualidade",
      "Menos ansiedade",
      "Mais foco e bem-estar",
      "Auxilia na função muscular",
      "Regula o sono natural",
    ],
  }
];

export const products: Product[] = RAW_SEEDS.map(defineProduct);

// ---------------------------------------------------------------------------
// Sobrescritas do lojista (/admin)
// ---------------------------------------------------------------------------

type EditableFields = Pick<Product, "price" | "originalPrice" | "isFeatured" | "isBestSeller">;

const baseline = new Map<string, EditableFields>(
  products.map((p) => [
    p.id,
    { price: p.price, originalPrice: p.originalPrice, isFeatured: p.isFeatured, isBestSeller: p.isBestSeller },
  ]),
);

/** Valores originais do código, antes de qualquer edição do lojista. */
export function getBaselineProduct(id: string): EditableFields | undefined {
  return baseline.get(id);
}

/**
 * Aplica (de forma idempotente) as edições do lojista sobre o catálogo em memória.
 * Parte sempre dos valores originais, então remover uma edição restaura o padrão.
 */
export function applyStoreOverrides(overrides: StoreConfig["products"]): void {
  for (const product of products) {
    const base = baseline.get(product.id);
    if (!base) continue;
    const o = overrides[product.id] ?? {};
    product.price = o.price ?? base.price;
    product.originalPrice = o.originalPrice ?? base.originalPrice;
    product.isFeatured = o.isFeatured ?? base.isFeatured;
    product.isBestSeller = o.isBestSeller ?? base.isBestSeller;
    product.discountPercentage =
      o.discountPercentage ?? Math.max(0, Math.round((1 - product.price / product.originalPrice) * 100));
  }
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByBrand(brandId: string): Product[] {
  return products.filter((product) => product.brandId === brandId);
}

/** Marcas com ao menos um produto no catálogo. */
export function getBrandsWithProducts() {
  return brands.filter((brand) => getProductsByBrand(brand.id).length > 0);
}

export function getProductsByObjective(objective: ProductObjective): Product[] {
  return products.filter((product) => product.objective === objective);
}

export function getFeaturedProducts(limit?: number): Product[] {
  const featured = products.filter((product) => product.isFeatured);
  return limit === undefined ? featured : featured.slice(0, limit);
}

/** Produtos elegíveis para o montador de combo, opcionalmente filtrados por papel. */
export function getComboCandidates(role?: ComboRole): Product[] {
  return products.filter(
    (product) =>
      product.inStock &&
      product.comboRole !== null &&
      (role === undefined || product.comboRole === role),
  );
}
