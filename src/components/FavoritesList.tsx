"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/products";

export default function FavoritesList() {
  const { favorites } = useWishlist();
  const items = products.filter((p) => favorites.includes(p.id));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Meus Favoritos</h1>
      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-white/[0.07] bg-[#131318] px-6 py-16 text-center">
          <Heart className="h-10 w-10 text-amber-400" aria-hidden />
          <p className="text-lg font-semibold">Você ainda não favoritou nenhum produto</p>
          <Link
            href="/produtos"
            className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-dark"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {items.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
