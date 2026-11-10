import { FREE_SHIPPING_THRESHOLD, PIX_DISCOUNT_PERCENT } from "@/data/site";
import { formatBRL } from "@/lib/format";

const MESSAGES = [
  `Frete grátis Brasil acima de ${formatBRL(FREE_SHIPPING_THRESHOLD).replace(",00", "")}`,
  `${PIX_DISCOUNT_PERCENT}% OFF no Pix à vista`,
  "Suplementos 100% originais com laudo",
  "Parcelamento em até 10x sem juros",
  "Envio em até 24h",
];

export default function TopBanner() {
  const track = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden border-b border-[#C9A55C]/20 bg-[#0E0E12] text-zinc-300">
      <ul
        aria-label="Vantagens da loja"
        className="animate-marquee flex w-max items-center py-2 text-xs font-medium uppercase tracking-[0.14em] motion-reduce:animate-none"
      >
        {track.map((text, i) => (
          <li key={i} aria-hidden={i >= MESSAGES.length} className="flex items-center whitespace-nowrap">
            <span className="px-8">{text}</span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
          </li>
        ))}
      </ul>
    </div>
  );
}
