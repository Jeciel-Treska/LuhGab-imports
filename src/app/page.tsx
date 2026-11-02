import type { Metadata } from "next";
import CategoryGrid from "@/components/CategoryGrid";
import BestSellers from "@/components/BestSellers";
import ComboKits from "@/components/ComboKits";
import FlashDeals from "@/components/FlashDeals";
import PromoHeroBanner from "@/components/PromoHeroBanner";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// TestimonialsSection fica fora até existirem depoimentos reais (ver data/testimonials.ts).
export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <PromoHeroBanner />
      <CategoryGrid />
      <BestSellers />
      <FlashDeals />
      <ComboKits />
    </div>
  );
}
