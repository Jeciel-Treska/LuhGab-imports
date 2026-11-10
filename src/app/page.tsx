import type { Metadata } from "next";
import CategoryGrid from "@/components/CategoryGrid";
import BestSellers from "@/components/BestSellers";
import ComboKits from "@/components/ComboKits";
import FlashDeals from "@/components/FlashDeals";
import PromoHeroBanner from "@/components/PromoHeroBanner";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Hero/config vêm do /admin: nunca servir HTML estático do build.
export const dynamic = "force-dynamic";

// TestimonialsSection fica fora até existirem depoimentos reais (ver data/testimonials.ts).
export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <PromoHeroBanner />
      <div aria-hidden className="strip" />
      <CategoryGrid />
      <BestSellers />
      <FlashDeals />
      <ComboKits />
    </div>
  );
}
