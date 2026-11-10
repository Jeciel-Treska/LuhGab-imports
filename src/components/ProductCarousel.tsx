"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

interface ProductCarouselProps {
  products: Product[];
  label: string;
  cta?: string;
}

const STEP = 320;

const arrowCls =
  "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#08080A]/80 text-[#D4AF37] backdrop-blur-md transition-[opacity,background-color,color,border-color] duration-200 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black disabled:pointer-events-none disabled:opacity-0 sm:flex";

export default function ProductCarousel({ products, label, cta }: ProductCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, products.length]);

  const scroll = (dir: 1 | -1) => trackRef.current?.scrollBy({ left: dir * STEP, behavior: "smooth" });

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label} className="relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        disabled={!canPrev}
        aria-label={`${label}: produtos anteriores`}
        className={`${arrowCls} left-0 -translate-x-1/2`}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        disabled={!canNext}
        aria-label={`${label}: próximos produtos`}
        className={`${arrowCls} right-0 translate-x-1/2`}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <ul
        ref={trackRef}
        onScroll={update}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-6 pt-3 sm:mx-0 sm:gap-6 sm:px-0"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[270px] shrink-0 snap-start sm:w-[290px] lg:w-[300px]">
            <ProductCard product={product} cta={cta} />
          </li>
        ))}
      </ul>
    </div>
  );
}
