import type { Brand } from "@/types/product";

/**
 * Slots de marca. Para trocar uma marca final, edite apenas o item
 * correspondente aqui (mantendo o `id`) — os produtos referenciam `brandId`.
 */
export const brands: Brand[] = [
  {
    id: "optimum-nutrition",
    name: "Optimum Nutrition",
    slug: "optimum-nutrition",
    description:
      "Padrão ouro importado dos EUA. Referência mundial em whey e suplementação esportiva há mais de 30 anos.",
    originCountry: "Estados Unidos",
    logoUrl: "/brands/optimum-nutrition.svg",
    badgeText: "Padrão Ouro EUA",
  },
  {
    id: "dux-nutrition",
    name: "Dux Nutrition",
    slug: "dux-nutrition",
    description:
      "Linha premium clean label, com formulações transparentes e matérias-primas selecionadas.",
    originCountry: "Brasil",
    logoUrl: "/brands/dux-nutrition.svg",
    badgeText: "Clean Label",
  },
  {
    id: "max-titanium",
    name: "Max Titanium",
    slug: "max-titanium",
    description:
      "Alta performance e campeã de vendas. Tecnologia e sabor para quem leva o treino a sério.",
    originCountry: "Brasil",
    logoUrl: "/brands/max-titanium.svg",
    badgeText: "Mais Vendida",
  },
  {
    id: "dark-lab",
    name: "Dark Lab",
    slug: "dark-lab",
    description:
      "Hardcore: dosagens cavalares e foco total em força e intensidade.",
    originCountry: "Brasil",
    logoUrl: "/brands/dark-lab.svg",
    badgeText: "Hardcore",
  },
  {
    id: "integralmedica",
    name: "IntegralMedica",
    slug: "integralmedica",
    description:
      "Tradição e potência esportiva, com décadas de presença no mercado brasileiro.",
    originCountry: "Brasil",
    logoUrl: "/brands/integralmedica.svg",
    badgeText: "Tradição",
  },
  {
    id: "under-labz",
    name: "Under Labz",
    slug: "under-labz",
    description:
      "Linha termogênica hardcore para quem busca foco, energia e definição extrema.",
    originCountry: "Brasil",
    logoUrl: "/brands/under-labz.svg",
    badgeText: "Hardcore",
  },
  {
    id: "luhgab-signature",
    name: "LuhGab Signature",
    slug: "luhgab-signature",
    description:
      "Linha importada exclusiva, selecionada pela LuhGab Imports com laudo e procedência.",
    originCountry: "Importado",
    logoUrl: "/brands/luhgab-signature.svg",
    badgeText: "Exclusivo",
  },

  {
    id: "adaptogen-science",
    name: "Adaptogen Science",
    slug: "adaptogen-science",
    description:
      "Proteína americana com foco em sabor real. O Tasty Whey é eleito melhor sabor do mercado.",
    originCountry: "Estados Unidos",
    logoUrl: "/brands/adaptogen-science.svg",
    badgeText: "Melhor Sabor",
  },
  {
    id: "vitafor",
    name: "Vitafor",
    slug: "vitafor",
    description:
      "Suplementação de alta qualidade com matérias-primas selecionadas e fórmulas avançadas para atletas.",
    originCountry: "Brasil",
    logoUrl: "/brands/vitafor.svg",
    badgeText: "Alta Performance",
  },
  {
    id: "growth-supplements",
    name: "Growth Supplements",
    slug: "growth-supplements",
    description:
      "Uma das maiores marcas nacionais, com suplementos acessíveis e de altíssima qualidade.",
    originCountry: "Brasil",
    logoUrl: "/brands/growth-supplements.svg",
    badgeText: "Mais Popular",
  },
  {
    id: "bvs-lab",
    name: "BVS Lab",
    slug: "bvs-lab",
    description:
      "Underground Series: pré-treinos de alta intensidade para treinos insanos.",
    originCountry: "Brasil",
    logoUrl: "/brands/bvs-lab.svg",
    badgeText: "Underground",
  },
  {
    id: "demons-lab",
    name: "Demons Lab",
    slug: "demons-lab",
    description:
      "The Strongest Pre Workout. Fórmulas extremas para quem não aceita mediocridade.",
    originCountry: "Brasil",
    logoUrl: "/brands/demons-lab.svg",
    badgeText: "The Strongest",
  },
  {
    id: "diabo-verde",
    name: "Diabo Verde",
    slug: "diabo-verde",
    description:
      "Proteína importada de alta qualidade, sem corantes artificiais e com ótimo custo-benefício.",
    originCountry: "Brasil",
    logoUrl: "/brands/diabo-verde.svg",
    badgeText: "Importada",
  },
  {
    id: "vitamin-horse",
    name: "Vitamin Horse",
    slug: "vitamin-horse",
    description:
      "Hipercalóricos de alta performance para quem precisa de volume muscular sério.",
    originCountry: "Brasil",
    logoUrl: "/brands/vitamin-horse.svg",
    badgeText: "Hipercalórico",
  },
  {
    id: "nutrata",
    name: "Nutrata",
    slug: "nutrata",
    description:
      "Especialista em barras proteicas e snacks fitness com sabores irresistíveis.",
    originCountry: "Brasil",
    logoUrl: "/brands/nutrata.svg",
    badgeText: "Barras & Snacks",
  },
  {
    id: "probiotica",
    name: "Probiótica",
    slug: "probiotica",
    description:
      "Tradição esportiva brasileira com suplementos de alta qualidade para todos os objetivos.",
    originCountry: "Brasil",
    logoUrl: "/brands/probiotica.svg",
    badgeText: "Tradição",
  },
  {
    id: "uevo",
    name: "Uêvo",
    slug: "uevo",
    description:
      "Proteína zero lactose e zero glúten para quem busca saúde sem abrir mão do sabor.",
    originCountry: "Brasil",
    logoUrl: "/brands/uevo.svg",
    badgeText: "Zero Lactose",
  },
  {
    id: "danone-yopro",
    name: "YoPRO",
    slug: "danone-yopro",
    description:
      "Shake proteico da Danone com 15g de proteína, zero adição de açúcares e prático para o dia a dia.",
    originCountry: "Brasil",
    logoUrl: "/brands/danone-yopro.svg",
    badgeText: "Shake Proteico",
  },
  {
    id: "italac",
    name: "Italac",
    slug: "italac",
    description:
      "Bebida láctea proteica zero lactose, perfeita para recuperação pós-treino.",
    originCountry: "Brasil",
    logoUrl: "/brands/italac.svg",
    badgeText: "Zero Lactose",
  },
  {
    id: "vigor",
    name: "Vigor",
    slug: "vigor",
    description:
      "Bebida láctea proteica rica e saborosa para a recuperação muscular do dia a dia.",
    originCountry: "Brasil",
    logoUrl: "/brands/vigor.svg",
    badgeText: "Bebida Proteica",
  },
  {
    id: "biovigor",
    name: "BioVigor",
    slug: "biovigor",
    description:
      "Suplementação natural com foco em vitalidade, energia e bem-estar.",
    originCountry: "Brasil",
    logoUrl: "/brands/biovigor.svg",
    badgeText: "Natural",
  },
  {
    id: "gecaps-latam",
    name: "Gecaps Latam",
    slug: "gecaps-latam",
    description:
      "Suplementação focada em saúde mental, sono e bem-estar com ingredientes de qualidade.",
    originCountry: "Brasil",
    logoUrl: "/brands/gecaps-latam.svg",
    badgeText: "Bem-Estar",
  },
];

export function getBrandById(id: string): Brand | undefined {
  return brands.find((brand) => brand.id === id);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((brand) => brand.slug === slug);
}
