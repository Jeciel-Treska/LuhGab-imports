"use client";

import { useEffect, useState } from "react";
import { buildWhatsAppUrl } from "@/data/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function FloatingWhatsApp() {
  const [hint, setHint] = useState(false);

  // Revela o tooltip uma vez, pouco depois do carregamento
  useEffect(() => {
    const show = setTimeout(() => setHint(true), 5000);
    const hide = setTimeout(() => setHint(false), 10000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <div className="group fixed bottom-4 right-4 z-40 flex items-center gap-3">
      <span
        role="tooltip"
        className={`pointer-events-none hidden max-w-[14rem] rounded-xl border border-white/10 bg-dark-card px-3 py-2 text-xs text-zinc-100 shadow-lg shadow-black/40 transition duration-300 group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 sm:block ${
          hint ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        }`}
      >
        Fale com um consultor especialista em suplementos
      </span>
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale com um consultor especialista em suplementos pelo WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50 motion-reduce:hidden"
        />
        <WhatsAppIcon className="relative h-7 w-7" aria-hidden />
      </a>
    </div>
  );
}
