import type { Metadata } from "next";
import AdminDashboard, { type AdminProduct } from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import { getBaselineProduct, products } from "@/data/products";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/adminAuth";
import { loadStoreConfig } from "@/lib/storeConfig";

export const metadata: Metadata = {
  title: "Painel da Loja",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminLogin configured={isAdminConfigured()} />;
  }

  const catalog: AdminProduct[] = products.flatMap((p) => {
    const base = getBaselineProduct(p.id);
    if (!base) return [];
    return [
      {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brandName: p.brandName,
        imageUrl: p.imageUrl,
        color: p.model3DConfig.color,
        type: p.model3DConfig.type,
        inStock: p.inStock,
        base,
      },
    ];
  });

  return <AdminDashboard catalog={catalog} initialConfig={await loadStoreConfig()} />;
}
