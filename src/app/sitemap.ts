import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { SITE_URL } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...["/produtos", "/marcas", "/montar-combo"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...["/sobre", "/ajuda", "/rastreio", "/autenticidade", "/politica-de-privacidade", "/termos-de-uso"].map(
      (path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      }),
    ),
    ...products.map((product) => ({
      url: `${SITE_URL}/produto/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: product.isFeatured ? 0.9 : 0.7,
    })),
  ];
}
