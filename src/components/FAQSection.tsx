"use client";

import { useId, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faq, type FaqItem } from "@/data/faq";

interface FAQItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ item, isOpen, onToggle }: FAQItemProps) {
  const baseId = useId();
  const buttonId = `faq-button-${baseId}`;
  const panelId = `faq-panel-${baseId}`;

  return (
    <li
      className={`overflow-hidden rounded-2xl border bg-dark-card transition-colors duration-300 ${
        isOpen ? "border-gold-subtle" : "border-white/10 hover:border-[#E8D8B5]/25"
      }`}
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 p-5 text-left"
        >
          <span
            className={`text-sm font-medium leading-snug transition-colors duration-300 sm:text-base ${
              isOpen ? "text-gold-300" : "text-zinc-100"
            }`}
          >
            {item.question}
          </span>
          <ChevronDown
            size={20}
            aria-hidden
            className={`shrink-0 text-[#D4AF37] transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">{item.answer}</p>
        </div>
      </div>
    </li>
  );
}

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-dark shadow-gold">
          <HelpCircle size={22} strokeWidth={2.4} aria-hidden />
        </span>
        <p className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">Dúvidas frequentes</p>
        <h2 id="faq-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Tudo o que você precisa saber
        </h2>
      </header>

      <ul className="flex flex-col gap-3">
        {faq.map((item) => (
          <FAQAccordionItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
          />
        ))}
      </ul>
    </section>
  );
}
