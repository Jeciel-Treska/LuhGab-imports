import type { Metadata } from "next";
import ProductCatalog from "@/components/ProductCatalog";
import { categoryLabels } from "@/data/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const CATALOG_DESCRIPTION =
  "Whey, creatina, pré-treino e vitaminas originais, nacionais e importados, com parcelamento em até 10x sem juros.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const category = first((await searchParams).categoria);
  if (category && Object.hasOwn(categoryLabels, category)) {
    const label = categoryLabels[category as keyof typeof categoryLabels];
    return {
      title: label,
      description: `${label} originais na LuhGab Imports, com parcelamento em até 10x sem juros.`,
      alternates: { canonical: `/produtos?categoria=${category}` },
    };
  }
  return {
    title: "Todos os Produtos",
    description: CATALOG_DESCRIPTION,
    alternates: { canonical: "/produtos" },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initial = {
    q: first(params.q),
    categoria: first(params.categoria),
    marca: first(params.marca),
    objetivo: first(params.objetivo),
    ofertas: first(params.ofertas) === "1",
  };

  // A chave remonta o catálogo quando a URL muda (nova busca, outra categoria)
  return <ProductCatalog key={JSON.stringify(initial)} initial={initial} />;
}
