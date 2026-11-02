export type ProductCategory =
  | "proteina"
  | "creatina"
  | "pre-treino"
  | "aminoacidos"
  | "vitaminas"
  | "emagrecimento"
  | "termogenicos";

export type ProductObjective =
  | "hipertrofia"
  | "emagrecimento"
  | "energia-forca"
  | "saude-imunidade"
  | "resistencia";

export type ComboRole = "protein" | "energy" | "health";

export interface ProductFlavor {
  id: string;
  name: string;
  inStock: boolean;
  hexColor?: string;
}

export interface ProductSize {
  id: string;
  label: string;
  priceMultiplier: number;
  inStock: boolean;
}

export interface NutritionalRow {
  nutrient: string;
  amount: string;
  dailyValue: string;
}

export interface NutritionalFacts {
  servingSize: string;
  protein: string;
  carbs: string;
  bcaa: string;
  calories: string;
  table: NutritionalRow[];
}

export interface Model3DConfig {
  /** `cutout` usa a própria foto recortada, para sacos, caixas e bebidas. */
  type: "whey-tub" | "creatine-jar" | "capsule-bottle" | "cutout";
  color: string;
  labelTexture?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  category: ProductCategory;
  objective: ProductObjective;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  installments: number;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isFeatured: boolean;
  inStock: boolean;
  flavors: ProductFlavor[];
  sizes: ProductSize[];
  nutritionalFacts: NutritionalFacts;
  model3DConfig: Model3DConfig;
  comboRole: ComboRole | null;
  shortDescription: string;
  fullDescription: string;
  suggestedUse: string;
  benefits: string[];
  imageUrl?: string;
  /** Fotos adicionais (outros ângulos, verso, tabela nutricional) exibidas na galeria. */
  images?: string[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  originCountry: string;
  logoUrl: string;
  badgeText: string;
}
