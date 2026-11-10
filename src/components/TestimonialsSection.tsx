"use client";

import { useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { socialProofHighlight, testimonials, type Testimonial } from "@/data/testimonials";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#131318] p-6 shadow-sm transition-[border-color,transform] hover:border-[#E8D8B5]/25 hover:shadow-md sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 text-amber-400" aria-label={`Avaliação ${testimonial.rating} de 5`}>
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              size={16}
              aria-hidden
              className={index < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}
            />
          ))}
        </div>

        {testimonial.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
            <BadgeCheck size={13} aria-hidden />
            Compra Verificada
          </span>
        )}
      </div>

      <Quote size={24} className="text-zinc-300" aria-hidden />

      <p className="min-w-0 break-words text-sm leading-relaxed text-zinc-200 sm:text-base">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      <footer className="mt-auto flex items-center gap-3 border-t border-white/[0.06] pt-4">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
        >
          {initialsOf(testimonial.name)}
        </span>
        <div className="min-w-0 text-xs leading-tight">
          <p className="font-bold text-white">{testimonial.name}</p>
          <p className="text-zinc-400">
            {testimonial.city} • <time dateTime={testimonial.date}>{formatDate(testimonial.date)}</time>
          </p>
        </div>
      </footer>
    </article>
  );
}

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const current = testimonials[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <section aria-labelledby="depoimentos-titulo" className="border-t border-white/[0.07] bg-[#0E0E12] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {socialProofHighlight}
          </span>
          <h2 id="depoimentos-titulo" className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
            Quem Comprou, Recomenda
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Avaliações de atletas, praticantes e clientes que confiam na autenticidade e agilidade da LuhGab Imports.
          </p>
        </header>

        {/* Desktop: 3 cards */}
        <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-3">
          {testimonials.slice(0, 3).map((item) => (
            <TestimonialCard key={item.id} testimonial={item} />
          ))}
        </div>

        {/* Mobile: carrossel simples */}
        <div className="md:hidden">
          <TestimonialCard testimonial={current} />
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {index + 1} de {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Depoimento anterior"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#131318] shadow-sm transition hover:bg-white/[0.06]"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Próximo depoimento"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#131318] shadow-sm transition hover:bg-white/[0.06]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
