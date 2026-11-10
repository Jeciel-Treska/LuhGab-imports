import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { breadcrumbSchema, productSchema } from "@/components/JsonLd";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import { applyStoreOverrides, getProductById, getProductBySlug, products } from "@/data/products";
import { loadStoreConfig } from "@/lib/storeConfig";
import { categoryLabels, SITE_NAME } from "@/data/site";
import { formatBRL } from "@/lib/format";
import type { Product } from "@/types/product";

type PageProps = { params: Promise<{ id: string }> };

/** Aceita id ou slug. */
const resolveProduct = async (id: string): Promise<Product | undefined> => {
  // Garante que preços e destaques do lojista valem também nesta camada de servidor.
  applyStoreOverrides((await loadStoreConfig()).products);
  return getProductById(id) ?? getProductBySlug(id);
};

export function generateStaticParams() {
  return products.map((product) => ({ id: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) return { title: "Produto não encontrado" };

  const title = `${product.name} por ${formatBRL(product.price)}`;
  const description = `${product.shortDescription} ${product.brandName}. Produto original na LuhGab Imports.`;
  const path = `/produto/${product.slug}`;
  const images = product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      locale: "pt_BR",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

const COMPLEMENTARY = {
  protein: ["energy", "health"],
  energy: ["protein", "health"],
  health: ["protein", "energy"],
} as const;

function getCrossSell(product: Product): Product[] {
  const wanted: readonly string[] = product.comboRole ? COMPLEMENTARY[product.comboRole] : [];
  return products
    .filter((p) => p.id !== product.id && p.inStock)
    .map((p) => ({
      p,
      score:
        (p.comboRole && wanted.includes(p.comboRole) ? 2 : 0) +
        (p.objective === product.objective ? 1 : 0) +
        (p.brandId === product.brandId ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .slice(0, 4)
    .map(({ p }) => p);
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) notFound();

  const categoryLabel = categoryLabels[product.category];
  const related = getCrossSell(product);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: categoryLabel, path: `/produtos?categoria=${product.category}` },
          { name: product.name, path: `/produto/${product.slug}` },
        ])}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-400">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[#C9A55C]">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/produtos?categoria=${product.category}`} className="hover:text-[#C9A55C]">
              {categoryLabel}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-zinc-400">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section aria-labelledby="cross-sell-title" className="mt-16">
          <h2 id="cross-sell-title" className="mb-6 text-2xl font-bold">
            Quem comprou este produto também comprou
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
