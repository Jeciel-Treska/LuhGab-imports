import type { Metadata } from "next";
import FavoritesList from "@/components/FavoritesList";

export const metadata: Metadata = {
  title: "Meus Favoritos",
  robots: { index: false },
};

export default function FavoritesPage() {
  return <FavoritesList />;
}
