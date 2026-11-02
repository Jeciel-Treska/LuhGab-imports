import { SHOW_RATINGS, SITE_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/data/site";
import type { Product } from "@/types/product";

type JsonObject = Record<string, unknown>;

interface JsonLdProps {
  data: JsonObject;
}

/** Injeta um bloco JSON-LD (escapa "<" para evitar fechamento prematuro do script). */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function organizationSchema(): JsonObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+${WHATSAPP_NUMBER}`,
        contactType: "customer service",
        areaServed: "BR",
        availableLanguage: "pt-BR",
      },
    ],
  };
}

export function productSchema(product: Product): JsonObject {
  const url = `${SITE_URL}/produto/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.id,
    image: [`${SITE_URL}${product.imageUrl ?? "/opengraph-image"}`],
    brand: { "@type": "Brand", name: product.brandName },
    offers: {
      "@type": "Offer",
      url,
      price: product.price.toFixed(2),
      priceCurrency: "BRL",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(SHOW_RATINGS && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
